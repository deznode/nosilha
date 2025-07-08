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

variable "media_bucket_name" {
  type        = string
  description = "The suffix for the media storage bucket name."
  default     = "media-storage-useast1"
}

variable "api_image_tag" {
  type        = string
  description = "The tag of the nosilha-core-api image to deploy (e.g., git commit SHA, 'latest')."
  default     = "latest"
}

variable "frontend_image_tag" {
  type        = string
  description = "The tag of the nosilha-web-ui image to deploy (e.g., git commit SHA, 'latest')."
  default     = "latest"
}

variable "billing_account_id" {
  type        = string
  description = "The billing account ID for budget monitoring."
  default     = null
}

variable "budget_notification_channels" {
  type        = list(string)
  description = "List of notification channels for budget alerts."
  default     = []
}

variable "budget_pubsub_topic" {
  type        = string
  description = "Pub/Sub topic for budget notifications."
  default     = null
}

variable "github_owner" {
  type        = string
  description = "GitHub repository owner/organization name."
  default     = "bravdigital"
}

variable "github_repository" {
  type        = string
  description = "GitHub repository name."
  default     = "nosilha"
}
