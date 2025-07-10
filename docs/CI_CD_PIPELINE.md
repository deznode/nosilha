# CI/CD Pipeline Documentation

This document provides comprehensive guidance for the Nos Ilha CI/CD pipeline - a community-supported, open-source project with cost-optimized infrastructure for sustainable deployment.

## 🏗️ Pipeline Overview

The CI/CD pipeline is built using GitHub Actions and supports:

- **Modular CI/CD architecture** with service-specific workflows
- **Production-only deployment** (single environment for cost optimization)
- **Branch-based workflow** (main → production)
- **Quality gates** (testing, linting, security scanning)
- **Automated deployments** to Google Cloud Run
- **Infrastructure as Code** with Terraform

## 🔧 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │   Google Cloud  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Feature Dev │ │───▶│ │ Pull Request│ │    │ │  Production │ │
│ │             │ │    │ │  Validation │ │    │ │ Environment │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Main Branch │ │───▶│ │ Build &     │ │───▶│ │ Artifact    │ │
│ │             │ │    │ │ Deploy      │ │    │ │ Registry    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Required Tools
- **Terraform** v1.12.2+
- **Google Cloud SDK (gcloud)**
- **Docker**
- **Git**
- **Node.js 18+** and npm
- **Java 21** (OpenJDK or Oracle JDK)

### Google Cloud Setup

1. **Create a GCP Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     secretmanager.googleapis.com \
     cloudbuild.googleapis.com \
     storage.googleapis.com \
     iam.googleapis.com \
     monitoring.googleapis.com
   ```

3. **Set up Billing** (required for Cloud Run)
   - Link a billing account to your project in the GCP Console

## 🚀 Quick Setup Guide

### Step 1: Create Terraform State Bucket
Before running Terraform, create the state bucket manually:

```bash
gcloud storage buckets create gs://nosilha-terraform-state-bucket \
  --location=us-east1 \
  --uniform-bucket-level-access
```

### Step 2: Configure Terraform Variables
Create a `terraform.tfvars` file in `infrastructure/terraform/`:

```hcl
# Required variables
gcp_project_id = "your-project-id"
gcp_region     = "us-east1"

# Optional: For cost monitoring
billing_account_id = "your-billing-account-id"
budget_notification_channels = ["your-notification-channel-id"]

# Image tags (will be overridden by CI/CD)
api_image_tag      = "latest"
frontend_image_tag = "latest"
```

### Step 3: Deploy Infrastructure
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

This creates:
- ✅ GCS bucket for media storage
- ✅ Artifact Registry repositories
- ✅ Cloud Run services (initially with placeholder images)
- ✅ IAM service accounts and permissions
- ✅ Monitoring and budget alerts

### Step 4: Configure GitHub Secrets
Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Get the service account key from Terraform output
terraform output -raw cicd_service_account_key | base64 -d > cicd-key.json

# Add to GitHub secrets:
# GCP_SA_KEY: Contents of cicd-key.json (base64 encoded)
# GCP_PROJECT_ID: Your GCP project ID
# PRODUCTION_API_URL: https://your-backend-service-url
```

### Step 5: Create Required Secrets in Google Secret Manager
```bash
# Database configuration (update with your actual values)
gcloud secrets create supabase_db_url --data-file=- <<< "jdbc:postgresql://your-db-host:5432/your-db"
gcloud secrets create supabase_db_username --data-file=- <<< "your-db-username"
gcloud secrets create supabase_db_password --data-file=- <<< "your-db-password"
gcloud secrets create supabase_jwt_secret --data-file=- <<< "your-jwt-secret"
```

## 🔄 CI/CD Workflows

### 1. Backend Workflow (`backend-ci.yml`)

**Triggers:**
- Push to `main` branch (with backend changes)
- Pull requests to `main` branch
- Manual dispatch

**Quality Gates:**
- **Security Scanning** - Trivy vulnerability scanner with SARIF reports
- **Backend Linting** - Kotlin detekt static analysis
- **Backend Testing** - JUnit tests with PostgreSQL integration and Jacoco coverage
- **Docker Build** - Multi-stage container builds
- **Deployment** - Google Cloud Run deployment with health checks

### 2. Frontend Workflow (`frontend-ci.yml`)

**Triggers:**
- Push to `main` branch (with frontend changes)
- Pull requests to `main` branch
- Manual dispatch

**Quality Gates:**
- **Security Scanning** - Trivy vulnerability scanner with SARIF reports
- **Frontend Linting** - ESLint with SARIF output
- **Type Checking** - TypeScript compilation and validation
- **Bundle Analysis** - Bundle size monitoring for PRs
- **Docker Build** - Optimized Next.js container builds
- **Deployment** - Google Cloud Run deployment

### 3. Infrastructure Workflow (`infrastructure-ci.yml`)

**Triggers:**
- Push to `main` branch (with infrastructure changes)
- Pull requests to `main` branch
- Manual dispatch

**Quality Gates:**
- **Security Scanning** - tfsec infrastructure security scan
- **Terraform Validation** - Format, validate, and plan
- **Deployment** - Terraform apply on main branch only

### 4. PR Validation Workflow (`pr-validation.yml`)

**Triggers:**
- Pull requests to `main` branch

**Features:**
- Consolidated validation across all services
- Automated PR comments with validation results
- Security findings uploaded to GitHub Security tab
- Auto-merge for Dependabot PRs when checks pass

### 5. Integration Testing (`integration-ci.yml`)

**Features:**
- Cross-service integration tests
- API endpoint validation
- End-to-end testing scenarios
- Performance validation

## 🎯 Environment Configuration

### Production Environment
- **Backend Service:** `nosilha-backend-api`
- **Frontend Service:** `nosilha-frontend`
- **Resources:** 
  - Backend: 1Gi memory, 1 CPU, 0-10 instances
  - Frontend: 512Mi memory, 1 CPU, 0-10 instances
- **Spring Profile:** `production`
- **Region:** `us-east1`
- **Cost Optimization:** Min instances set to 0, auto-scaling enabled

## 🔐 Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Google Cloud Platform
```bash
GCP_PROJECT_ID              # Your GCP project ID
GCP_SA_KEY                  # Service account JSON key (base64 encoded)
```

### Environment Configuration
```bash
PRODUCTION_API_URL          # Backend URL for production frontend
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN    # Mapbox API token
NEXT_PUBLIC_SUPABASE_URL           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anonymous key
```

## 🛡️ Security Features

### Built-in Security (Available Without Advanced Security)
- **Trivy Scanner** - Container and dependency vulnerability scanning
- **Static Analysis** - detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **Basic Dependency Review** - Automated dependency vulnerability checking
- **SARIF Integration** - Security findings uploaded to GitHub Security tab

### GitHub Advanced Security (Requires License for Private Repos)
- **CodeQL Analysis** - Automated semantic code analysis
- **Secret Scanning** - Detects accidentally committed secrets
- **Advanced Dependency Review** - Enhanced vulnerability checking

### Service Account Permissions
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

## 📊 Deployment Process

### Continuous Deployment
The CI/CD pipeline automatically deploys when you push to the `main` branch:

1. **Code Changes** → Push to `main`
2. **Security Scanning** → Trivy, detekt, ESLint, tfsec
3. **Testing** → Unit tests, type checking, Terraform validation
4. **Building** → Docker images built and pushed to Artifact Registry
5. **Deployment** → Cloud Run services updated with new images
6. **Monitoring** → Health checks and monitoring alerts

### Manual Deployment
You can also trigger deployments manually:

```bash
# Deploy specific service
gh workflow run backend-ci.yml --ref main -f deploy=true
gh workflow run frontend-ci.yml --ref main -f deploy=true

# Deploy infrastructure changes
gh workflow run infrastructure-ci.yml --ref main
```

### Local Development Deployment
Use the deployment script for manual deployments:

```bash
# Deploy to production
./scripts/deploy.sh production all latest

# Deploy backend to production with specific version
./scripts/deploy.sh production backend v1.0.0
```

## 🔍 Monitoring and Observability

### Cloud Run Metrics
- **Request latency** and **error rates** are automatically tracked
- **Instance scaling** metrics available in Cloud Console
- **Application logs** streamed to Cloud Logging

### Custom Metrics
The backend exposes these endpoints for monitoring:
- `/actuator/health` - Application health check
- `/actuator/metrics` - Application metrics
- `/actuator/info` - Build and application info

### Cost Monitoring
- **Free Tier Usage**: Cloud Run (2M requests/month), Artifact Registry (0.5GB), Secret Manager (10K operations/month)
- **Budget Alerts**: Configured for $50/month with notifications
- **Resource Optimization**: Auto-scaling to zero, minimal resource allocation

## 🔧 Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push and create PR: `gh pr create`
4. CI/CD runs validation (no deployment)
5. After review, merge to `main`
6. Automatic deployment to production

### Hotfix Process
1. Create hotfix branch: `git checkout -b hotfix/urgent-fix`
2. Make minimal changes
3. Create PR with `[HOTFIX]` in title
4. Fast-track review and merge
5. Automatic production deployment

## 🆘 Troubleshooting

### Common Issues

**1. Authentication Failures**
```bash
# Check service account permissions
gcloud projects get-iam-policy $GCP_PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SA_EMAIL"
```

**2. Build Failures**
```bash
# Check Docker build logs
docker build -t test-image .

# Validate Gradle build
./gradlew build --stacktrace
```

**3. Deployment Failures**
```bash
# Check Cloud Run service logs
gcloud logs read --service=nosilha-backend-api --limit=50

# Verify service account permissions
gcloud projects get-iam-policy $GCP_PROJECT_ID
```

**4. Health Check Failures**
```bash
# Test health endpoint directly
curl -v https://your-service-url/actuator/health

# Check environment variables
gcloud run services describe nosilha-backend-api --region=us-east1
```

### Debug Commands
```bash
# List all images in registry
gcloud artifacts docker images list us-east1-docker.pkg.dev/$GCP_PROJECT_ID/nosilha-backend
gcloud artifacts docker images list us-east1-docker.pkg.dev/$GCP_PROJECT_ID/nosilha-frontend

# Check Cloud Run services
gcloud run services list --region=us-east1

# View deployment logs
gcloud logging read "resource.type=cloud_run_revision" --limit=100
```

## 🎯 Service URLs

After deployment, get your service URLs:

```bash
# Get service URLs
terraform output backend_api_service_url
terraform output frontend_ui_service_url

# Check service health
curl https://your-backend-url/actuator/health
curl https://your-frontend-url/
```

## 📈 Best Practices

### Branch Strategy
1. **Feature branches** → `main` (production deployment)
2. **Hotfix branches** → `main` (immediate production fix)

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

## 🔄 Maintenance

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

## ✅ Success Checklist

After completing this setup, you should have:

- ✅ **Infrastructure deployed** with Terraform
- ✅ **CI/CD pipelines** running automatically
- ✅ **Security scanning** integrated
- ✅ **Monitoring and alerts** configured
- ✅ **Cost controls** in place
- ✅ **Services accessible** via public URLs
- ✅ **Development workflow** established

---

For questions or issues with the CI/CD pipeline, please create an issue in the repository or refer to the [Security Policy](./SECURITY.md) for security-related concerns.