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
          memory = "1Gi"   # Increased from 512Mi to accommodate JVM memory requirements (693MB needed)
        }
        cpu_idle = true # CPU only allocated during request processing
      }

      # Request timeout for backend API calls
      # HTTP health check using Spring Boot Actuator endpoint
      # Optimized settings: 20s delay + 3s period × 20 failures = 80s total startup window
      startup_probe {
        http_get {
          path = "/actuator/health"
          port = 8080
        }
        initial_delay_seconds = 20 # Allow JVM bootstrap time + production overhead
        period_seconds        = 3  # Check every 3s for faster scaling
        timeout_seconds       = 2  # Must be < period_seconds (fixed validation error)
        failure_threshold     = 20 # Increased to provide 80s total startup window
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

      # CORS configuration for frontend API access
      # Allows both the root domain and www subdomain to access the backend API
      env {
        name  = "CORS_ALLOWED_ORIGINS"
        value = "https://nosilha.com,https://www.nosilha.com"
      }

      # Supabase project URL for JWKS-based JWT verification (asymmetric ES256)
      # The backend fetches public keys from ${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json
      env {
        name  = "SUPABASE_PROJECT_URL"
        value = "https://wqpgbmrgwbexxldeokiu.supabase.co"
      }

      # Database secrets via Secret Manager (cost-optimized approach)
      # Using pinned versions instead of "latest" for predictable costs and better control
      # Each secret access during container startup counts as 1 operation toward free tier limit
      env {
        name = "SPRING_DATASOURCE_URL"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_url"
            version = "3" # Updated to use Session Mode pooler (port 5432) for prepared statement support
          }
        }
      }

      env {
        name = "SPRING_DATASOURCE_USERNAME"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_username"
            version = "3" # Updated to current enabled version
          }
        }
      }

      env {
        name = "SPRING_DATASOURCE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_password"
            version = "4" # Updated to current enabled version
          }
        }
      }


      env {
        name = "SPRING_FLYWAY_URL"
        value_source {
          secret_key_ref {
            secret  = "supabase_session_db_url"
            version = "1" # Updated to current enabled version
          }
        }
      }

      env {
        name = "SPRING_FLYWAY_USER"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_username"
            version = "3" # Updated to current enabled version
          }
        }
      }

      env {
        name = "SPRING_FLYWAY_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = "supabase_db_password"
            version = "4" # Updated to current enabled version
          }
        }
      }

      # AI feature toggles (enabled — Gemini uses API key from Secret Manager, Cloud Vision uses ADC)
      env {
        name  = "AI_ENABLED"
        value = "true"
      }

      env {
        name  = "AI_CLOUD_VISION_ENABLED"
        value = "true"
      }

      env {
        name  = "AI_GEMINI_ENABLED"
        value = "true"
      }

      # Spring AI auto-configuration: "google-genai" enables ChatClient.Builder for Gemini
      env {
        name  = "SPRING_AI_MODEL_CHAT"
        value = "google-genai"
      }

      # Gemini API key from Secret Manager (Developer API authentication — see ADR-0008)
      env {
        name = "AI_GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_api_key.secret_id
            version = "1"
          }
        }
      }

      # Cloudflare R2 media storage configuration
      env {
        name  = "R2_ENABLED"
        value = "true"
      }

      env {
        name  = "R2_BUCKET_NAME"
        value = "nosilha-media"
      }

      env {
        name  = "R2_PUBLIC_URL"
        value = "https://media.nosilha.com"
      }

      # R2 credentials from Secret Manager
      env {
        name = "R2_ACCOUNT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.r2_account_id.secret_id
            version = "2"
          }
        }
      }

      env {
        name = "R2_ACCESS_KEY_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.r2_access_key_id.secret_id
            version = "1"
          }
        }
      }

      env {
        name = "R2_SECRET_ACCESS_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.r2_secret_access_key.secret_id
            version = "2"
          }
        }
      }

      # Frontend revalidation URL (production frontend)
      env {
        name  = "NOSILHA_FRONTEND_URL"
        value = "https://nosilha.com"
      }

      # Shared secret for frontend cache revalidation
      env {
        name = "NOSILHA_FRONTEND_REVALIDATE_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.revalidate_secret.secret_id
            version = "1"
          }
        }
      }

    }
  }

  # Ensure the Cloud Run API is enabled before creating the service.
  # Service account and permissions are managed in iam.tf
  depends_on = [
    google_project_service.cloud_run,
    google_secret_manager_secret.gemini_api_key,
    google_secret_manager_secret_iam_member.grant_gemini_api_key_access,
    google_secret_manager_secret.r2_account_id,
    google_secret_manager_secret.r2_access_key_id,
    google_secret_manager_secret.r2_secret_access_key,
    google_secret_manager_secret_iam_member.grant_r2_account_id_access,
    google_secret_manager_secret_iam_member.grant_r2_access_key_id_access,
    google_secret_manager_secret_iam_member.grant_r2_secret_access_key_access,
    google_secret_manager_secret.revalidate_secret,
    google_secret_manager_secret_iam_member.grant_revalidate_secret_backend,
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

  # Ensure Cloud Run API and secret IAM bindings are ready before creating service
  depends_on = [
    google_project_service.cloud_run,
    google_secret_manager_secret.revalidate_secret,
    google_secret_manager_secret_iam_member.grant_revalidate_secret_frontend,
    google_secret_manager_secret_iam_member.grant_resend_api_key_access,
    google_secret_manager_secret.instagram_access_token,
    google_secret_manager_secret_iam_member.grant_instagram_access_token_access,
  ]

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
          cpu    = "1000m" # 1 vCPU for Next.js frontend
          memory = "512Mi" # Increased from 256Mi to fix OOM errors (matches CI/CD: 512Mi)
        }
        cpu_idle = true # CPU only allocated during request processing
      }

      # Request timeout for frontend requests
      # HTTP health check using custom Next.js health endpoint
      # Optimized settings: 5s delay + 3s period × 8 failures = 29s total startup window
      startup_probe {
        http_get {
          path = "/api/health"
          port = 3000
        }
        initial_delay_seconds = 5 # Next.js starts faster than JVM
        period_seconds        = 3 # Check every 3s for faster scaling
        timeout_seconds       = 2 # Must be < period_seconds (fixed validation error)
        failure_threshold     = 8 # Appropriate for Next.js startup
      }

      # Secret injection for newsletter email service (Resend)
      # Used by server actions for newsletter subscription functionality
      env {
        name = "RESEND_API_KEY"
        value_source {
          secret_key_ref {
            secret  = "resend_api_key"
            version = "1" # Pin to specific version for cost predictability
          }
        }
      }

      # Shared secret for cache revalidation authentication
      env {
        name = "REVALIDATE_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.revalidate_secret.secret_id
            version = "1"
          }
        }
      }

      # Instagram Graph API access token for homepage feed
      env {
        name = "INSTAGRAM_ACCESS_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.instagram_access_token.secret_id
            version = "1"
          }
        }
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
