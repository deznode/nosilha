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

    # Set CPU to be allocated only during request processing (critical for free tier)
    # This is configured via cpu_idle in the resources block

    # Optimize scaling for free tier usage
    # Configuration aligns with CI/CD deployment: --min-instances=0 --max-instances=3
    scaling {
      min_instance_count = 0 # Scale to zero when not in use
      max_instance_count = 3 # Limit maximum instances (matches CI/CD config)
    }

    containers {
      # The full path to the container image in Artifact Registry.
      # Uses latest tag - actual deployments handled by CI/CD
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-backend/nosilha-core-api:latest"

      # Configure memory and CPU resources optimized for free tier
      # These limits align with CI/CD deployment configuration for consistency
      resources {
        limits = {
          cpu    = "1000m" # 1 vCPU max for free tier
          memory = "256Mi" # Optimized for Spring Boot apps (matches CI/CD: 256Mi)
        }
        cpu_idle = true # CPU only allocated during request processing
      }

      # Request timeout for backend API calls
      # Individual probe timeout (10s) with 30 retries every 10s = 300s total startup time
      startup_probe {
        timeout_seconds = 10
        period_seconds  = 10
        failure_threshold = 30
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

    # Set CPU to be allocated only during request processing (critical for free tier)
    # This is configured via cpu_idle in the resources block

    # Optimize scaling for free tier usage
    # Configuration aligns with CI/CD deployment: --min-instances=0 --max-instances=2
    scaling {
      min_instance_count = 0 # Scale to zero when not in use
      max_instance_count = 2 # Lower limit for frontend (matches CI/CD config)
    }

    containers {
      # The full path to the frontend container image in its Artifact Registry.
      # Uses latest tag - actual deployments handled by CI/CD
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-frontend/nosilha-web-ui:latest"

      # Configure container port for Next.js
      ports {
        name           = "http1"
        container_port = 3000
      }

      # Configure memory and CPU resources optimized for free tier
      # These limits align with CI/CD deployment configuration for consistency
      resources {
        limits = {
          cpu    = "1000m"  # 1 vCPU for Next.js frontend
          memory = "256Mi" # Optimized for Next.js apps (matches CI/CD: 256Mi)
        }
        cpu_idle = true # CPU only allocated during request processing
      }

      # Request timeout for frontend requests
      # Individual probe timeout (10s) with 30 retries every 10s = 300s total startup time
      startup_probe {
        timeout_seconds = 10
        period_seconds  = 10
        failure_threshold = 30
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
