# CI/CD Quick Setup Guide

This guide will help you set up the CI/CD pipeline for the Nos Ilha project in 10 minutes.

## Prerequisites Checklist

- [ ] Google Cloud Project created
- [ ] GitHub repository access
- [ ] `gcloud` CLI installed and authenticated
- [ ] Docker installed (for local testing)

## Step 1: Google Cloud Setup

### 1.1 Create Service Account
```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create service account
gcloud iam service-accounts create nosilha-cicd \
    --display-name="Nos Ilha CI/CD Service Account"

# Get service account email
export SA_EMAIL="nosilha-cicd@${PROJECT_ID}.iam.gserviceaccount.com"
```

### 1.2 Grant Required Permissions
```bash
# Cloud Run permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

# Container Registry permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

# Service Account User role
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# Secret Manager access (optional)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.accessor"
```

### 1.3 Create and Download Service Account Key
```bash
# Create key file
gcloud iam service-accounts keys create ~/nosilha-sa-key.json \
    --iam-account=$SA_EMAIL

# Base64 encode the key for GitHub Secrets
base64 -i ~/nosilha-sa-key.json
# Copy this output for GitHub Secrets
```

### 1.4 Enable Required APIs
```bash
# Enable necessary APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Step 2: GitHub Repository Setup

### 2.1 Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | your-project-id | Your Google Cloud project ID |
| `GCP_SA_KEY` | base64-encoded-key | The base64 encoded service account key |
| `STAGING_API_URL` | TBD | Backend URL for staging (set after first deploy) |
| `PRODUCTION_API_URL` | TBD | Backend URL for production (set after first deploy) |

### 2.2 Create Environment Protection Rules
1. Go to Settings → Environments
2. Create `staging` environment
3. Create `production` environment  
4. For production, add protection rules:
   - Required reviewers
   - Wait timer (optional)
   - Deployment branches: `main` only

## Step 3: Initial Deployment

### 3.1 Deploy Staging (from develop branch)
```bash
# Create and switch to develop branch if it doesn't exist
git checkout -b develop

# Push to trigger staging deployment
git push origin develop
```

### 3.2 Deploy Production (from main branch)
```bash
# Merge develop to main when ready for production
git checkout main
git merge develop
git push origin main
```

## Step 4: Verify Setup

### 4.1 Check GitHub Actions
1. Go to your repository → Actions tab
2. Verify workflows are running successfully
3. Check for any error messages in logs

### 4.2 Check Cloud Run Services
```bash
# List deployed services
gcloud run services list --region=europe-west1

# Check service status
gcloud run services describe nosilha-backend-staging --region=europe-west1
gcloud run services describe nosilha-frontend-staging --region=europe-west1
```

### 4.3 Test Deployed Services
```bash
# Test backend health endpoint
curl https://your-backend-url/actuator/health

# Test frontend
curl https://your-frontend-url
```

## Step 5: Update Configuration

### 5.1 Update GitHub Secrets with Actual URLs
After first deployment, update these secrets with actual URLs:

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe nosilha-backend-staging \
    --region=europe-west1 --format="value(status.url)")

# Get frontend URL  
FRONTEND_URL=$(gcloud run services describe nosilha-frontend-staging \
    --region=europe-west1 --format="value(status.url)")

echo "Staging Backend URL: $BACKEND_URL"
echo "Staging Frontend URL: $FRONTEND_URL"
```

Update `STAGING_API_URL` and `PRODUCTION_API_URL` in GitHub Secrets.

### 5.2 Configure CORS (Backend)
Update your backend's allowed origins to include the frontend URLs:

```yaml
# In application-staging.yml
app:
  cors:
    allowed-origins: https://your-frontend-staging-url,https://your-frontend-production-url
```

## Step 6: Test Full Pipeline

### 6.1 Create Test PR
```bash
# Create feature branch
git checkout -b feature/test-cicd

# Make a small change
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"

# Push and create PR
git push origin feature/test-cicd
```

### 6.2 Verify PR Checks
1. Go to GitHub → Pull Requests
2. Open your test PR
3. Verify all checks pass:
   - ✅ Security scan
   - ✅ Backend tests
   - ✅ Frontend linting
   - ✅ Build validation

### 6.3 Test Deployment
1. Merge PR to `develop` → triggers staging deployment
2. Merge `develop` to `main` → triggers production deployment

## Common Issues & Solutions

### Issue: "Permission denied" during deployment
**Solution:** Verify service account has all required roles:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SA_EMAIL"
```

### Issue: "Image not found" during deployment
**Solution:** Check if images were built and pushed:
```bash
gcloud artifacts docker images list us-central1-docker.pkg.dev/$PROJECT_ID/docker-repo
```

### Issue: "Service not responding" after deployment
**Solution:** Check Cloud Run logs:
```bash
gcloud logs read --service=nosilha-backend --limit=50
```

### Issue: Frontend can't connect to backend
**Solution:** Verify CORS configuration and API URLs in environment variables.

## Success Checklist

- [ ] All GitHub Actions workflows run successfully
- [ ] Staging services deployed and accessible
- [ ] Production services deployed and accessible  
- [ ] Frontend connects to backend APIs
- [ ] Health checks pass
- [ ] PR validation works correctly
- [ ] Branch-based deployments work (develop→staging, main→production)

## Next Steps

1. **Set up monitoring** (see CICD.md for details)
2. **Configure alerts** for production services
3. **Set up database backups** 
4. **Implement blue-green deployments** for zero-downtime releases
5. **Add integration tests** to the pipeline

## Support

If you encounter issues:
1. Check the detailed [CI/CD documentation](./CICD.md)
2. Review GitHub Actions logs for error details
3. Check Cloud Run service logs via Cloud Console
4. Create an issue in the repository with error details

---

🎉 **Congratulations!** Your CI/CD pipeline is now set up and ready for development.