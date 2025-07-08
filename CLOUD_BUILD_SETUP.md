# Cloud Build Setup Guide

This guide explains how to set up Cloud Build triggers for continuous deployment of the Nosilha application.

## Overview

The Nosilha project now includes Cloud Build triggers for automated deployment to Cloud Run whenever code is pushed to the `main` branch. This provides:

- **Automated Deployment**: Pushes to `main` branch trigger automatic builds and deployments
- **Free Tier Optimized**: Configured to work within Google Cloud's free tier limits
- **Hybrid CI/CD**: Maintains GitHub Actions for PR validation while using Cloud Build for deployment

## Architecture

```text
GitHub Repository (main branch)
         ↓
Cloud Build Triggers
    ↓         ↓
Backend     Frontend
Build       Build
    ↓         ↓
Cloud Run   Cloud Run
Services    Services
```

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GitHub Repository** connected to Cloud Build
3. **Required APIs** enabled (handled by Terraform)
4. **Service Accounts** configured (handled by Terraform)

## Setup Steps

### 1. Connect GitHub Repository to Cloud Build

**Option A: Using Google Cloud Console**

1. Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Connect Repository"
3. Select "GitHub (Cloud Build GitHub App)"
4. Authenticate with GitHub and select the `bravdigital/nosilha` repository
5. Click "Connect"

### Option B: Using gcloud CLI

```bash
# First, you need to connect your GitHub repository to Cloud Build
# This requires the Cloud Build GitHub App to be installed and authorized
# Visit: https://github.com/apps/google-cloud-build
# and install it for the bravdigital/nosilha repository

# After the GitHub App is installed, you can connect the repository:
gcloud alpha builds connections create github \
  --region=us-east1 \
  --connection-name=github-connection

# Then create a repository link
gcloud alpha builds repositories create \
  --region=us-east1 \
  --connection=github-connection \
  --repository-name=bravdigital/nosilha \
  --remote-uri=https://github.com/bravdigital/nosilha.git

# Note: The alpha commands are required for the new Cloud Build 2nd gen triggers
# For simpler setup, use the Cloud Console method above
```

### 2. Apply Terraform Configuration

```bash
cd infrastructure/terraform

# Initialize Terraform (if not already done)
terraform init

# Plan the changes
terraform plan

# Apply the Cloud Build configuration
terraform apply
```

This will create:

- Cloud Build triggers for backend and frontend
- Service account for Cloud Build operations
- Required IAM permissions
- All necessary infrastructure

### 3. Verify Setup

After applying Terraform:

1. **Check Triggers**: Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. **Verify Repository Connection**: Ensure `bravdigital/nosilha` is connected
3. **Test Trigger**: Push a commit to the `main` branch
4. **Monitor Build**: Go to [Cloud Build > History](https://console.cloud.google.com/cloud-build/builds)

## Cloud Build Configuration

### Backend Build (`backend/cloudbuild.yaml`)

- **Language**: Kotlin with Spring Boot
- **Build Tool**: Gradle
- **Container Registry**: Google Artifact Registry
- **Deployment**: Cloud Run with health checks
- **Build Time**: ~15-20 minutes
- **Resources**: 2 vCPU, 8GB RAM

### Frontend Build (`frontend/cloudbuild.yaml`)

- **Language**: TypeScript with Next.js
- **Build Tool**: npm
- **Container Registry**: Google Artifact Registry
- **Deployment**: Cloud Run with health checks
- **Build Time**: ~10-15 minutes
- **Resources**: 2 vCPU, 8GB RAM

## Free Tier Considerations

Google Cloud Build free tier includes:

- **120 build minutes per day**
- **10 concurrent builds**
- **Storage for build artifacts**

Our configuration is optimized for free tier usage:

- Efficient build steps with caching
- Parallel execution where possible
- Reasonable timeouts (15-20 minutes per build)
- Optimized Docker images

## Service Accounts and Permissions

The Cloud Build service account has these permissions:

- `roles/artifactregistry.writer` - Push container images
- `roles/run.developer` - Deploy to Cloud Run
- `roles/secretmanager.secretAccessor` - Access deployment secrets
- `roles/iam.serviceAccountUser` - Use service accounts
- `roles/viewer` - Read project resources
- `roles/storage.admin` - Manage build artifacts
- `roles/logging.logWriter` - Create build logs

## Monitoring and Troubleshooting

### Build Logs

- **Console**: [Cloud Build > History](https://console.cloud.google.com/cloud-build/builds)
- **CLI**: `gcloud builds log <BUILD_ID>`

### Common Issues

1. **Repository Not Connected**
   - **Error**: `INVALID_ARGUMENT: Request contains an invalid argument`
   - **Solution**: You must first connect the GitHub repository to Cloud Build
   - **Steps**:
     1. Install Cloud Build GitHub App: https://github.com/apps/google-cloud-build
     2. Connect repository in Cloud Build console
     3. Then apply Terraform configuration
   - **Verify**: Check [Cloud Build > Repositories](https://console.cloud.google.com/cloud-build/repos)

2. **Build Timeout**
   - Solution: Increase timeout in `cloudbuild.yaml`
   - Check: Free tier limits (120 minutes/day)

3. **Permission Errors**
   - Solution: Verify service account roles
   - Check: IAM permissions in Terraform

4. **Health Check Failures**
   - Solution: Verify application starts correctly
   - Check: Service logs in Cloud Run console

5. **GitHub App Installation Issues**
   - **Error**: Cannot create triggers for unconnected repository
   - **Solution**: Ensure the Cloud Build GitHub App is installed for the `bravdigital` organization
   - **Steps**:
     1. Go to GitHub organization settings
     2. Check installed GitHub Apps
     3. Install or configure Google Cloud Build app
     4. Grant access to the `nosilha` repository

### Build Status

You can check build status:

- **GitHub**: Build status appears on commits
- **Cloud Build**: Real-time build logs and history
- **Cloud Run**: Deployment status and health

## Security Considerations

- **Service Account**: Minimal required permissions
- **GitHub Integration**: Uses GitHub App for secure authentication
- **Secrets**: Stored in Google Secret Manager
- **Container Images**: Scanned for vulnerabilities
- **Network**: Private Google Cloud network

## Cost Optimization

- **Free Tier**: Stays within daily build minute limits
- **Caching**: Docker layer caching for faster builds
- **Parallel Builds**: Only builds changed services
- **Resource Limits**: Appropriate CPU/memory allocation

## Hybrid CI/CD Strategy

This setup maintains a hybrid approach:

**GitHub Actions** (for PR validation):

- Code quality checks
- Security scanning
- Unit tests
- Integration tests

**Cloud Build** (for deployment):

- Container image building
- Cloud Run deployment
- Health verification
- Production releases

This approach maximizes the benefits of both platforms while staying within free tier limits.

## Next Steps

1. **Test the Setup**: Push a commit to `main` and verify deployment
2. **Monitor Usage**: Track build minutes and costs
3. **Optimize Builds**: Improve build times and caching
4. **Add Notifications**: Set up build status notifications
5. **Documentation**: Update team documentation with new workflow
