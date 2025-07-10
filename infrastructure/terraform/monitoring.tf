# ------------------------------------------------------------------------------
# Budget Monitoring and Cost Control
# ------------------------------------------------------------------------------

# Budget alert for the entire project
# This helps keep costs within free tier limits
resource "google_billing_budget" "project_budget" {
  count = var.billing_account_id != null ? 1 : 0

  billing_account = var.billing_account_id
  display_name    = "Nosilha Project Budget"

  # Set budget amount (adjust based on your needs)
  amount {
    specified_amount {
      currency_code = "USD"
      units         = "50" # $50 monthly budget
    }
  }

  # Budget filter to monitor specific services
  budget_filter {
    projects = ["projects/${var.gcp_project_id}"]

    # Monitor key services that could incur costs
    services = [
      "services/95FF2659-D8B0-4BF9-9B9B-8E2F5DE5C1B3", # Cloud Run
      "services/A1E8782F-CF0D-4A1A-BF1F-0F3AB8B5A0B1", # Cloud Storage
      "services/6F81-5844-456A-842A-D13A6B5C3D4E",     # Artifact Registry
      "services/24E6F81D-57DE-4DE2-9F1A-7D8D5BE5C93B", # Secret Manager
    ]
  }

  # Threshold rules for alerts
  threshold_rules {
    threshold_percent = 0.5 # Alert at 50% of budget
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.8 # Alert at 80% of budget
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0 # Alert at 100% of budget
    spend_basis       = "CURRENT_SPEND"
  }

  # Notification configuration
  all_updates_rule {
    monitoring_notification_channels = var.budget_notification_channels
    pubsub_topic                     = var.budget_pubsub_topic
  }

  # Ensure billing API is enabled
  depends_on = [google_project_service.billing, google_project_service.billing_budgets]
}

# ------------------------------------------------------------------------------
# Note: Monitoring dashboard removed to minimize costs for community project
# Basic Cloud Run metrics are still available in the GCP console
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Uptime Checks for Service Availability
# ------------------------------------------------------------------------------

# Uptime check for backend API
resource "google_monitoring_uptime_check_config" "backend_uptime_check" {
  display_name = "Nosilha Backend API Uptime Check"
  timeout      = "10s"
  period       = "300s" # Check every 5 minutes

  http_check {
    path         = "/actuator/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = replace(google_cloud_run_v2_service.nosilha_backend_api.uri, "https://", "")
    }
  }

  depends_on = [google_project_service.monitoring]
}

# Uptime check for frontend
resource "google_monitoring_uptime_check_config" "frontend_uptime_check" {
  display_name = "Nosilha Frontend Uptime Check"
  timeout      = "10s"
  period       = "300s" # Check every 5 minutes

  http_check {
    path         = "/"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = replace(google_cloud_run_v2_service.nosilha_frontend.uri, "https://", "")
    }
  }

  depends_on = [google_project_service.monitoring]
}