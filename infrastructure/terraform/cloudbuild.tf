# ------------------------------------------------------------------------------
# Cloud Build Triggers for Continuous Deployment
# ------------------------------------------------------------------------------

# GitHub repository connection for Cloud Build triggers
# Note: This requires manual setup in Google Cloud Console or using the gcloud CLI
# to connect your GitHub repository to Cloud Build.
# 
# Alternative: Use GitHub App installation for automatic triggering
# For manual setup, visit: https://console.cloud.google.com/cloud-build/triggers

resource "google_cloudbuild_trigger" "backend_trigger" {
  name        = "nosilha-backend-deploy"
  description = "Trigger for building and deploying the Nosilha backend API on main branch pushes"
  
  # Trigger configuration
  github {
    owner = var.github_owner
    name  = var.github_repository
    
    push {
      branch = "^main$"
    }
  }
  
  # Build configuration
  filename = "backend/cloudbuild.yaml"
  
  # Substitutions for dynamic values
  substitutions = {
    _REGION           = var.gcp_region
    _REPOSITORY_NAME  = google_artifact_registry_repository.backend_repository.name
    _IMAGE_NAME       = "nosilha-core-api"
    _SERVICE_NAME     = "nosilha-backend-api"
    _REGISTRY_URL     = "${var.gcp_region}-docker.pkg.dev"
  }
  
  # Include files that should trigger the build
  included_files = [
    "backend/**",
    "backend/cloudbuild.yaml"
  ]
  
  # Ignore files that shouldn't trigger a build
  ignored_files = [
    "**.md",
    "frontend/**",
    "infrastructure/**",
    ".github/**"
  ]
  
  # Service account for the build
  service_account = google_service_account.cloud_build_service_account.id
  
  depends_on = [
    google_project_service.cloudbuild_api
  ]
}

resource "google_cloudbuild_trigger" "frontend_trigger" {
  name        = "nosilha-frontend-deploy"
  description = "Trigger for building and deploying the Nosilha frontend UI on main branch pushes"
  
  # Trigger configuration
  github {
    owner = var.github_owner
    name  = var.github_repository
    
    push {
      branch = "^main$"
    }
  }
  
  # Build configuration
  filename = "frontend/cloudbuild.yaml"
  
  # Substitutions for dynamic values
  substitutions = {
    _REGION           = var.gcp_region
    _REPOSITORY_NAME  = google_artifact_registry_repository.frontend_repository.name
    _IMAGE_NAME       = "nosilha-web-ui"
    _SERVICE_NAME     = "nosilha-frontend"
    _REGISTRY_URL     = "${var.gcp_region}-docker.pkg.dev"
  }
  
  # Include files that should trigger the build
  included_files = [
    "frontend/**",
    "frontend/cloudbuild.yaml"
  ]
  
  # Ignore files that shouldn't trigger a build
  ignored_files = [
    "**.md",
    "backend/**",
    "infrastructure/**",
    ".github/**"
  ]
  
  # Service account for the build
  service_account = google_service_account.cloud_build_service_account.id
  
  depends_on = [
    google_project_service.cloudbuild_api
  ]
}

# ------------------------------------------------------------------------------
# Cloud Build Service Account
# ------------------------------------------------------------------------------

# Dedicated service account for Cloud Build operations
resource "google_service_account" "cloud_build_service_account" {
  account_id   = "nosilha-cloud-build-sa"
  display_name = "Nosilha Cloud Build Service Account"
  description  = "Service account for Cloud Build triggers and operations"
}

# ------------------------------------------------------------------------------
# IAM Roles for Cloud Build Service Account
# ------------------------------------------------------------------------------

# Allow Cloud Build to push images to Artifact Registry
resource "google_project_iam_member" "cloud_build_artifact_registry_writer" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to deploy and manage Cloud Run services
resource "google_project_iam_member" "cloud_build_cloud_run_developer" {
  project = var.gcp_project_id
  role    = "roles/run.developer"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to access secrets for deployment configuration
resource "google_project_iam_member" "cloud_build_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to use service accounts for deployments
resource "google_project_iam_member" "cloud_build_service_account_user" {
  project = var.gcp_project_id
  role    = "roles/iam.serviceAccountUser"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to read project metadata and resources
resource "google_project_iam_member" "cloud_build_project_viewer" {
  project = var.gcp_project_id
  role    = "roles/viewer"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to manage storage for build artifacts
resource "google_project_iam_member" "cloud_build_storage_admin" {
  project = var.gcp_project_id
  role    = "roles/storage.admin"
  member  = google_service_account.cloud_build_service_account.member
}

# Allow Cloud Build to create and manage logs
resource "google_project_iam_member" "cloud_build_logs_writer" {
  project = var.gcp_project_id
  role    = "roles/logging.logWriter"
  member  = google_service_account.cloud_build_service_account.member
}

# ------------------------------------------------------------------------------
# Cloud Build API Service (ensure it's enabled)
# ------------------------------------------------------------------------------

# Note: This should already be enabled in apis.tf, but we reference it here
# for explicit dependency management
resource "google_project_service" "cloudbuild_api" {
  project = var.gcp_project_id
  service = "cloudbuild.googleapis.com"
  
  disable_on_destroy = false
  
  # This might already exist, so we don't fail if it does
  lifecycle {
    prevent_destroy = true
  }
}

# ------------------------------------------------------------------------------
# Outputs for Cloud Build Configuration
# ------------------------------------------------------------------------------

output "cloud_build_service_account_email" {
  description = "Email address of the Cloud Build service account"
  value       = google_service_account.cloud_build_service_account.email
}

output "backend_trigger_id" {
  description = "ID of the backend Cloud Build trigger"
  value       = google_cloudbuild_trigger.backend_trigger.id
}

output "frontend_trigger_id" {
  description = "ID of the frontend Cloud Build trigger"
  value       = google_cloudbuild_trigger.frontend_trigger.id
}