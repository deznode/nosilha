# ------------------------------------------------------------------------------
# IAM Configuration for CI/CD and Service Accounts
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# CI/CD Service Account
# ------------------------------------------------------------------------------

# Dedicated service account for CI/CD operations
# This account will be used by GitHub Actions for automated deployments
resource "google_service_account" "cicd_deployer" {
  account_id   = "nosilha-cicd-deployer"
  display_name = "Nosilha CI/CD Deployer"
  description  = "Service account for GitHub Actions CI/CD pipeline operations"
}

# ------------------------------------------------------------------------------
# Runtime Service Accounts
# ------------------------------------------------------------------------------

# Backend service account - needs access to secrets and GCS
resource "google_service_account" "backend_runner" {
  account_id   = "nosilha-backend-runner"
  display_name = "Nosilha.com Backend Runner"
  description  = "Service Account for the Nosilha Backend Cloud Run service."

  # Ensure IAM API is enabled before creating service account
  depends_on = [google_project_service.iam]
}

# Frontend service account - minimal permissions, no secrets needed
resource "google_service_account" "frontend_runner" {
  account_id   = "nosilha-frontend-runner"
  display_name = "Nosilha.com Frontend Runner"
  description  = "Service Account for the Nosilha Frontend Cloud Run service."

  # Ensure IAM API is enabled before creating service account
  depends_on = [google_project_service.iam]
}

# ------------------------------------------------------------------------------
# Runtime Service Account Permissions
# ------------------------------------------------------------------------------

# Grant backend service account access to secrets
resource "google_secret_manager_secret_iam_member" "grant_jwt_secret_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_jwt_secret"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

resource "google_secret_manager_secret_iam_member" "grant_db_url_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_db_url"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

resource "google_secret_manager_secret_iam_member" "grant_db_user_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_db_username"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

resource "google_secret_manager_secret_iam_member" "grant_db_password_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_db_password"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

resource "google_secret_manager_secret_iam_member" "grant_session_db_url_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_session_db_url"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

# Grant frontend service account access to Resend API key for newsletter email functionality
resource "google_secret_manager_secret_iam_member" "grant_resend_api_key_access" {
  project   = var.gcp_project_id
  secret_id = "resend_api_key"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.frontend_runner.member
}

# Grant backend service account access to GCS bucket
resource "google_storage_bucket_iam_member" "grant_gcs_access" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.backend_runner.member
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

# Editor role for CI/CD service account (MANUAL SETUP REQUIRED)
# SECURITY NOTE: Domain mapping requires broad permissions due to Google Cloud limitations
# This role must be granted manually using gcloud CLI before running Terraform:
#
# gcloud projects add-iam-policy-binding nosilha \
#     --member="serviceAccount:nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com" \
#     --role="roles/editor"
#
# This manual step is required because the service account cannot grant permissions to itself
# TODO: Monitor Google Cloud IAM updates for more granular domain mapping permissions

# ------------------------------------------------------------------------------
# Service Account Impersonation Permissions
# ------------------------------------------------------------------------------

# Allow CI/CD service account to act as the backend runner service account
resource "google_service_account_iam_binding" "cicd_can_act_as_backend_runner" {
  service_account_id = "projects/${var.gcp_project_id}/serviceAccounts/${google_service_account.backend_runner.email}"
  role               = "roles/iam.serviceAccountUser"

  members = [
    google_service_account.cicd_deployer.member,
  ]
}

# Allow CI/CD service account to act as the frontend runner service account
resource "google_service_account_iam_binding" "cicd_can_act_as_frontend_runner" {
  service_account_id = "projects/${var.gcp_project_id}/serviceAccounts/${google_service_account.frontend_runner.email}"
  role               = "roles/iam.serviceAccountUser"

  members = [
    google_service_account.cicd_deployer.member,
  ]
}

# ------------------------------------------------------------------------------
# Service Account Key for GitHub Actions
# ------------------------------------------------------------------------------

# Service Account Key for GitHub Actions - DEPRECATED
# Note: Replaced by Workload Identity Federation for enhanced security
# Commenting out to implement OIDC authentication
# resource "google_service_account_key" "cicd_deployer_key" {
#   service_account_id = google_service_account.cicd_deployer.name
#   public_key_type    = "TYPE_X509_PEM_FILE"
#
#   # Lifecycle management to prevent key rotation issues
#   lifecycle {
#     create_before_destroy = true
#   }
# }

# ------------------------------------------------------------------------------
# Workload Identity Federation for GitHub Actions OIDC
# ------------------------------------------------------------------------------

# Workload Identity Pool - Trust anchor for external identities
resource "google_iam_workload_identity_pool" "github_actions_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "OIDC identity pool for Nos Ilha GitHub Actions workflows"
}

# GitHub OIDC Provider - Specific trust relationship with GitHub
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Actions OIDC Provider"
  description                        = "OIDC provider for deznode/nosilha repository"

  # Map GitHub OIDC token claims to Google Cloud attributes
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.actor"      = "assertion.actor"
    "attribute.ref"        = "assertion.ref"
  }

  # Security: Only allow authentication from our specific repository
  attribute_condition = "assertion.repository == 'deznode/nosilha'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Service Account Impersonation Binding
resource "google_service_account_iam_binding" "github_workload_identity_user" {
  service_account_id = google_service_account.cicd_deployer.name
  role               = "roles/iam.workloadIdentityUser"

  members = [
    "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions_pool.workload_identity_pool_id}/attribute.repository/deznode/nosilha"
  ]
}

# Outputs for GitHub Actions configuration
output "workload_identity_provider" {
  description = "Workload Identity Provider for GitHub Actions OIDC"
  value       = google_iam_workload_identity_pool_provider.github_provider.name
}

output "github_actions_service_account" {
  description = "Service account email for GitHub Actions impersonation"
  value       = google_service_account.cicd_deployer.email
}