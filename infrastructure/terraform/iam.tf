# ------------------------------------------------------------------------------
# IAM Configuration for CI/CD and Service Accounts
# ------------------------------------------------------------------------------

# Dedicated service account for CI/CD operations
# This account will be used by GitHub Actions for automated deployments
resource "google_service_account" "cicd_deployer" {
  account_id   = "nosilha-cicd-deployer"
  display_name = "Nosilha CI/CD Deployer"
  description  = "Service account for GitHub Actions CI/CD pipeline operations"
}

# ------------------------------------------------------------------------------
# IAM Roles for CI/CD Service Account
# ------------------------------------------------------------------------------

# Allow CI/CD to push images to Artifact Registry
resource "google_project_iam_member" "cicd_artifact_registry_writer" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to deploy and manage Cloud Run services
resource "google_project_iam_member" "cicd_cloud_run_developer" {
  project = var.gcp_project_id
  role    = "roles/run.developer"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to access secrets for deployment configuration
resource "google_project_iam_member" "cicd_secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to manage Terraform state in GCS
resource "google_storage_bucket_iam_member" "cicd_terraform_state_admin" {
  bucket = google_storage_bucket.terraform_state.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.cicd_deployer.member

  depends_on = [
    google_project_iam_member.cicd_storage_admin
  ]
}

# Allow CI/CD to read/write to the media storage bucket (for integration tests)
resource "google_storage_bucket_iam_member" "cicd_media_storage_access" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.cicd_deployer.member

  depends_on = [
    google_project_iam_member.cicd_storage_admin
  ]
}

# Allow CI/CD to manage IAM policies (needed for service account binding)
resource "google_project_iam_member" "cicd_service_account_user" {
  project = var.gcp_project_id
  role    = "roles/iam.serviceAccountUser"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to read project metadata and resources
resource "google_project_iam_member" "cicd_project_viewer" {
  project = var.gcp_project_id
  role    = "roles/viewer"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to manage storage bucket IAM policies
resource "google_project_iam_member" "cicd_storage_admin" {
  project = var.gcp_project_id
  role    = "roles/storage.admin"
  member  = google_service_account.cicd_deployer.member
}

# Allow CI/CD to manage monitoring dashboards and metrics
resource "google_project_iam_member" "cicd_monitoring_editor" {
  project = var.gcp_project_id
  role    = "roles/monitoring.editor"
  member  = google_service_account.cicd_deployer.member
}

# ------------------------------------------------------------------------------
# Service Account Key for GitHub Actions
# ------------------------------------------------------------------------------

# Create a service account key for GitHub Actions authentication
# Note: In production, consider using Workload Identity Federation instead
resource "google_service_account_key" "cicd_deployer_key" {
  service_account_id = google_service_account.cicd_deployer.name
  public_key_type    = "TYPE_X509_PEM_FILE"

  # Lifecycle management to prevent key rotation issues
  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# Outputs for CI/CD Configuration
# ------------------------------------------------------------------------------

output "cicd_service_account_email" {
  description = "Email address of the CI/CD service account"
  value       = google_service_account.cicd_deployer.email
}

output "cicd_service_account_key" {
  description = "Base64-encoded private key for the CI/CD service account"
  value       = google_service_account_key.cicd_deployer_key.private_key
  sensitive   = true
}