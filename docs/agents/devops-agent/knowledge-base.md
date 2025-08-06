# DevOps Agent Knowledge Base

## Domain Expertise: CI/CD + Google Cloud Platform + Infrastructure Automation

### Architecture Overview
```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ↓
Google Artifact Registry (Container Images)
    ↓
Google Cloud Run (Serverless Deployment)
    ↓
Terraform (Infrastructure as Code)
```

### Key Technologies
- **GitHub Actions** - Modular workflow automation
- **Google Cloud Platform** - Cloud Run, Artifact Registry, Secret Manager
- **Terraform** - Infrastructure as Code management  
- **Docker** - Containerized application deployment
- **Security Scanning** - Trivy, detekt, ESLint, tfsec
- **Monitoring** - Cloud Logging, Cloud Monitoring, Actuator endpoints

## Core CI/CD Architecture

### 1. Modular Workflow System
```yaml
# Path-based triggering for efficient builds
name: Backend CI/CD
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    paths:
      - 'backend/**'

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.changes.outputs.backend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            backend:
              - 'backend/**'
              - '.github/workflows/backend-ci.yml'

  backend-ci:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nosilha_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
```

### 2. Security-First Pipeline
```yaml
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Dependency vulnerability scanning
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: './backend'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      # Static code analysis
      - name: Run detekt
        run: |
          cd backend
          ./gradlew detekt
          
      # Upload SARIF results to GitHub Security
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: trivy-results.sarif
        continue-on-error: true  # Graceful degradation for repos without Advanced Security
```

### 3. Production Deployment
```yaml
  deploy-production:
    needs: [backend-ci, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
          
      - name: Configure Docker for Artifact Registry
        run: |
          gcloud auth configure-docker us-east1-docker.pkg.dev
          
      - name: Build and Push Container
        run: |
          cd backend
          ./gradlew bootBuildImage --imageName=us-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/nosilha-backend/nosilha-core-api:${{ github.sha }}
          docker push us-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/nosilha-backend/nosilha-core-api:${{ github.sha }}
          
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy nosilha-backend-api \
            --image us-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/nosilha-backend/nosilha-core-api:${{ github.sha }} \
            --region us-east1 \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars="SPRING_PROFILES_ACTIVE=production" \
            --memory 1Gi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 10 \
            --port 8080
            
      - name: Verify Deployment
        run: |
          SERVICE_URL=$(gcloud run services describe nosilha-backend-api --region=us-east1 --format='value(status.url)')
          curl -f $SERVICE_URL/actuator/health || exit 1
```

## Infrastructure as Code (Terraform)

### 1. Core Infrastructure
```hcl
# main.tf - Core GCP resources
terraform {
  required_version = ">= 1.12.2"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "nosilha-terraform-state-bucket"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "nosilha_backend" {
  location      = var.gcp_region
  repository_id = "nosilha-backend" 
  description   = "Docker repository for Nos Ilha backend services"
  format        = "DOCKER"
  
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
}

resource "google_artifact_registry_repository" "nosilha_frontend" {
  location      = var.gcp_region
  repository_id = "nosilha-frontend"
  description   = "Docker repository for Nos Ilha frontend application"
  format        = "DOCKER"
  
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
}

# Cloud Storage for media assets
resource "google_storage_bucket" "media_storage" {
  name     = "${var.gcp_project_id}-media-storage-${var.gcp_region}"
  location = var.gcp_region
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["https://*.run.app", "https://localhost:3000"]
    method          = ["GET", "POST", "PUT", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}
```

### 2. Cloud Run Services
```hcl
# cloudrun.tf - Serverless application deployment
resource "google_cloud_run_service" "backend_api" {
  name     = "nosilha-backend-api"
  location = var.gcp_region
  
  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/cpu-throttling" = "true"
      }
    }
    
    spec {
      service_account_name = google_service_account.backend_service.email
      
      containers {
        image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-backend/nosilha-core-api:latest"
        
        ports {
          container_port = 8080
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
        
        env {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "production"
        }
        
        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_url.secret_id
              key  = "latest"
            }
          }
        }
        
        env {
          name = "DATABASE_USERNAME"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_username.secret_id
              key  = "latest"
            }
          }
        }
        
        env {
          name = "DATABASE_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }
        
        liveness_probe {
          http_get {
            path = "/actuator/health"
            port = 8080
          }
          initial_delay_seconds = 60
          timeout_seconds = 10
        }
        
        readiness_probe {
          http_get {
            path = "/actuator/health/readiness"
            port = 8080
          }
          initial_delay_seconds = 10
          timeout_seconds = 5
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_iam_member.backend_service_permissions]
}

resource "google_cloud_run_service" "frontend" {
  name     = "nosilha-frontend"
  location = var.gcp_region
  
  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
    
    spec {
      containers {
        image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-frontend/nosilha-web-ui:latest"
        
        ports {
          container_port = 3000
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.backend_api.status[0].url
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_binding" "backend_public" {
  location = google_cloud_run_service.backend_api.location
  service  = google_cloud_run_service.backend_api.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

resource "google_cloud_run_service_iam_binding" "frontend_public" {
  location = google_cloud_run_service.frontend.location
  service  = google_cloud_run_service.frontend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}
```

### 3. IAM & Security
```hcl
# iam.tf - Service accounts and permissions
resource "google_service_account" "backend_service" {
  account_id   = "nosilha-backend-service"
  display_name = "Nos Ilha Backend Service Account"
  description  = "Service account for backend API with minimal required permissions"
}

resource "google_service_account" "cicd_service" {
  account_id   = "nosilha-cicd-service"
  display_name = "Nos Ilha CI/CD Service Account"
  description  = "Service account for GitHub Actions CI/CD pipeline"
}

# Backend service permissions
resource "google_project_iam_member" "backend_service_permissions" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/storage.objectAdmin",
    "roles/cloudsql.client"
  ])
  
  project = var.gcp_project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.backend_service.email}"
}

# CI/CD service permissions
resource "google_project_iam_member" "cicd_service_permissions" {
  for_each = toset([
    "roles/artifactregistry.admin",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.admin"
  ])
  
  project = var.gcp_project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cicd_service.email}"
}

# Generate service account key for GitHub Actions
resource "google_service_account_key" "cicd_key" {
  service_account_id = google_service_account.cicd_service.name
}
```

## Monitoring & Observability

### 1. Application Monitoring
```hcl
# monitoring.tf - Cloud monitoring and alerting
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate - Nos Ilha Backend"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate above 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"nosilha-backend-api\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields = [
          "resource.label.service_name"
        ]
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email.id
  ]
  
  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "high_response_time" {
  display_name = "High Response Time - Nos Ilha Backend"
  combiner     = "OR"
  
  conditions {
    display_name = "Response time above 2 seconds"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"nosilha-backend-api\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 2000
      
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields = [
          "resource.label.service_name"
        ]
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.email.id
  ]
}

# Budget alerts for cost control
resource "google_billing_budget" "project_budget" {
  billing_account = var.billing_account_id
  display_name    = "Nos Ilha Project Budget"
  
  budget_filter {
    projects = ["projects/${var.gcp_project_id}"]
  }
  
  amount {
    specified_amount {
      currency_code = "USD"
      units         = "50"
    }
  }
  
  threshold_rules {
    threshold_percent = 0.5
  }
  
  threshold_rules {
    threshold_percent = 0.8
  }
  
  threshold_rules {
    threshold_percent = 1.0
    spend_basis = "FORECASTED_SPEND"
  }
  
  all_updates_rule {
    notification_channels = [
      google_monitoring_notification_channel.email.id
    ]
  }
}
```

### 2. Security Monitoring
```yaml
# GitHub Actions workflow for security monitoring
name: Security Monitoring
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Scan for secrets in repository
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified
          
      # Dependency vulnerability scanning
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'security-scan-results.sarif'
          
      # Upload results to GitHub Security
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: security-scan-results.sarif
        continue-on-error: true
        
      # Notify on critical vulnerabilities
      - name: Check for critical vulnerabilities
        run: |
          CRITICAL_COUNT=$(jq '.runs[0].results | map(select(.level == "error")) | length' security-scan-results.sarif)
          if [ "$CRITICAL_COUNT" -gt 0 ]; then
            echo "::error::Found $CRITICAL_COUNT critical vulnerabilities"
            exit 1
          fi
```

## Cost Optimization Strategies

### 1. Cloud Run Cost Management
```hcl
# Cost-optimized Cloud Run configuration
resource "google_cloud_run_service" "backend_api" {
  template {
    metadata {
      annotations = {
        # Scale to zero when not in use
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        
        # CPU throttling for cost savings
        "run.googleapis.com/cpu-throttling" = "true"
        
        # Request timeout
        "run.googleapis.com/timeout" = "300"
      }
    }
    
    spec {
      containers {
        # Right-sized resources for tourism workload
        resources {
          limits = {
            cpu    = "1000m"  # 1 vCPU
            memory = "1Gi"    # 1GB RAM
          }
          requests = {
            cpu    = "100m"   # Minimum CPU request
            memory = "256Mi"  # Minimum memory request
          }
        }
      }
    }
  }
}
```

### 2. Storage Cost Management
```hcl
# Intelligent storage tiering
resource "google_storage_bucket" "media_storage" {
  lifecycle_rule {
    # Move to Nearline after 30 days
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
  
  lifecycle_rule {
    # Move to Coldline after 90 days  
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
  
  lifecycle_rule {
    # Archive after 1 year
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }
}
```

## Disaster Recovery & Backup

### 1. Automated Backups
```yaml
# Database backup workflow
name: Database Backup
on:
  schedule:
    - cron: '0 1 * * *'  # Daily at 1 AM UTC
  workflow_dispatch:

jobs:
  backup-database:
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
          
      - name: Create database backup
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          gcloud sql export sql ${{ secrets.DB_INSTANCE_NAME }} \
            gs://${{ secrets.BACKUP_BUCKET }}/db-backups/backup_${DATE}.sql \
            --database=nosilha_db
            
      - name: Cleanup old backups
        run: |
          # Keep only last 7 days of backups
          gsutil -m rm gs://${{ secrets.BACKUP_BUCKET }}/db-backups/backup_$(date -d '7 days ago' +%Y%m%d)_*.sql || true
```

### 2. Infrastructure Recovery
```bash
# Disaster recovery script
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

PROJECT_ID="${1:-$GCP_PROJECT_ID}"
REGION="${2:-us-east1}"

echo "Starting disaster recovery for project: $PROJECT_ID"

# Recreate infrastructure from Terraform
cd infrastructure/terraform
terraform init
terraform plan -var="gcp_project_id=$PROJECT_ID" -var="gcp_region=$REGION"
terraform apply -auto-approve

# Restore latest database backup
LATEST_BACKUP=$(gsutil ls gs://$PROJECT_ID-backups/db-backups/ | grep backup_ | sort | tail -1)
echo "Restoring database from: $LATEST_BACKUP"

gcloud sql import sql $PROJECT_ID-db-instance $LATEST_BACKUP --database=nosilha_db

# Redeploy applications
echo "Redeploying applications..."
cd ../../
./scripts/deploy.sh production all latest

echo "Disaster recovery completed successfully"
```

## Key File Locations

### CI/CD Configuration
```
.github/workflows/
├── pr-validation.yml          # Consolidated PR validation
├── backend-ci.yml            # Backend build, test, deploy
├── frontend-ci.yml           # Frontend build, test, deploy  
├── infrastructure-ci.yml     # Terraform validation and apply
└── integration-ci.yml        # Cross-service integration tests
```

### Infrastructure Code
```
infrastructure/terraform/
├── main.tf                   # Core GCP resources
├── cloudrun.tf              # Cloud Run services
├── iam.tf                   # Service accounts and permissions
├── monitoring.tf            # Monitoring and alerting
├── variables.tf             # Input variables
├── outputs.tf               # Output values
└── terraform.tfvars         # Variable values (not in git)
```

### Scripts
```
scripts/
├── deploy.sh                # Manual deployment script
├── backup.sh               # Database backup script
├── disaster-recovery.sh    # DR procedures
└── monitoring-setup.sh     # Monitoring configuration
```

This knowledge base provides comprehensive coverage of CI/CD automation, Google Cloud Platform deployment, infrastructure as code, and production monitoring for the Nos Ilha tourism platform.