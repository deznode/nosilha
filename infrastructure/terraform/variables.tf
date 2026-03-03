# variables.tf
#
# Input variables for the Nosilha.com Terraform configuration.

variable "gcp_project_id" {
  type        = string
  description = "The GCP project ID to deploy resources into."
}

variable "gcp_region" {
  type        = string
  description = "The primary GCP region for resource deployment."
  default     = "us-east1"
}

variable "bucket_name_suffix" {
  type        = string
  description = "A suffix to create a unique GCS bucket name."
  default     = "media-storage-useast1"
}
