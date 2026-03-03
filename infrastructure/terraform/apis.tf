# ------------------------------------------------------------------------------
# Google Cloud APIs Enablement
# ------------------------------------------------------------------------------

# Enable Cloud Run API
resource "google_project_service" "cloud_run" {
  project = var.gcp_project_id
  service = "run.googleapis.com"

  # Prevent accidental disabling of the API
  disable_on_destroy = false
}

# Enable Artifact Registry API
resource "google_project_service" "artifact_registry" {
  project = var.gcp_project_id
  service = "artifactregistry.googleapis.com"

  disable_on_destroy = false
}

# Enable Secret Manager API
resource "google_project_service" "secret_manager" {
  project = var.gcp_project_id
  service = "secretmanager.googleapis.com"

  disable_on_destroy = false
}

# Enable Cloud Resource Manager API
resource "google_project_service" "cloud_resource_manager" {
  project = var.gcp_project_id
  service = "cloudresourcemanager.googleapis.com"

  disable_on_destroy = false
}

# Enable Identity and Access Management (IAM) API
resource "google_project_service" "iam" {
  project = var.gcp_project_id
  service = "iam.googleapis.com"

  disable_on_destroy = false
}

# Enable Cloud Storage API
resource "google_project_service" "storage" {
  project = var.gcp_project_id
  service = "storage.googleapis.com"

  disable_on_destroy = false
}


# Enable Cloud Monitoring API (for budget alerts)
resource "google_project_service" "monitoring" {
  project = var.gcp_project_id
  service = "monitoring.googleapis.com"

  disable_on_destroy = false
}

# Enable Cloud Billing API (for budget management)
resource "google_project_service" "billing" {
  project = var.gcp_project_id
  service = "cloudbilling.googleapis.com"

  disable_on_destroy = false
}

# Enable Billing Budgets API (for budget alerts)
resource "google_project_service" "billing_budgets" {
  project = var.gcp_project_id
  service = "billingbudgets.googleapis.com"

  disable_on_destroy = false
}

# Enable Cloud Logging API (for audit logs and metrics)
resource "google_project_service" "logging" {
  project = var.gcp_project_id
  service = "logging.googleapis.com"

  disable_on_destroy = false
}

# Enable Cloud Vision API for AI image analysis (label/landmark detection)
resource "google_project_service" "cloud_vision" {
  project = var.gcp_project_id
  service = "vision.googleapis.com"

  disable_on_destroy = false
}

# Enable Generative Language API for Gemini cultural context generation
resource "google_project_service" "generative_language" {
  project = var.gcp_project_id
  service = "generativelanguage.googleapis.com"

  disable_on_destroy = false
}

# ------------------------------------------------------------------------------
# API Dependencies
# ------------------------------------------------------------------------------

# Ensure APIs are enabled before creating dependent resources
locals {
  api_dependencies = [
    google_project_service.cloud_run,
    google_project_service.artifact_registry,
    google_project_service.secret_manager,
    google_project_service.cloud_resource_manager,
    google_project_service.iam,
    google_project_service.storage,
    google_project_service.monitoring,
    google_project_service.billing,
    google_project_service.billing_budgets,
    google_project_service.logging,
    google_project_service.cloud_vision,
    google_project_service.generative_language
  ]
}