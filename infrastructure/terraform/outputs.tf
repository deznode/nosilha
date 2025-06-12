# outputs.tf
#
# Defines the outputs from our Terraform configuration.

output "gcs_media_bucket_name" {
  description = "The fully-qualified name of the created GCS bucket for media storage."
  value       = google_storage_bucket.media_storage.url
}

output "api_uploader_service_account_email" {
  description = "The email address of the service account for the backend API."
  value       = google_service_account.api_uploader.email
}
