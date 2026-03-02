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

# ------------------------------------------------------------------------------
# Cloudflare Variables
# ------------------------------------------------------------------------------

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token with Zone:Read, DNS:Edit, Workers R2 Storage:Edit permissions."
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID."
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for nosilha.com."
}

