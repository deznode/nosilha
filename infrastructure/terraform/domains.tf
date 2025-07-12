# IMPORTANT: Before applying this configuration, the domain "nosilha.com" must be
# verified in the Google Cloud project's Cloud Run domain mappings section.
# https://cloud.google.com/run/docs/mapping-custom-domains#verify

resource "google_cloud_run_domain_mapping" "nosilha-frontend-domain-mapping" {
  name     = "nosilha.com"
  location = google_cloud_run_v2_service.nosilha_frontend.location

  metadata {
    namespace = var.gcp_project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.nosilha_frontend.name
  }
}

resource "google_cloud_run_domain_mapping" "nosilha-backend-domain-mapping" {
  name     = "api.nosilha.com"
  location = google_cloud_run_v2_service.nosilha_backend_api.location

  metadata {
    namespace = var.gcp_project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.nosilha_backend_api.name
  }
}
