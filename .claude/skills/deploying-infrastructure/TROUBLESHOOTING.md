# CI/CD Troubleshooting Guide

This guide provides solutions for common CI/CD pipeline issues encountered in the Nos Ilha platform deployment workflows.

## Common GitHub Actions Workflow Failures

### Issue 1: Artifact Registry Authentication Errors

**Symptom**: Backend workflow fails during `bootBuildImage` with authentication errors to Artifact Registry

**Error Message**:
```
Error: failed to push image to registry: authentication failed
```

**Root Cause**: OIDC workload identity not configured correctly or missing permissions

**Solution**:

1. **Verify Workload Identity Configuration**:
```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=github-actions-pool
```

2. **Check Service Account Permissions**:
```bash
gcloud projects get-iam-policy nosilha \
  --flatten="bindings[].members" \
  --filter="bindings.members:nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com"
```

3. **Required Roles**:
   - `roles/artifactregistry.writer`
   - `roles/run.admin`
   - `roles/iam.serviceAccountUser`

4. **Re-authenticate Workflow**:
   - Verify `google-github-actions/auth@v2` step in workflow
   - Ensure `workload_identity_provider` and `service_account` are correct

### Issue 2: bootBuildImage Fails with Memory Issues

**Symptom**: Backend build fails during image creation with out-of-memory errors

**Error Message**:
```
Error: Gradle Worker Daemon exceeded available memory
```

**Root Cause**: Insufficient memory allocated to Gradle daemon

**Solution**:

Update `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

Or run with explicit memory settings:
```bash
./gradlew bootBuildImage --max-workers=1 -Xmx2048m
```

### Issue 3: Frontend Docker Build Fails

**Symptom**: Frontend workflow fails during Docker build step

**Error Message**:
```
Error: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

**Root Cause**: Missing environment variables during build or dependency issues

**Solution**:

1. **Check Build-Time Environment Variables**:
```dockerfile
# Ensure all NEXT_PUBLIC_ variables in Dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

2. **Verify Dependencies Installed**:
```bash
docker build --target deps --tag test-deps .
docker run test-deps npm list
```

3. **Test Local Build**:
```bash
cd frontend
npm install
npm run build
```

### Issue 4: Cloud Run Deployment Timeout

**Symptom**: Cloud Run deployment times out waiting for service to become ready

**Error Message**:
```
Error: Revision failed to become ready
```

**Root Cause**: Health check failures or startup time exceeding timeout

**Solution**:

1. **Check Service Logs**:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend" \
  --limit=50 --format=json
```

2. **Verify Health Endpoint**:
```bash
# For backend (Spring Boot)
curl https://backend-service-url/actuator/health

# For frontend (Next.js)
curl https://frontend-service-url/api/health
```

3. **Increase Startup Timeout** (if legitimate slow startup):
```bash
gcloud run services update backend \
  --timeout=300 \
  --region=us-east1
```

4. **Check Resource Limits**:
```bash
gcloud run services describe backend \
  --region=us-east1 \
  --format='value(spec.template.spec.containers[0].resources.limits)'
```

### Issue 5: Terraform State Lock Errors

**Symptom**: Infrastructure workflow fails with state lock acquisition errors

**Error Message**:
```
Error: Error acquiring the state lock
```

**Root Cause**: Previous Terraform operation did not release lock or concurrent runs

**Solution**:

1. **Check for Running Workflows**:
   - Review GitHub Actions for in-progress infrastructure workflows
   - Wait for concurrent runs to complete

2. **Force Unlock** (use with caution):
```bash
terraform force-unlock <LOCK_ID>
```

3. **Prevent Concurrent Runs** (workflow file):
```yaml
concurrency:
  group: terraform-${{ github.ref }}
  cancel-in-progress: false
```

### Issue 6: Security Scan Failures Blocking Deployment

**Symptom**: Workflow fails due to critical vulnerabilities detected

**Error Message**:
```
Error: Trivy scan found critical vulnerabilities
```

**Root Cause**: Container image or dependencies have known vulnerabilities

**Solution**:

1. **Review Scan Results**:
```bash
# Check GitHub Actions run logs for vulnerability details
# Or run locally:
trivy image <image-name>
```

2. **Update Dependencies**:
```bash
# Backend
./gradlew dependencyUpdates

# Frontend
npm audit fix
npm update
```

3. **Suppress False Positives** (use sparingly):
```yaml
# .trivyignore
CVE-2024-XXXXX  # Reason: False positive - library not used in runtime
```

4. **Rebuild Base Images**:
```bash
# Backend: Update Spring Boot parent version in build.gradle.kts
# Frontend: Update Node.js base image in Dockerfile
```

## Deployment Validation Issues

### Issue 7: Health Check Failures After Deployment

**Symptom**: Deployment succeeds but health checks fail

**Root Cause**: Service configuration issues or missing dependencies

**Solution**:

1. **Verify Database Connectivity**:
```bash
# Check if service can reach PostgreSQL
gcloud run services describe backend --region=us-east1 \
  --format='value(spec.template.metadata.annotations.run.googleapis.com/vpc-access-connector)'
```

2. **Check Secret Manager Access**:
```bash
# Verify service account has Secret Manager access
gcloud secrets get-iam-policy DATABASE_URL
```

3. **Review Service Environment**:
```bash
gcloud run services describe backend --region=us-east1 \
  --format='value(spec.template.spec.containers[0].env)'
```

4. **Test Health Endpoint Locally**:
```bash
# Run with same environment configuration
docker run -e DATABASE_URL="jdbc:postgresql://..." <image> \
  curl http://localhost:8080/actuator/health
```

### Issue 8: Database Migration Failures

**Symptom**: Backend service fails to start due to Flyway migration errors

**Error Message**:
```
Error: Migration failed - SQL syntax error
```

**Root Cause**: Invalid SQL in migration file or migration ordering issues

**Solution**:

1. **Test Migration Locally**:
```bash
cd backend
./gradlew flywayMigrate -i
```

2. **Validate Migration Syntax**:
```bash
# Check SQL syntax
psql -f backend/src/main/resources/db/migration/V023__migration.sql
```

3. **Check Migration History**:
```bash
./gradlew flywayInfo
```

4. **Rollback if Needed**:
```bash
# Manual rollback to previous version
./gradlew flywayUndo
```

### Issue 9: Environment Variable Configuration Errors

**Symptom**: Service starts but features fail due to missing configuration

**Root Cause**: Missing or incorrect environment variables in Secret Manager

**Solution**:

1. **List Required Secrets**:
```bash
# Backend
- DATABASE_URL
- DATABASE_USERNAME
- DATABASE_PASSWORD
- SUPABASE_JWT_SECRET

# Frontend
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2. **Verify Secret Manager Configuration**:
```bash
gcloud secrets list
gcloud secrets versions access latest --secret="DATABASE_URL"
```

3. **Update Cloud Run Service Environment**:
```bash
gcloud run services update backend \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --region=us-east1
```

## Cost & Performance Issues

### Issue 10: Unexpected GCP Cost Increases

**Symptom**: Monthly GCP costs exceed $50 budget

**Root Cause**: Services not scaling to zero or excessive resource allocation

**Solution**:

1. **Check Cloud Run Scaling**:
```bash
gcloud run services describe backend --region=us-east1 \
  --format='value(spec.template.spec.containers[0].resources.limits,spec.template.metadata.annotations.autoscaling.knative.dev/minScale)'
```

2. **Verify Scale-to-Zero Configuration**:
```yaml
# Should show minScale: 0
autoscaling.knative.dev/minScale: "0"
```

3. **Review Artifact Registry Usage**:
```bash
gcloud artifacts docker images list us-east1-docker.pkg.dev/nosilha/nosilha-images
```

4. **Delete Old Container Images**:
```bash
# Delete images older than 30 days
gcloud artifacts docker images list us-east1-docker.pkg.dev/nosilha/nosilha-images \
  --filter="createTime<2024-12-01" --format="get(image)" | xargs -I {} gcloud artifacts docker images delete {}
```

### Issue 11: Slow Deployment Times

**Symptom**: Deployments taking >10 minutes consistently

**Root Cause**: Inefficient Docker builds or missing layer caching

**Solution**:

1. **Enable Docker Buildx Caching** (frontend):
```yaml
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

2. **Optimize Dockerfile Layer Order**:
```dockerfile
# Install dependencies first (rarely changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code (changes frequently)
COPY . .
RUN npm run build
```

3. **Use Path-Based Triggering**:
```yaml
on:
  push:
    paths:
      - 'backend/**'  # Only run when backend files change
```

4. **Parallel Job Execution**:
```yaml
jobs:
  build:
    strategy:
      matrix:
        service: [backend, frontend]
```

## Debugging Workflow Issues

### General Debugging Steps

1. **Enable Workflow Debug Logging**:
   - Go to GitHub repository Settings → Secrets
   - Add secret: `ACTIONS_RUNNER_DEBUG = true`
   - Add secret: `ACTIONS_STEP_DEBUG = true`

2. **Check Workflow Syntax**:
```bash
# Install act for local workflow testing
act -l  # List workflows
act push  # Run push event workflows locally
```

3. **Review Workflow Run Logs**:
   - GitHub Actions → Select failed run → Click on failed job
   - Expand steps to see detailed error messages
   - Download logs for offline analysis

4. **Test Commands Locally**:
```bash
# Reproduce workflow commands in local environment
docker run --rm -it <image> /bin/sh
# Run failing command inside container
```

### Common Error Patterns

**Authentication Errors**:
- Check OIDC workload identity configuration
- Verify service account permissions
- Ensure GitHub repository settings allow workload identity

**Build Errors**:
- Verify all dependencies available
- Check environment variable configuration
- Test build locally before pushing

**Deployment Errors**:
- Validate health check endpoints respond correctly
- Check service logs for startup errors
- Verify database connectivity and migrations

**Security Scan Errors**:
- Update vulnerable dependencies
- Review and suppress false positives appropriately
- Rebuild base images with security patches

## Quick Reference

**Check Service Status**:
```bash
gcloud run services list --region=us-east1
gcloud run services describe <service-name> --region=us-east1
```

**View Service Logs**:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=<service-name>" \
  --limit=50 --format=json
```

**Test Health Endpoints**:
```bash
# Backend
curl https://backend-url/actuator/health

# Frontend
curl https://frontend-url/api/health
```

**Check Workflow Runs**:
```bash
gh run list --workflow=backend-ci.yml
gh run view <run-id> --log-failed
```

**Verify Secrets**:
```bash
gcloud secrets list
gcloud secrets versions access latest --secret=<secret-name>
```

**Monitor Costs**:
- GCP Console → Billing → Reports
- Filter by service (Cloud Run, Artifact Registry)
- Review month-over-month trends

**Reference**: `docs/CI_CD_PIPELINE.md` for comprehensive CI/CD architecture and additional troubleshooting
