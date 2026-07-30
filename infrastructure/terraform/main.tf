# Defines the core infrastructure for Nosilha.com's media storage on GCP.
# This includes the GCS bucket for storing media files and the service account
# that the backend API will use to upload those files.

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.39.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # Remote backend for state management
  # This enables CI/CD workflows to share state safely
  backend "gcs" {
    bucket = "nosilha-terraform-state-bucket"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Data source for project information
data "google_project" "project" {
  project_id = var.gcp_project_id
}

# --- Google Cloud Storage (GCS) Bucket ---

resource "google_storage_bucket" "media_storage" {
  # Creates a globally unique bucket name. e.g., "nosilha-com-media-storage-useast1"
  name          = "nosilha-com-${var.media_bucket_name}"
  location      = var.gcp_region
  force_destroy = false # Set to false in production to prevent accidental deletion of non-empty buckets.

  # Enables Uniform Bucket-Level Access for simpler and more consistent permission management.
  uniform_bucket_level_access = true

  website {
    # Although we are not hosting a static site, these settings are sometimes
    # useful for direct linking. They don't affect the IAM permissions.
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# --- IAM Permissions ---

# Granting public read access to all objects in the bucket.
# This allows the Next.js frontend to display images and videos directly.
resource "google_storage_bucket_iam_member" "public_reader" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"

  depends_on = [
    google_storage_bucket.media_storage
  ]
}




# ------------------------------------------------------------------------------
# Google Artifact Registry for Container Images
# ------------------------------------------------------------------------------

resource "google_artifact_registry_repository" "backend_repository" {
  # The user-friendly name for the repository.
  repository_id = "nosilha-backend"

  # Specifies that this repository will store Docker images.
  format = "DOCKER"

  # The GCP region where the repository will be located.
  location = var.gcp_region # This uses the existing "us-east1" variable.

  description = "Docker repository for Nosilha.com backend API images."

  # Optional: Add labels for organization and cost tracking.
  labels = {
    "service" = "nosilha-backend"
    "env"     = "shared"
  }

  # Cost control. Every deploy pushes a SHA-tagged image and nothing ever removed
  # them: as of 2026-07 this repo held 65 versions / ~2.1 GB against a 0.5 GB free
  # tier, growing with every merge to main.
  #
  # KEEP takes precedence over DELETE in Artifact Registry, so the 10 most recent
  # versions always survive regardless of age — the live image and its rollback
  # targets can never be pruned. Everything else older than 30 days is removed.
  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-stale-versions"
    action = "DELETE"
    condition {
      older_than = "2592000s" # 30 days
    }
  }
}

resource "google_artifact_registry_repository" "frontend_repository" {
  # The user-friendly name for the repository.
  repository_id = "nosilha-frontend"

  # Specifies that this repository will store Docker images.
  format = "DOCKER"

  # The GCP region where the repository will be located.
  location = var.gcp_region # This uses the existing "us-east1" variable.

  description = "Docker repository for Nosilha.com frontend UI images."

  # Optional: Add labels for organization and cost tracking.
  labels = {
    "service" = "nosilha-frontend"
    "env"     = "shared"
  }

  # Cost control — see backend_repository above. This is the bigger offender:
  # 70 versions / ~6.4 GB as of 2026-07, against a 0.5 GB free tier.
  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-stale-versions"
    action = "DELETE"
    condition {
      older_than = "2592000s" # 30 days
    }
  }
}

# ------------------------------------------------------------------------------
# Terraform State Management Infrastructure
# ------------------------------------------------------------------------------

# GCS bucket for storing Terraform state
# This must be created before configuring the backend
resource "google_storage_bucket" "terraform_state" {
  name          = "nosilha-terraform-state-bucket"
  location      = var.gcp_region
  force_destroy = false # Prevent accidental deletion of state files

  # Enable versioning to keep history of state files
  versioning {
    enabled = true
  }

  # Enable uniform bucket-level access for better security
  uniform_bucket_level_access = true

  # Lifecycle management to prevent excessive storage costs
  lifecycle_rule {
    condition {
      age = 90 # Keep state versions for 90 days
    }
    action {
      type = "Delete"
    }
  }

  # Labels for organization
  labels = {
    "purpose" = "terraform-state"
    "env"     = "shared"
  }
}
