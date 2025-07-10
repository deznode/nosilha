# Deployment Guide

This guide walks through the complete CI/CD pipeline setup and deployment process for the Nos Ilha project.

## 🏗️ Infrastructure Overview

The project uses a **modular CI/CD architecture** with the following components:

### **Core Infrastructure (Terraform)**
- **Google Cloud Storage**: Media storage bucket with public read access
- **Google Artifact Registry**: Container image repositories for backend and frontend
- **Google Cloud Run**: Serverless container hosting for both services
- **Google Secret Manager**: Secure configuration management
- **Google Cloud Storage**: Terraform state management with versioning
- **Google Cloud Monitoring**: Cost budgets and service monitoring

### **CI/CD Pipelines**
- **Backend CI/CD**: Spring Boot/Kotlin service pipeline
- **Frontend CI/CD**: Next.js/React application pipeline  
- **Infrastructure CI/CD**: Terraform infrastructure management
- **Security**: Comprehensive vulnerability scanning and SARIF reporting

## 📋 Prerequisites

### **Required Tools**
- **Terraform** v1.12.2+
- **Google Cloud SDK (gcloud)**
- **Docker**
- **Git**

### **Google Cloud Setup**
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

## 🚀 Initial Infrastructure Setup

### **Step 1: Create Terraform State Bucket**
Before running Terraform, create the state bucket manually:

```bash
gcloud storage buckets create gs://nosilha-terraform-state-bucket \
  --location=us-east1 \
  --uniform-bucket-level-access
```

### **Step 2: Configure Terraform Variables**
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

### **Step 3: Deploy Infrastructure**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

This will create:
- ✅ GCS bucket for media storage
- ✅ Artifact Registry repositories
- ✅ Cloud Run services (initially with placeholder images)
- ✅ IAM service accounts and permissions
- ✅ Monitoring and budget alerts

## 🔐 CI/CD Setup

### **Step 4: Configure GitHub Secrets**
Add the following secrets to your GitHub repository:

```bash
# Get the service account key from Terraform output
terraform output -raw cicd_service_account_key | base64 -d > cicd-key.json

# Add to GitHub secrets:
# GCP_SA_KEY: Contents of cicd-key.json
# GCP_PROJECT_ID: Your GCP project ID
# PRODUCTION_API_URL: https://your-backend-service-url
```

### **Step 5: Create Required Secrets in Google Secret Manager**
```bash
# Database configuration (update with your actual values)
gcloud secrets create supabase_db_url --data-file=- <<< "jdbc:postgresql://your-db-host:5432/your-db"
gcloud secrets create supabase_db_username --data-file=- <<< "your-db-username"
gcloud secrets create supabase_db_password --data-file=- <<< "your-db-password"
gcloud secrets create supabase_jwt_secret --data-file=- <<< "your-jwt-secret"
```

## 📦 Deployment Process

### **Continuous Deployment**
The CI/CD pipeline automatically deploys when you push to the `main` branch:

1. **Code Changes** → Push to `main`
2. **Security Scanning** → Trivy, detekt, ESLint, tfsec
3. **Testing** → Unit tests, type checking, Terraform validation
4. **Building** → Docker images built and pushed to Artifact Registry
5. **Deployment** → Cloud Run services updated with new images
6. **Monitoring** → Health checks and monitoring alerts

### **Manual Deployment**
You can also trigger deployments manually:

```bash
# Deploy specific service
gh workflow run backend-ci.yml --ref main -f deploy=true
gh workflow run frontend-ci.yml --ref main -f deploy=true

# Deploy infrastructure changes
gh workflow run infrastructure-ci.yml --ref main
```

## 🔄 CI/CD Pipeline Features

### **🔒 Security & Compliance**
- **Vulnerability Scanning**: Trivy scans dependencies and container images
- **Static Analysis**: detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **SARIF Integration**: Security findings uploaded to GitHub Security tab
- **Dependency Review**: Automated vulnerability and license checking

### **🧪 Testing & Quality**
- **Backend**: JUnit tests with PostgreSQL integration, Jacoco coverage
- **Frontend**: ESLint, TypeScript checking, bundle size monitoring
- **Infrastructure**: Terraform validation, plan review, drift detection

### **📊 Monitoring & Alerts**
- **Cost Monitoring**: Budget alerts at 50%, 80%, and 100% of monthly limit
- **Service Monitoring**: Uptime checks for both backend and frontend
- **Resource Monitoring**: CPU, memory, and storage usage dashboards
- **Drift Detection**: Automated infrastructure configuration drift detection

## 🎯 Service URLs

After deployment, your services will be available at:

```bash
# Get service URLs
terraform output backend_api_service_url
terraform output frontend_ui_service_url

# Check service health
curl https://your-backend-url/actuator/health
curl https://your-frontend-url/
```

## 🔧 Development Workflow

### **Feature Development**
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push and create PR: `gh pr create`
4. CI/CD runs validation (no deployment)
5. After review, merge to `main`
6. Automatic deployment to production

### **Hotfix Process**
1. Create hotfix branch: `git checkout -b hotfix/urgent-fix`
2. Make minimal changes
3. Create PR with `[HOTFIX]` in title
4. Fast-track review and merge
5. Automatic production deployment

## 📈 Cost Optimization

### **Free Tier Considerations**
- **Cloud Run**: 2 million requests/month free
- **Cloud Storage**: 5GB free storage
- **Artifact Registry**: 0.5GB free storage
- **Secret Manager**: 6 active secrets free

### **Cost Monitoring**
- Budget alerts configured for $50/month
- Monthly cost reports via Cloud Billing
- Resource usage monitoring dashboard

## 🔍 Troubleshooting

### **Common Issues**

**1. Terraform State Bucket Access**
```bash
# Check bucket permissions
gcloud storage ls gs://nosilha-terraform-state-bucket
# Fix permissions if needed
gcloud storage buckets add-iam-policy-binding gs://nosilha-terraform-state-bucket \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**2. Cloud Run Deployment Failures**
```bash
# Check service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nosilha-backend-api" \
  --limit=50 --format="table(timestamp,textPayload)"
```

**3. Secret Manager Access**
```bash
# Verify secret exists and permissions
gcloud secrets list
gcloud secrets versions access latest --secret="supabase_jwt_secret"
```

**4. Container Build Issues**
```bash
# Check Artifact Registry
gcloud artifacts docker images list us-east1-docker.pkg.dev/PROJECT-ID/nosilha-backend
gcloud artifacts docker images list us-east1-docker.pkg.dev/PROJECT-ID/nosilha-frontend
```

## 🛠️ Advanced Configuration

### **Custom Domain Setup**
```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=nosilha-frontend \
  --domain=your-domain.com \
  --region=us-east1
```

### **SSL Certificate Management**
```bash
# Create managed SSL certificate
gcloud compute ssl-certificates create nosilha-ssl-cert \
  --domains=your-domain.com,www.your-domain.com \
  --global
```

### **Database Migration**
```bash
# Run database migrations (if needed)
gcloud run jobs create nosilha-db-migration \
  --image=us-east1-docker.pkg.dev/PROJECT-ID/nosilha-backend/nosilha-core-api:latest \
  --region=us-east1 \
  --task-timeout=600 \
  --command="./gradlew,flywayMigrate"
```

## 🆘 Support & Resources

### **Documentation**
- [CLAUDE.md](./CLAUDE.md) - Complete project documentation
- [SECURITY.md](./SECURITY.md) - Security policies and procedures
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

### **Monitoring & Alerts**
- **GCP Console**: https://console.cloud.google.com/
- **Cloud Monitoring**: https://console.cloud.google.com/monitoring
- **Cloud Run Services**: https://console.cloud.google.com/run

### **Emergency Contacts**
- **Project Lead**: [Add contact information]
- **DevOps Team**: [Add contact information]
- **On-Call Rotation**: [Add rotation schedule]

---

## 🎉 Success Checklist

After completing this deployment guide, you should have:

- ✅ **Infrastructure deployed** with Terraform
- ✅ **CI/CD pipelines** running automatically
- ✅ **Security scanning** integrated
- ✅ **Monitoring and alerts** configured
- ✅ **Cost controls** in place
- ✅ **Documentation** complete
- ✅ **Services accessible** via public URLs
- ✅ **Development workflow** established

**Your Nos Ilha platform is now ready for production use!** 🚀