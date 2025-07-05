# ------------------------------------------------------------------------------
# This file defines all resources required to deploy and run the
# Nosilha.com backend API on Google Cloud Run.
# ------------------------------------------------------------------------------

# --- Service Account for Cloud Run Execution ---
#
# A dedicated service account for the Cloud Run service to run as.
# This follows the principle of least privilege.
#
resource "google_service_account" "backend_runner" {
  account_id   = "nosilha-backend-runner"
  display_name = "Nosilha.com Backend Runner"
  description  = "Service Account for the Nosilha Backend Cloud Run service."
}


# --- Secret Manager IAM Permissions ---
#
# Grant the Cloud Run service account the 'Secret Accessor' role
# for each secret the application needs at runtime.
#
resource "google_secret_manager_secret_iam_member" "grant_jwt_secret_access" {
  project   = var.gcp_project_id
  secret_id = "supabase_jwt_secret"
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.backend_runner.member
}

resource "google_storage_bucket_iam_member" "grant_gcs_access" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.backend_runner.member
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
      # The tag is controlled by a variable for easy updates.
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-backend/nosilha-core-api:${var.api_image_tag}"

      # Configure memory and CPU resources
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1Gi"
        }
      }

      # Inject environment variables into the container.
      # Secrets are sourced securely from Secret Manager.
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "prod"
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

  # Ensure the Secret Manager permissions are in place before creating the service.
  depends_on = [
    google_secret_manager_secret_iam_member.grant_jwt_secret_access,
    google_secret_manager_secret_iam_member.grant_db_url_access,
    google_secret_manager_secret_iam_member.grant_db_user_access,
    google_secret_manager_secret_iam_member.grant_db_password_access
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
  location            = var.gcp_region # Deploys to us-east1
  deletion_protection = true

  template {
    containers {
      # The full path to the frontend container image in its Artifact Registry.
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-frontend/nosilha-web-ui:${var.frontend_image_tag}"

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




