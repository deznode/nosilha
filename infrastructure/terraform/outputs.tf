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

# Removed - Service Account Key replaced by Workload Identity Federation
# output "cicd_service_account_key" {
#   description = "Base64-encoded private key for the CI/CD service account"
#   value       = google_service_account_key.cicd_deployer_key.private_key
#   sensitive   = true
# }

output "backend_runner_service_account_email" {
  description = "Email address of the backend runner service account"
  value       = google_service_account.backend_runner.email
}

output "frontend_runner_service_account_email" {
  description = "Email address of the frontend runner service account"
  value       = google_service_account.frontend_runner.email
}

# ------------------------------------------------------------------------------
# Domain Mapping and SSL Certificate Outputs
# ------------------------------------------------------------------------------

output "primary_domain_url" {
  description = "The primary domain URL for the frontend application"
  value       = "https://${google_cloud_run_domain_mapping.nosilha-frontend-domain-mapping.name}"
}

output "www_domain_url" {
  description = "The www subdomain URL for the frontend application"
  value       = "https://${google_cloud_run_domain_mapping.nosilha-www-domain-mapping.name}"
}

output "api_domain_url" {
  description = "The API domain URL for backend services"
  value       = "https://${google_cloud_run_domain_mapping.nosilha-backend-domain-mapping.name}"
}

output "domain_mapping_status" {
  description = "Status of all domain mappings"
  value = {
    primary_domain = {
      domain = google_cloud_run_domain_mapping.nosilha-frontend-domain-mapping.name
      status = google_cloud_run_domain_mapping.nosilha-frontend-domain-mapping.status
    }
    www_domain = {
      domain = google_cloud_run_domain_mapping.nosilha-www-domain-mapping.name
      status = google_cloud_run_domain_mapping.nosilha-www-domain-mapping.status
    }
    api_domain = {
      domain = google_cloud_run_domain_mapping.nosilha-backend-domain-mapping.name
      status = google_cloud_run_domain_mapping.nosilha-backend-domain-mapping.status
    }
  }
}

output "dns_records" {
  description = "DNS records that should be configured at the domain registrar"
  value = {
    primary_domain = google_cloud_run_domain_mapping.nosilha-frontend-domain-mapping.status[0].resource_records
    www_domain     = google_cloud_run_domain_mapping.nosilha-www-domain-mapping.status[0].resource_records
    api_domain     = google_cloud_run_domain_mapping.nosilha-backend-domain-mapping.status[0].resource_records
  }
}

# ------------------------------------------------------------------------------
# Database and Storage Outputs
# ------------------------------------------------------------------------------

output "firestore_database_name" {
  description = "The name of the Firestore database"
  value       = google_firestore_database.default.name
}

output "firestore_database_location" {
  description = "The location of the Firestore database"
  value       = google_firestore_database.default.location_id
}

output "firestore_database_id" {
  description = "The full resource ID of the Firestore database"
  value       = google_firestore_database.default.id
}

output "gcs_media_bucket_name_only" {
  description = "The name of the GCS bucket for media storage (bucket name only)"
  value       = google_storage_bucket.media_storage.name
}
