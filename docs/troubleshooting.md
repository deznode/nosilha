# Troubleshooting Guide

Quick reference for resolving common issues in the Nos Ilha platform.

## Quick Diagnostics

| Issue Type | First Command |
|------------|---------------|
| Backend won't start | `cd infrastructure/docker && docker compose ps` |
| Frontend build fails | `cd apps/web && pnpm run lint && npx tsc --noEmit` |
| Database connection | `docker compose exec db psql -U nosilha -d nosilha_db -c "\dt"` |
| Cloud Run errors | `gcloud logging read 'resource.type="cloud_run_revision" AND severity>="ERROR"' --limit=20` |

---

## Local Development

### Docker/PostgreSQL Issues

**PostgreSQL container won't start**
```bash
cd infrastructure/docker

# Check container status
docker compose ps

# Restart database
docker compose down && docker compose up -d

# Verify database is accepting connections
docker compose exec db psql -U nosilha -d nosilha_db -c "SELECT 1"
```

**Port 5432 already in use**
```bash
# Find process using port
lsof -i :5432

# Stop local PostgreSQL (macOS)
brew services stop postgresql

# Or kill the process
kill -9 <PID>
```

**Data persistence issues**
```bash
# Reset database completely (WARNING: deletes all data)
cd infrastructure/docker
docker compose down -v
rm -rf ./data
docker compose up -d
```

### Backend (Spring Boot)

**Database connection refused**

| Check | Command |
|-------|---------|
| Container running | `docker compose ps` |
| Connection string | Verify `DATABASE_URL` in environment |
| Port mapping | Ensure `5432:5432` in docker-compose.yml |

```bash
# Start with local profile
cd apps/api
./gradlew bootRun --args='--spring.profiles.active=local'
```

**Flyway migration fails**
```bash
# Check migration files for syntax errors
ls apps/api/src/main/resources/db/migration/

# Repair Flyway checksum issues
./gradlew flywayRepair

# View migration status
./gradlew flywayInfo
```

**Build fails with Kotlin errors**
```bash
# Clean build
./gradlew clean build --stacktrace

# Check Kotlin style
./gradlew ktlintCheck
```

**Docker Compose file not found when running from IntelliJ**

Symptom: `IllegalArgumentException: 'files' content [../../infrastructure/docker/docker-compose.yml] must exist`

The relative path in `application-local.yml` is relative to `apps/api/`, but IntelliJ defaults the working directory to the project root.

Fix: In IntelliJ, go to **Run > Edit Configurations** and set **Working directory** to `$MODULE_DIR$` (or the absolute path to `apps/api`).

**Docker container name conflict on startup**

Symptom: `The container name "/nosilha-postgres-local" is already in use`

This happens when Docker Compose derives a project name from the directory name (e.g., `docker`) that differs from the one used when the container was originally created (e.g., `nosilha`).

Fix: Ensure `infrastructure/docker/docker-compose.yml` has `name: nosilha` at the top level. If the conflict persists, remove the orphaned container:
```bash
docker rm nosilha-postgres-local
```

### Frontend (Next.js)

**Dependencies won't install**
```bash
cd apps/web

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript errors**
```bash
# Check types
npx tsc --noEmit

# Run linter
pnpm run lint
```

**Build fails with Velite errors**
```bash
# Velite processes MDX content during build
# Check content files exist
ls content/

# Clear Next.js cache
rm -rf .next
pnpm run build
```

**Environment variables not loading**
```bash
# Verify .env.local exists and contains required variables
cat apps/web/.env.local

# Required variables:
# NEXT_PUBLIC_API_URL=http://localhost:8080
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

---

## Authentication

### JWT/Supabase Issues

**JWT validation fails**

| Symptom | Solution |
|---------|----------|
| 401 Unauthorized | Check `SUPABASE_JWT_SECRET` matches Supabase project |
| Token expired | Refresh token in frontend auth store |
| Invalid signature | Verify ES256 algorithm configuration |

```bash
# Verify backend JWT configuration
# Check apps/api/src/main/resources/application.yml

# Decode JWT for debugging (use jwt.io or)
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq
```

**CORS errors**
```bash
# Check backend CORS settings in application-local.yml
# Ensure allowed origins include http://localhost:3000
```

**Storybook/Chromatic builds fail without Supabase**
```bash
# Set environment variable to use stub client
NEXT_PUBLIC_SUPABASE_USE_STUB=true pnpm run storybook
# Or set STORYBOOK=true
```

---

## Database

### Connection Issues

**Connection timeout**
```bash
# Test database connectivity
docker compose exec db psql -U nosilha -d nosilha_db -c "\conninfo"

# Check connection pool settings
# apps/api/src/main/resources/application.yml (HikariCP config)
```

**"relation does not exist" error**
```bash
# Run migrations
./gradlew flywayMigrate

# Check if tables exist
docker compose exec db psql -U nosilha -d nosilha_db -c "\dt"
```

### Single Table Inheritance Issues

**Entity mapping errors**
```bash
# Verify discriminator values match database entries
docker compose exec db psql -U nosilha -d nosilha_db \
  -c "SELECT DISTINCT entry_type FROM directory_entries"

# Check entity annotations in:
# apps/api/src/main/kotlin/com/nosilha/core/places/domain/
```

---

## CI/CD Pipeline

### Build Failures

| Workflow | Debug Command |
|----------|---------------|
| Backend | `cd apps/api && ./gradlew build --stacktrace` |
| Frontend | `cd apps/web && pnpm build` |
| Infrastructure | `cd infrastructure/terraform && terraform validate` |

**Docker build fails in CI**
```bash
# Test Docker build locally
cd apps/api && ./gradlew bootBuildImage
cd apps/web && docker build -t test-frontend .

# Verify GCP authentication (for CI)
# Check GCP_SA_KEY secret is valid JSON
```

**"Advanced Security must be enabled" warnings**

These are expected for repositories without GitHub Advanced Security license. Workflows use `continue-on-error: true` to prevent failures.

### Terraform Issues

**State lock errors**
```bash
# Force unlock (use with caution)
cd infrastructure/terraform
terraform force-unlock LOCK_ID

# Check for active locks
terraform init
```

**Drift detection**
```bash
terraform plan -detailed-exitcode
# Exit code 2 = drift detected
```

---

## Cloud Run Deployment

### Service Health

**Health check fails**
```bash
# Test health endpoint
curl -f https://nosilha-backend-api-xxx.run.app/actuator/health

# View service status
gcloud run services describe nosilha-backend-api --region=us-east1

# Check recent logs
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND severity>="ERROR"' --limit=20 --freshness=1h
```

**Service won't start**

| Common Cause | Solution |
|--------------|----------|
| Cold start timeout | Increase memory to 1Gi |
| Database unreachable | Verify Supabase connection string |
| Secret access denied | Check service account permissions |
| Port misconfiguration | Ensure app listens on $PORT |

```bash
# Check startup errors
gcloud logging read 'resource.type="cloud_run_revision" AND textPayload:"APPLICATION FAILED TO START"' --limit=10

# Verify environment variables
gcloud run services describe nosilha-backend-api --region=us-east1 --format="export"
```

### Logs and Debugging

**View live logs**
```bash
gcloud beta run services logs tail nosilha-backend-api --region=us-east1

# Filter by severity
gcloud beta run services logs tail nosilha-backend-api --region=us-east1 --log-filter="severity>=ERROR"
```

**Advanced log filtering**
```bash
# Filter by time range (last 24 hours)
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api"' --limit=100 --freshness=24h

# Formatted table output
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND severity>="WARNING"' --limit=30 --format="table(timestamp,severity,textPayload)"

# Search for specific error patterns
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND textPayload:"[ERROR-PATTERN]"' --limit=20
```

**Database connection issues in production**
```bash
# PostgreSQL connection errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND (textPayload:"connection" OR textPayload:"postgresql")' --limit=20

# SQL and JDBC errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND (textPayload:"SQLException" OR textPayload:"JDBC" OR textPayload:"PSQLException")' --limit=20

# Flyway migration errors
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND textPayload:"flyway"' --limit=15
```

**Spring Boot application errors**
```bash
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="nosilha-backend-api" AND (textPayload:"org.springframework" OR textPayload:"APPLICATION FAILED TO START")' --limit=20
```

### Useful gcloud Aliases

Add these to your `~/.bashrc` or `~/.zshrc` for quick Cloud Run diagnostics:

```bash
# Cloud Run error logs
alias crlogserr='gcloud logging read "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$1\" AND severity>=\"ERROR\"" --limit=20 --freshness=1h'

# Describe Cloud Run service
alias crdesc='gcloud run services describe "$1" --region="$2"'

# Tail Cloud Run logs
alias crtail='gcloud beta run services logs tail "$1" --region="$2"'
```

Usage:
```bash
crlogserr nosilha-backend-api
crdesc nosilha-backend-api us-east1
crtail nosilha-backend-api us-east1
```

### Secret Manager

**Permission denied accessing secrets**
```bash
# Check service account permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:SERVICE_ACCOUNT_EMAIL"

# Required role: roles/secretmanager.secretAccessor
```

**Secret not updating after rotation**
1. Verify Terraform version number is updated
2. Check Cloud Run revision uses new version
3. Force new deployment if needed

---

## Performance

### Frontend Slow Loading

```bash
# Analyze bundle size
cd apps/web
pnpm build
npx @next/bundle-analyzer

# Check ISR cache settings in apps/web/src/lib/api.ts
# Default: 1 hour for listings, 30 min for entries
```

### Backend API Response Times

```bash
# Check database query performance
docker compose exec db psql -U nosilha -d nosilha_db \
  -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"

# Monitor connection pool
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
```

---

## Quick Reference

### Environment URLs

| Service | Local URL |
|---------|-----------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1/ |
| PostgreSQL | localhost:5432 |
| Health Check | http://localhost:8080/actuator/health |

### Production URLs

| Service | URL |
|---------|-----|
| Backend API | `gcloud run services describe nosilha-backend-api --format="value(status.url)"` |
| Frontend | `gcloud run services describe nosilha-frontend --format="value(status.url)"` |

### Essential Commands

```bash
# Start local development
cd infrastructure/docker && docker compose up -d
cd apps/api && ./gradlew bootRun --args='--spring.profiles.active=local'
cd apps/web && pnpm dev

# Run tests
cd apps/api && ./gradlew test
cd apps/web && pnpm run test:e2e  # Local only

# Deploy manually
gh workflow run backend-ci.yml --ref main -f deploy=true
gh workflow run frontend-ci.yml --ref main -f deploy=true
```

---

## Related Documentation

- [CI/CD Pipeline](ci-cd-pipeline.md) - Detailed workflow configuration
- [Secret Management](secret-management.md) - GCP Secret Manager guide
- [Architecture](architecture.md) - System design and module structure
- [SECURITY.md](../SECURITY.md) - Security policy and vulnerability reporting
