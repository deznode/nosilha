# CI/CD Pipeline Setup

This document describes the continuous integration and deployment pipeline for the Nos Ilha platform.

## Overview

The CI/CD pipeline is built using GitHub Actions and supports:

- **Multi-environment deployments** (staging, production)
- **Branch-based workflow** (develop → staging, main → production)
- **Service-specific builds** (backend, frontend, infrastructure)
- **Quality gates** (testing, linting, security scanning)
- **Automated deployments** to Google Cloud Run
- **Infrastructure as Code** with Terraform

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │   Google Cloud  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Feature Dev │ │───▶│ │ Pull Request│ │    │ │   Staging   │ │
│ └─────────────┘ │    │ │  Validation │ │    │ │ Environment │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ Develop     │ │───▶│ ┌─────────────┐ │───▶│ ┌─────────────┐ │
│ │ Branch      │ │    │ │ Build &     │ │    │ │ Production  │ │
│ └─────────────┘ │    │ │ Deploy      │ │    │ │ Environment │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ Main Branch │ │───▶│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ │Infrastructure│ │───▶│ │ Artifact    │ │
│                 │    │ │ Deployment  │ │    │ │ Registry    │ │
└─────────────────┘    │ └─────────────┘ │    │ └─────────────┘ │
                       └─────────────────┘    └─────────────────┘
```

## Workflows

### 1. PR Validation (`.github/workflows/pr-checks.yml`)

Runs on every pull request to `main` or `develop` branches.

**Quality Gates:**
- **Security Scanning** - Trivy vulnerability scanner
- **Backend Linting** - Kotlin detekt static analysis
- **Frontend Linting** - ESLint with SARIF output
- **Backend Testing** - JUnit tests with coverage reports
- **Frontend Testing** - TypeScript checking and build validation
- **Infrastructure Validation** - Terraform fmt, validate, and tfsec security scan
- **Bundle Size Check** - Frontend bundle size analysis

**Features:**
- Automated PR comments with validation results
- Security findings uploaded to GitHub Security tab
- Test coverage reports via Codecov
- Auto-merge for Dependabot PRs when all checks pass

### 2. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Runs on pushes to `main` and `develop` branches, plus manual workflow dispatch.

**Build Process:**
1. **Change Detection** - Only builds changed services
2. **Testing** - Full test suite for affected services
3. **Docker Image Building** - Multi-architecture container builds
4. **Image Registry** - Google Artifact Registry (us-central1-docker.pkg.dev)
5. **Deployment** - Google Cloud Run deployment
6. **Health Checks** - Post-deployment validation

**Deployment Strategy:**
- `develop` branch → **staging** environment
- `main` branch → **production** environment
- Infrastructure changes only deploy on `main` branch

## Environment Configuration

### Staging Environment
- **Backend:** `nosilha-backend-staging`
- **Frontend:** `nosilha-frontend-staging`
- **Resources:** 1Gi memory, 1 CPU, 0-10 instances
- **Spring Profile:** `staging`

### Production Environment
- **Backend:** `nosilha-backend`
- **Frontend:** `nosilha-frontend`
- **Resources:** 2Gi memory, 2 CPU, 1-100 instances
- **Spring Profile:** `production`

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Google Cloud Platform
```bash
GCP_PROJECT_ID              # Your GCP project ID
GCP_SA_KEY                  # Service account JSON key (base64 encoded)
```

### Environment URLs
```bash
STAGING_API_URL             # Backend URL for staging frontend
PRODUCTION_API_URL          # Backend URL for production frontend
```

### Optional (for enhanced features)
```bash
CODECOV_TOKEN              # For test coverage reports
SLACK_WEBHOOK              # For deployment notifications
```

## Service Account Permissions

The GCP service account needs these IAM roles:

```bash
# Artifact Registry
roles/artifactregistry.admin

# Cloud Run
roles/run.admin

# Service Account User (for deployment)
roles/iam.serviceAccountUser

# Secret Manager (for configuration)
roles/secretmanager.accessor
```

## Local Development

### Running Tests
```bash
# Backend tests
cd backend
./gradlew test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Manual Deployment
Use the deployment script for manual deployments:

```bash
# Deploy to staging
./scripts/deploy.sh staging all latest

# Deploy backend to production
./scripts/deploy.sh production backend v1.0.0

# Deploy frontend to staging with specific tag
./scripts/deploy.sh staging frontend develop-abc123
```

### Environment Variables for Local Deployment
```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="europe-west1"
export STAGING_API_URL="https://your-staging-backend-url"
export PRODUCTION_API_URL="https://your-production-backend-url"
```

## Monitoring and Observability

### Cloud Run Metrics
- **Request latency** and **error rates** are automatically tracked
- **Instance scaling** metrics available in Cloud Console
- **Application logs** streamed to Cloud Logging

### Custom Metrics
The backend exposes these endpoints for monitoring:
- `/actuator/health` - Application health check
- `/actuator/metrics` - Application metrics
- `/actuator/info` - Build and application info

### Alerts (Recommended Setup)
1. **High error rate** (>5% 4xx/5xx responses)
2. **High latency** (>2s average response time)
3. **Instance scaling** (max instances reached)
4. **Database connection** issues

## Security Considerations

### Image Security
- **Trivy scanner** runs on all pull requests
- **Minimal base images** (distroless for production)
- **No secrets in images** (all config via environment variables)

### Network Security
- **HTTPS only** for all external communication
- **CORS configuration** restricts allowed origins
- **JWT authentication** for API access

### Secrets Management
- **GitHub Secrets** for CI/CD configuration
- **Google Secret Manager** for runtime secrets
- **Environment variables** for non-sensitive configuration

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check Docker build logs
docker build -t test-image .

# Validate Gradle build
./gradlew build --stacktrace
```

**Deployment Failures:**
```bash
# Check Cloud Run service logs
gcloud logs read --service=nosilha-backend --limit=50

# Verify service account permissions
gcloud projects get-iam-policy $GCP_PROJECT_ID
```

**Health Check Failures:**
```bash
# Test health endpoint directly
curl -v https://your-service-url/actuator/health

# Check environment variables
gcloud run services describe nosilha-backend --region=europe-west1
```

### Debug Commands
```bash
# List all images in registry
gcloud artifacts docker images list us-central1-docker.pkg.dev/$GCP_PROJECT_ID/docker-repo

# Check Cloud Run services
gcloud run services list --region=europe-west1

# View deployment logs
gcloud logging read "resource.type=cloud_run_revision" --limit=100
```

## Best Practices

### Branch Strategy
1. **Feature branches** → `develop` (staging deployment)
2. **Release branches** → `main` (production deployment)
3. **Hotfix branches** → `main` (immediate production fix)

### Deployment Strategy
1. **Blue-green deployments** via Cloud Run traffic splitting
2. **Database migrations** run automatically via Flyway
3. **Zero-downtime deployments** with health checks
4. **Rollback capability** via container image tags

### Security Practices
1. **Least privilege** service account permissions
2. **Encrypted secrets** in GitHub and Secret Manager
3. **Regular dependency updates** via Dependabot
4. **Security scanning** on every PR

## Integration with External Services

### Monitoring Integration
```yaml
# Example: Datadog integration
- name: Deploy with Datadog tracking
  run: |
    datadog-ci deployment --service=nosilha --version=${{ github.sha }}
```

### Slack Notifications
```yaml
# Example: Slack deployment notifications
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Maintenance

### Regular Tasks
1. **Update GitHub Actions** versions quarterly
2. **Review and rotate** service account keys annually
3. **Update base Docker images** monthly
4. **Clean up old images** from registry monthly

### Monitoring Tasks
1. **Review deployment metrics** weekly
2. **Check error rates** and **performance** daily
3. **Update alerting thresholds** as application grows
4. **Audit security findings** from automated scans

---

For questions or issues with the CI/CD pipeline, please create an issue in the repository or contact the DevOps team.