# Troubleshooting Guide

This document provides solutions to common issues encountered when developing and deploying the Nos Ilha platform.

## Development Environment Issues

### Backend fails to start with database connection errors

**Solution**:
```bash
# Check if PostgreSQL is running via Docker
cd infrastructure/docker && docker-compose ps

# Restart PostgreSQL service
docker-compose restart postgres

# Verify database connectivity
docker-compose exec postgres psql -U nosilha -d nosilha_db -c "\dt"
```
**File Reference**: `infrastructure/docker/docker-compose.yml:82-95`

### Frontend API calls fail with CORS errors

**Solution**:
```bash
# Check backend CORS configuration
# File: apps/api/src/main/resources/application-local.yml:8
# Ensure CORS_ALLOWED_ORIGINS includes frontend URL
```

### JWT authentication fails between frontend and backend

**Solution**:
```bash
# Verify Supabase configuration
# File: apps/web/src/lib/supabase-client.ts
# Check environment variables in .env.local

# Storybook/Chromatic builds without Supabase secrets
# Set NEXT_PUBLIC_SUPABASE_USE_STUB=true (or STORYBOOK=true) so Storybook
# uses the local stub client when NEXT_PUBLIC_SUPABASE_* are unavailable.
# This prevents build failures during visual-regression runs.

# Verify backend JWT secret configuration
# File: apps/api/src/main/resources/application.yml:54-55
```

## CI/CD Pipeline Issues

### Workflow fails with "Advanced Security must be enabled" warnings

**Solution**: These warnings are expected for repositories without GitHub Advanced Security license. Workflows use `continue-on-error: true` to prevent failures.

**File Reference**: All workflow files use this pattern for SARIF uploads

### Docker build fails in CI/CD

**Solution**:
```bash
# Check Artifact Registry authentication
# File: .github/workflows/backend-ci.yml:106-112
# Verify GCP_SA_KEY secret is valid JSON

# Test Docker build locally
cd apps/api && ./gradlew bootBuildImage
cd apps/web && docker build -t test-frontend .
```

### Terraform state lock errors

**Solution**: Infrastructure workflows include automatic state lock cleanup

**File Reference**: `infrastructure-ci.yml:106-125`, `226-244`

## Production Deployment Issues

### Cloud Run service fails health checks

**Solution**:
```bash
# Check service logs
gcloud logs read --service=nosilha-backend-api --limit=50

# Verify environment variables
gcloud run services describe nosilha-backend-api --region=us-east1

# Test health endpoint
curl -f https://your-service-url/actuator/health
```
**File Reference**: `backend-ci.yml:173-182`, `frontend-ci.yml:252-261`

### Media uploads fail to GCS

**Solution**:
```bash
# Check service account permissions
# File: infrastructure/terraform/iam.tf:74-79
# Verify backend service account has storage.objectAdmin role

# Check bucket configuration
# File: infrastructure/terraform/main.tf:28-43
```

## Database Issues

### Flyway migration fails

**Solution**:
```bash
# Check migration file syntax
# Directory: apps/api/src/main/resources/db/migration/

# Manual migration repair if needed
./gradlew flywayRepair
```

### Single Table Inheritance mapping errors

**Solution**:
```bash
# Verify entity discriminator values
# File: apps/api/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt:22-47
# Check subclass @DiscriminatorValue annotations
```

## Security & Permissions Issues

### GitHub Actions workflow permission denied

**Solution**:
```bash
# Verify GitHub secrets are configured:
# - GCP_SA_KEY (base64 encoded service account JSON)
# - GCP_PROJECT_ID
# - All NEXT_PUBLIC_* variables

# Check service account permissions in GCP Console
# File: infrastructure/terraform/iam.tf for required roles
```

## Performance Issues

### Frontend pages load slowly

**Solution**:
```bash
# Check ISR cache configuration
# File: apps/web/src/lib/api.ts:77-80 (1 hour cache)
# File: apps/web/src/lib/api.ts:107-109 (30 min cache)

# Review bundle size
npm run build && npx bundlesize
```

### Backend API response times are high

**Solution**:
```bash
# Check database connection pool settings
# File: apps/api/src/main/resources/application.yml:19-21

# Monitor with Actuator endpoints
curl https://your-backend-url/actuator/metrics
```

## Getting Help

For additional support:
1. **CI/CD Issues**: Refer to `docs/CI_CD_PIPELINE.md` and `docs/CI_CD_TESTING.md`
2. **Security Issues**: Follow procedures in `docs/SECURITY.md`
3. **Architecture Questions**: Review `CLAUDE.md` and `docs/ARCHITECTURE.md`
4. **Infrastructure Issues**: Check Terraform state and GCP Console for resource status
