# ------------------------------------------------------------------------------
# Google Cloud Firestore Database
# ------------------------------------------------------------------------------

# Google Cloud Firestore Database
# 
# IMPORTANT: Enabling Firestore in a project is a permanent decision.
# The location cannot be changed after it's set, and the database cannot be deleted
# once created. This resource provisions the default Firestore database in native mode.
resource "google_firestore_database" "default" {
  # The project ID where the database will be created
  project = var.gcp_project_id

  # The database name - must be "(default)" for the default database
  name = "(default)"

  # The location for the database - must match our primary region
  # This cannot be changed after creation
  location_id = var.gcp_region # "us-east1"

  # The database type - FIRESTORE_NATIVE provides the full Firestore feature set
  type = "FIRESTORE_NATIVE"

  # Ensure the Firestore API is enabled before creating the database
  depends_on = [
    google_project_service.firestore
  ]
}