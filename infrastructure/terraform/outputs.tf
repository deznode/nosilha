# Defines the outputs from our Terraform configuration.

output "gcs_media_bucket_name" {
  description = "The fully-qualified name of the created GCS bucket for media storage."
  value       = google_storage_bucket.media_storage.url
}

output "backend_runner_service_account_email" {
  description = "The email address of the backend Cloud Run service account."
  value       = google_service_account.backend_runner.email
}

output "backend_api_service_url" {
  description = "The publicly accessible URL of the deployed backend API service."
  value       = google_cloud_run_v2_service.nosilha_backend_api.uri
}

output "frontend_ui_service_url" {
  description = "The publicly accessible URL of the deployed frontend web UI."
  value       = google_cloud_run_v2_service.nosilha_frontend.uri
}
