# ------------------------------------------------------------------------------
# Budget Monitoring and Cost Control
# ------------------------------------------------------------------------------

# Budget alert for the entire project
# This helps keep costs within free tier limits and Secret Manager usage
resource "google_billing_budget" "project_budget" {
  count = var.billing_account_id != null ? 1 : 0

  billing_account = var.billing_account_id
  display_name    = "Nosilha Project Budget (Free Tier Optimized)"

  # Set budget amount optimized for community project
  amount {
    specified_amount {
      currency_code = "USD"
      units         = "5" # $5 monthly budget - early warning for free tier breaches
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

  # Optimized threshold rules for early warning (25%, 50%, 75%)
  threshold_rules {
    threshold_percent = 0.25 # Alert at 25% of budget for early warning
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.5 # Alert at 50% of budget
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.75 # Alert at 75% of budget
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

# ------------------------------------------------------------------------------
# Cloud Audit Logs for Secret Manager Access Tracking (Free Tier Optimized)
# ------------------------------------------------------------------------------

# Enable audit logging for Secret Manager (optimized for free tier)
# IMPORTANT: Only ADMIN_READ and DATA_WRITE enabled to prevent logging quota exhaustion
# DATA_READ logs can rapidly consume free tier quotas with frequent secret access
resource "google_project_iam_audit_config" "secret_manager_audit" {
  project = var.gcp_project_id
  service = "secretmanager.googleapis.com"

  # Track administrative operations (free tier safe)
  audit_log_config {
    log_type = "ADMIN_READ" # Secret creation, deletion, IAM changes
  }

  # Track secret creation/rotation (moderate impact)
  audit_log_config {
    log_type = "DATA_WRITE" # Secret creation/updates
  }

  # DATA_READ disabled to prevent free tier quota exhaustion
  # Enable only when needed for security investigations:
  # audit_log_config {
  #   log_type = "DATA_READ" # Track secret access operations (costly)
  # }

  depends_on = [google_project_service.logging]
}

# Log metric to count Secret Manager operations for budget monitoring
# Note: This tracks admin/write operations only due to audit log configuration above
resource "google_logging_metric" "secret_manager_operations" {
  name   = "secret_manager_operations"
  filter = <<-EOT
    protoPayload.serviceName="secretmanager.googleapis.com"
    (protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.CreateSecret" OR
     protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.UpdateSecret" OR
     protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.DeleteSecret")
  EOT

  metric_descriptor {
    metric_kind  = "GAUGE"
    value_type   = "INT64"
    display_name = "Secret Manager Operations (Admin/Write)"
  }

  depends_on = [google_project_service.logging]
}

# Alert policy for Secret Manager operations (focused on admin activities)
resource "google_monitoring_alert_policy" "secret_manager_admin_alert" {
  display_name = "Secret Manager Admin Operations Alert"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Unusual Secret Manager administrative activity"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/secret_manager_operations\""
      duration        = "900s" # 15-minute evaluation window (cost optimized)
      comparison      = "COMPARISON_GT"
      threshold_value = 5 # Alert on more than 5 admin operations in 15 minutes

      aggregations {
        alignment_period   = "900s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  documentation {
    content = <<-EOT
    This alert triggers when there are unusual Secret Manager administrative operations.

    Possible causes:
    1. Legitimate secret rotation or management
    2. Unauthorized secret access attempts
    3. Automated processes creating/updating secrets

    Free tier considerations:
    - Only admin/write operations are tracked to preserve logging quota
    - DATA_READ logging is disabled to prevent quota exhaustion

    Actions to take:
    1. Review recent secret management activities
    2. Check IAM audit logs for unauthorized access
    3. Verify automated processes are working correctly
    EOT
  }

  depends_on = [
    google_logging_metric.secret_manager_operations,
    google_project_service.monitoring
  ]
}