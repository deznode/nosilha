# ------------------------------------------------------------------------------
# This file defines all resources required to deploy and run the
# Nosilha.com backend API on Google Cloud Run.
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Cloud Run Services
# ------------------------------------------------------------------------------
# Note: Service accounts and their permissions are defined in iam.tf


# --- Google Cloud Run Service Definition ---
#
# This is the core resource that deploys our container from
# Artifact Registry and runs it as a scalable service.
#
resource "google_cloud_run_v2_service" "nosilha_backend_api" {
  name                = "nosilha-backend-api"
  location            = var.gcp_region
  deletion_protection = true

  template {
    # Run the container using the dedicated service account
    service_account = google_service_account.backend_runner.email

    containers {
      # The full path to the container image in Artifact Registry.
      # Uses latest tag - actual deployments handled by CI/CD
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-backend/nosilha-core-api:latest"

      # Configure memory and CPU resources for free tier
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # Inject environment variables into the container.
      # Secrets are sourced securely from Secret Manager.
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "production"
      }

      # Provides the application with the GCP Project ID for Spring Cloud GCP auto-configuration.
      env {
        name  = "SPRING_CLOUD_GCP_PROJECT_ID"
        value = var.gcp_project_id
      }

      # Provides the application with the name of the GCS bucket for media storage.
      # This value is sourced from the GCS bucket resource we defined earlier.
      env {
        name  = "GCS_BUCKET_NAME"
        value = google_storage_bucket.media_storage.name
      }

      env {
        name = "SUPABASE_JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = "supabase_jwt_secret"
            version = "latest"
          }
        }
      }

      env {
        name = "SPRING_DATASOURCE_URL"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_url"
            version = "latest"
          }
        }
      }

      env {
        name = "SPRING_DATASOURCE_USERNAME"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_username"
            version = "latest"
          }
        }
      }

      env {
        name = "SPRING_DATASOURCE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_password"
            version = "latest"
          }
        }
      }
    }
  }

  # Ensure the Cloud Run API is enabled before creating the service.
  # Service account and permissions are managed in iam.tf
  depends_on = [
    google_project_service.cloud_run
  ]
}

# --- Public Access IAM Policy for Cloud Run ---
#
# This grants the 'run.invoker' role to 'allUsers', which makes the
# Cloud Run service's endpoint URL publicly accessible on the internet.
#
resource "google_cloud_run_v2_service_iam_member" "allow_public_access" {
  project  = google_cloud_run_v2_service.nosilha_backend_api.project
  location = google_cloud_run_v2_service.nosilha_backend_api.location
  name     = google_cloud_run_v2_service.nosilha_backend_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}


# Deploys the containerized Next.js frontend application.
#
resource "google_cloud_run_v2_service" "nosilha_frontend" {
  name                = "nosilha-frontend"
  location            = var.gcp_region
  deletion_protection = true

  # Ensure Cloud Run API is enabled before creating service
  depends_on = [google_project_service.cloud_run]

  template {
    # Run the container using the dedicated frontend service account
    service_account = google_service_account.frontend_runner.email

    containers {
      # The full path to the frontend container image in its Artifact Registry.
      # Uses latest tag - actual deployments handled by CI/CD
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-frontend/nosilha-web-ui:latest"

      # Configure container port for Next.js
      ports {
        name           = "http1"
        container_port = 3000
      }

      # Configure memory and CPU resources for free tier
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # --- CRITICAL: Provide the Backend URL to the Frontend ---
      # This environment variable tells the Next.js app where to find the live backend API.
      # It dynamically uses the URI of the backend service we already deployed.
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.nosilha_backend_api.uri
      }
      env {
        name  = "API_URL"
        value = google_cloud_run_v2_service.nosilha_backend_api.uri
      }
    }
  }
}


# Public Access for Frontend Service ---
#
# Grants the 'run.invoker' role to 'allUsers' to make the website
# publicly accessible on the internet.
#
resource "google_cloud_run_v2_service_iam_member" "allow_frontend_public_access" {
  project  = google_cloud_run_v2_service.nosilha_frontend.project
  location = google_cloud_run_v2_service.nosilha_frontend.location
  name     = google_cloud_run_v2_service.nosilha_frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
