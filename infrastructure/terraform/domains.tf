# IMPORTANT: Domain Mapping Configuration and Manual Setup Requirements
#
# This configuration manages domain mappings for Cloud Run services. If these
# resources were created manually, they must be imported into Terraform state
# using the following commands:
#
# 1. Import existing domain mappings:
#    terraform import google_cloud_run_domain_mapping.nosilha-frontend-domain-mapping "locations/us-east1/namespaces/936816281178/domainmappings/nosilha.com"
#    terraform import google_cloud_run_domain_mapping.nosilha-backend-domain-mapping "locations/us-east1/namespaces/936816281178/domainmappings/api.nosilha.com"
#    terraform import google_cloud_run_domain_mapping.nosilha-www-domain-mapping "locations/us-east1/namespaces/936816281178/domainmappings/www.nosilha.com"
#
# 2. Manual requirements that cannot be automated:
#    - Domain verification in Google Cloud Console for Cloud Run domain mappings
#    - DNS records configured at domain registrar (see outputs for required records)
#    - CI/CD service account Editor role (see iam.tf for manual command)
#
# For new domain mappings, follow these steps:
# 1. Verify domain ownership: https://cloud.google.com/run/docs/mapping-custom-domains#verify
# 2. Apply Terraform configuration
# 3. Configure DNS records using the values from terraform output dns_records

resource "google_cloud_run_domain_mapping" "nosilha-frontend-domain-mapping" {
  name     = "nosilha.com"
  location = google_cloud_run_v2_service.nosilha_frontend.location

  metadata {
    namespace = data.google_project.project.number
  }
  spec {
    route_name = google_cloud_run_v2_service.nosilha_frontend.name
  }
}

resource "google_cloud_run_domain_mapping" "nosilha-backend-domain-mapping" {
  name     = "api.nosilha.com"
  location = google_cloud_run_v2_service.nosilha_backend_api.location

  metadata {
    namespace = data.google_project.project.number
  }
  spec {
    route_name = google_cloud_run_v2_service.nosilha_backend_api.name
  }
}

resource "google_cloud_run_domain_mapping" "nosilha-www-domain-mapping" {
  name     = "www.nosilha.com"
  location = google_cloud_run_v2_service.nosilha_frontend.location

  metadata {
    namespace = data.google_project.project.number
  }
  spec {
    route_name = google_cloud_run_v2_service.nosilha_frontend.name
  }
}
