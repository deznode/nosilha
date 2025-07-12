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

# Grant backend service account access to GCS bucket
resource "google_storage_bucket_iam_member" "grant_gcs_access" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.backend_runner.member
}

# ------------------------------------------------------------------------------
# Custom IAM Roles
# ------------------------------------------------------------------------------

# Custom role for Cloud Run domain mapping operations
# This provides minimal permissions required for domain mapping creation/management
# SECURITY NOTE: If this custom role approach fails due to API limitations,
# fallback to using roles/editor temporarily while Google resolves domain mapping IAM
resource "google_project_iam_custom_role" "domain_mapper" {
  role_id     = "domainMapper"
  title       = "Cloud Run Domain Mapping Manager"
  description = "Custom role with minimal permissions for Cloud Run domain mapping operations"

  permissions = [
    "run.domainmappings.create",
    "run.domainmappings.get",
    "run.domainmappings.list",
    "run.domainmappings.delete",
    "run.domainmappings.update"
  ]
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

# Grant CI/CD service account the custom domain mapping role
# FALLBACK: If deployment fails with permission errors, uncomment the editor role below
# and comment out this custom role assignment
resource "google_project_iam_member" "cicd_domain_mapper" {
  project = var.gcp_project_id
  role    = google_project_iam_custom_role.domain_mapper.id
  member  = google_service_account.cicd_deployer.member
}

# FALLBACK OPTION: Uncomment if custom role fails
# WARNING: This grants broad permissions - use only as temporary workaround
# resource "google_project_iam_member" "cicd_editor_fallback" {
#   project = var.gcp_project_id
#   role    = "roles/editor"
#   member  = google_service_account.cicd_deployer.member
# }

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