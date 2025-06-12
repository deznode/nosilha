# main.tf
#
# Defines the core infrastructure for Nosilha.com's media storage on GCP.
# This includes the GCS bucket for storing media files and the service account
# that the backend API will use to upload those files.

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
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
  name          = "nosilha-com-${var.bucket_name_suffix}"
  location      = var.gcp_region
  force_destroy = false # Set to true in dev environments to allow deletion of non-empty buckets.

  # Enables Uniform Bucket-Level Access for simpler and more consistent permission management.
  uniform_bucket_level_access = true

  website {
    # Although we are not hosting a static site, these settings are sometimes
    # useful for direct linking. They don't affect the IAM permissions.
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# --- Service Account for Backend API ---

resource "google_service_account" "api_uploader" {
  account_id   = "nosilha-api-uploader"
  display_name = "Nosilha.com API Uploader Service Account"
  description  = "Service account for the Nosilha Spring Boot backend to upload media to GCS."
}


# --- IAM Permissions ---

# Granting public read access to all objects in the bucket.
# This allows the Next.js frontend to display images and videos directly.
resource "google_storage_bucket_iam_member" "public_reader" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Granting the backend's service account permission to manage objects.
# This allows the Spring Boot API to upload, update, and delete files.
resource "google_storage_bucket_iam_member" "sa_uploader_permissions" {
  bucket = google_storage_bucket.media_storage.name
  role   = "roles/storage.objectAdmin"
  member = google_service_account.api_uploader.member
}


# ------------------------------------------------------------------------------
# MANUAL ACTION REQUIRED: Service Account Key Generation
# ------------------------------------------------------------------------------
#
# For security reasons, service account keys are NOT managed by Terraform.
# After you run `terraform apply`, you must generate and download the key manually.
#
# 1. Go to the GCP Console -> IAM & Admin -> Service Accounts.
# 2. Find the service account: "nosilha-api-uploader@<YOUR_PROJECT_ID>.iam.gserviceaccount.com"
# 3. Click on the service account, go to the "KEYS" tab.
# 4. Click "ADD KEY" -> "Create new key" -> Select "JSON".
# 5. Download the key file and store it securely.
#
# This key will be used by the Spring Boot backend to authenticate with GCP.
# In a production Cloud Run environment, you would typically bind the service
# account directly to the Cloud Run service instead of using a key file.
#
# ------------------------------------------------------------------------------
