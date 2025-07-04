# main.tf
#
# Defines the core infrastructure for Nosilha.com's media storage on GCP.
# This includes the GCS bucket for storing media files and the service account
# that the backend API will use to upload those files.

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.39.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
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
}




# ------------------------------------------------------------------------------
# Google Artifact Registry for Container Images
# ------------------------------------------------------------------------------

resource "google_artifact_registry_repository" "api_repository" {
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
}
