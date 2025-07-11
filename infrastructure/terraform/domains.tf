# IMPORTANT: Before applying this configuration, the domain "nosilha.com" must be
# verified in the Google Cloud project's Cloud Run domain mappings section.
# https://cloud.google.com/run/docs/mapping-custom-domains#verify

resource "google_cloud_run_domain_mapping" "nosilha-frontend-domain-mapping" {
  name     = "www.nosilha.com"
  location = "us-east1"

  spec {
    route_name = "nosilha-frontend"
  }
}

resource "google_cloud_run_domain_mapping" "nosilha-backend-domain-mapping" {
  name     = "api.nosilha.com"
  location = "us-east1"

  spec {
    route_name = "nosilha-backend-api"
  }
}
