# Defines the outputs from our Terraform configuration.

output "gcs_media_bucket_name" {
  description = "The fully-qualified name of the created GCS bucket for media storage."
  value       = google_storage_bucket.media_storage.url
}
output "backend_api_service_url" {
  description = "The publicly accessible URL of the deployed backend API service."
  value       = google_cloud_run_v2_service.nosilha_backend_api.uri
}

output "frontend_ui_service_url" {
  description = "The publicly accessible URL of the deployed frontend web UI."
  value       = google_cloud_run_v2_service.nosilha_frontend.uri
}

output "terraform_state_bucket_name" {
  description = "The name of the GCS bucket used for Terraform state storage."
  value       = google_storage_bucket.terraform_state.name
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

output "backend_runner_service_account_email" {
  description = "Email address of the backend runner service account"
  value       = google_service_account.backend_runner.email
}

output "frontend_runner_service_account_email" {
  description = "Email address of the frontend runner service account"
  value       = google_service_account.frontend_runner.email
}
