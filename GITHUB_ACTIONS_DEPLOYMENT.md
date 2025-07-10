# GitHub Actions Deployment Guide

This guide explains the 100% free tier CI/CD setup for the Nosilha project using GitHub Actions for deployment to Google Cloud Run.

## Overview

The Nosilha project uses GitHub Actions for automated deployment, providing:

- **100% Free for Public Repositories**: Unlimited CI/CD minutes on GitHub Actions
- **Native GitHub Integration**: Built-in security scanning, dependency management, and workflow orchestration
- **Google Cloud Free Tier**: Deploys to Cloud Run with generous free tier (2M requests/month)
- **Secret Manager Integration**: Uses Google Secret Manager free tier (10,000 operations/month)
- **No External Dependencies**: Self-contained within GitHub ecosystem

## Architecture

```text
GitHub Repository (main branch)
         ↓
GitHub Actions Workflows
    ↓         ↓
Backend     Frontend
Build       Build
    ↓         ↓
Google      Google
Artifact    Artifact
Registry    Registry
    ↓         ↓
Cloud Run   Cloud Run
Services    Services
```

## Prerequisites

1. **GitHub Repository** (already configured)
2. **Google Cloud Project** with billing enabled
3. **Required APIs** enabled (handled by Terraform)
4. **Service Accounts** configured (handled by Terraform)
5. **GitHub Secrets** configured for GCP authentication

## Current CI/CD Workflows

### Backend Workflow (`backend-ci.yml`)

**Triggers:**
- Push to `main` branch (with backend changes)
- Pull requests to `main` branch
- Manual dispatch

**Jobs:**
1. **Security Scanning**: Trivy vulnerability scanning with SARIF reports
2. **Code Quality**: Kotlin detekt linting and formatting
3. **Testing**: Unit tests with JaCoCo coverage reporting
4. **Build**: Docker image build and push to Artifact Registry
5. **Deploy**: Production deployment to Cloud Run

**Key Features:**
- **Free Security Scanning**: Built-in Trivy vulnerability scanning
- **Comprehensive Testing**: Unit tests, coverage reports, and quality gates
- **Optimized Builds**: Gradle caching and efficient Docker builds
- **Secret Management**: Uses Google Secret Manager for sensitive configuration
- **Health Checks**: Automated deployment verification

### Frontend Workflow (`frontend-ci.yml`)

**Triggers:**
- Push to `main` branch (with frontend changes)
- Pull requests to `main` branch
- Manual dispatch

**Jobs:**
1. **Security Scanning**: Trivy vulnerability scanning with SARIF reports
2. **Code Quality**: ESLint with SARIF reporting
3. **Testing**: TypeScript checking and build validation
4. **Bundle Analysis**: Bundle size analysis for PRs
5. **Build**: Docker image build and push to Artifact Registry
6. **Deploy**: Production deployment to Cloud Run

**Key Features:**
- **Free Security Scanning**: Built-in vulnerability and dependency scanning
- **Bundle Size Monitoring**: Automatic bundle size analysis
- **TypeScript Validation**: Full type checking and build validation
- **Docker Layer Caching**: Efficient builds with GitHub Actions cache
- **Performance Optimization**: Minimal resource usage (512Mi memory)

## Free Tier Resource Usage

### GitHub Actions (Free Tier)
- **Public Repositories**: Unlimited CI/CD minutes
- **Private Repositories**: 2,000 minutes/month (if needed)
- **Storage**: 500 MB for artifacts and caches
- **Concurrent Jobs**: 20 jobs (more than sufficient)

### Google Cloud (Free Tier)
- **Cloud Run**: 2M requests, 400K GB-seconds, 200K vCPU-seconds per month
- **Artifact Registry**: 0.5 GB storage per month
- **Secret Manager**: 10,000 access operations per month
- **Cloud Storage**: 5 GB per month (for Terraform state)

## Security Features

### Built-in GitHub Security
- **Dependabot**: Automatic dependency updates and vulnerability alerts
- **CodeQL**: Code scanning for security vulnerabilities
- **Secret Scanning**: Prevents accidental secret commits
- **SARIF Integration**: Security findings in GitHub Security tab

### Deployment Security
- **Service Accounts**: Minimal required permissions
- **Secret Manager**: Secure storage of sensitive configuration
- **Container Scanning**: Trivy vulnerability scanning
- **Environment Protection**: Production environment controls

## Required GitHub Secrets

Configure these secrets in your GitHub repository:

1. **`GCP_SA_KEY`**: Google Cloud service account key (JSON format)
2. **`GCP_PROJECT_ID`**: Google Cloud project ID

## Setup Instructions

### 1. Configure Google Cloud Infrastructure

```bash
# Navigate to Terraform directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure (creates service accounts, APIs, etc.)
terraform apply
```

### 2. Set up Google Secret Manager

```bash
# Run the secrets setup script
./scripts/setup-secrets.sh
```

This creates the required secrets:
- `gcp-project-id`: Your Google Cloud project ID
- `gcs-bucket-name`: Media storage bucket name
- `nosilha-api-url`: Backend API URL for frontend configuration

### 3. Configure GitHub Repository

1. **Add GitHub Secrets**:
   - Go to GitHub repository > Settings > Secrets and variables > Actions
   - Add `GCP_SA_KEY` with the service account key from Terraform output
   - Add `GCP_PROJECT_ID` with your Google Cloud project ID

2. **Enable GitHub Security Features**:
   - Go to Settings > Code security and analysis
   - Enable Dependabot alerts and security updates
   - Enable CodeQL analysis (if available)
   - Enable secret scanning

### 4. Test Deployment

1. **Push to Main Branch**:
   ```bash
   git push origin main
   ```

2. **Monitor Workflows**:
   - Go to Actions tab in GitHub repository
   - Watch backend and frontend workflows execute
   - Verify successful deployment

3. **Verify Services**:
   - Check Cloud Run console for deployed services
   - Test application endpoints

## Monitoring and Troubleshooting

### GitHub Actions Monitoring
- **Workflow Logs**: Detailed logs available in Actions tab
- **Build Status**: Status badges show current deployment status
- **Failure Notifications**: Email notifications for failed builds

### Google Cloud Monitoring
- **Cloud Run Logs**: Application logs available in Cloud Console
- **Metrics**: Request count, latency, and error rates
- **Health Checks**: Automatic health validation after deployment

### Common Issues and Solutions

1. **Authentication Failures**
   - **Issue**: Service account permissions
   - **Solution**: Verify IAM roles in Terraform configuration

2. **Build Failures**
   - **Issue**: Dependency or compilation errors
   - **Solution**: Check workflow logs and fix source code issues

3. **Deployment Timeouts**
   - **Issue**: Health checks failing
   - **Solution**: Verify application starts correctly and health endpoints work

4. **Secret Access Errors**
   - **Issue**: Secret Manager permissions
   - **Solution**: Run `./scripts/setup-secrets.sh` and verify IAM permissions

## Cost Optimization

### Free Tier Compliance
- **GitHub Actions**: Unlimited for public repositories
- **Cloud Run**: Min instances set to 0 for cost optimization
- **Secret Manager**: Well within 10,000 operations/month limit
- **Artifact Registry**: Images cleaned up automatically

### Resource Optimization
- **Efficient Builds**: Docker layer caching and dependency caching
- **Minimal Resources**: 512Mi memory for frontend, 1Gi for backend
- **Auto-scaling**: Scale to zero when not in use
- **Smart Triggers**: Only build when relevant files change

## CI/CD Best Practices

### Security
- **Least Privilege**: Service accounts have minimal required permissions
- **Secret Management**: All sensitive data stored in Secret Manager
- **Vulnerability Scanning**: Automated security scanning on every build
- **Dependency Management**: Automated dependency updates

### Performance
- **Parallel Builds**: Backend and frontend build independently
- **Caching**: Aggressive caching for dependencies and Docker layers
- **Efficient Triggers**: Path-based triggering to avoid unnecessary builds
- **Resource Limits**: Appropriate resource allocation for each service

### Quality
- **Comprehensive Testing**: Unit tests, linting, and type checking
- **Coverage Reports**: Automated coverage reporting
- **Bundle Analysis**: Frontend bundle size monitoring
- **Health Checks**: Automated deployment verification

## Next Steps

1. **Test the Setup**: Push a commit to `main` and verify automatic deployment
2. **Monitor Usage**: Track GitHub Actions usage and Cloud Run metrics
3. **Optimize Performance**: Fine-tune resource allocation and build times
4. **Add Monitoring**: Set up additional monitoring and alerting
5. **Team Documentation**: Create team-specific deployment procedures

## Troubleshooting Commands

```bash
# Check service status
gcloud run services describe nosilha-backend-api --region=us-east1
gcloud run services describe nosilha-frontend --region=us-east1

# View service logs
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=nosilha-backend-api" --limit=50

# Test health endpoints
curl -f "https://YOUR-SERVICE-URL/actuator/health"  # Backend
curl -f "https://YOUR-SERVICE-URL/"                 # Frontend

# Check secret access
gcloud secrets versions access latest --secret="gcp-project-id"
```

This setup provides a robust, secure, and cost-effective CI/CD pipeline using only free tier services while maintaining enterprise-grade security and reliability features.