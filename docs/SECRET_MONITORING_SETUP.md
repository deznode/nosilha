# Secret Manager Monitoring Setup Guide

This guide walks through setting up monitoring for Secret Manager usage within Google Cloud's free tier limits.

## Overview

The monitoring setup tracks Secret Manager usage to ensure the Nos Ilha project stays within free tier limits and receives early warnings for potential cost overruns.

**Free Tier Limits:**
- 6 active secret versions
- 10,000 access operations/month
- 3 rotation notifications/month

## Terraform-Managed Monitoring

The monitoring infrastructure is automatically deployed via Terraform in `infrastructure/terraform/monitoring.tf`.

### Budget Alerts

**Budget Configuration:**
```hcl
# $5 monthly budget for early warning
resource "google_billing_budget" "project_budget" {
  amount {
    specified_amount {
      currency_code = "USD"
      units         = "5"
    }
  }

  # Alert thresholds: 50%, 80%, 100%
  threshold_rules {
    threshold_percent = 0.5
  }
}
```

### Audit Logging

**Secret Manager Audit Configuration:**
```hcl
resource "google_project_iam_audit_config" "secret_manager_audit" {
  service = "secretmanager.googleapis.com"

  audit_log_config {
    log_type = "DATA_READ"    # Track secret access
  }
  audit_log_config {
    log_type = "DATA_WRITE"   # Track secret updates
  }
  audit_log_config {
    log_type = "ADMIN_READ"   # Track admin operations
  }
}
```

### Usage Metrics

**Access Operation Counting:**
```hcl
resource "google_logging_metric" "secret_manager_access_count" {
  name = "secret_manager_access_operations"
  filter = <<-EOT
    protoPayload.serviceName="secretmanager.googleapis.com"
    protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
  EOT
}
```

## Manual Monitoring Setup

If you need to set up monitoring manually or verify the Terraform deployment:

### 1. Enable Audit Logging

```bash
# Enable audit logging for Secret Manager
gcloud logging sinks create secret-manager-audit \
  bigquery.googleapis.com/projects/PROJECT_ID/datasets/audit_logs \
  --log-filter='protoPayload.serviceName="secretmanager.googleapis.com"'
```

### 2. Create Custom Metrics

```bash
# Create log-based metric for access operations
gcloud logging metrics create secret_manager_access_operations \
  --description="Count of Secret Manager access operations" \
  --log-filter='protoPayload.serviceName="secretmanager.googleapis.com" protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"'
```

### 3. Set Up Budget Alerts

```bash
# Create budget (requires billing account ID)
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Nos Ilha Free Tier Budget" \
  --budget-amount=5USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.8 \
  --threshold-rule=percent=1.0
```

## Monitoring Queries

### Cloud Logging Queries

**All Secret Manager operations:**
```
protoPayload.serviceName="secretmanager.googleapis.com"
```

**Secret access operations only:**
```
protoPayload.serviceName="secretmanager.googleapis.com"
protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
```

**Operations by specific secret:**
```
protoPayload.serviceName="secretmanager.googleapis.com"
protoPayload.resourceName=~"projects/PROJECT_ID/secrets/SECRET_NAME"
```

**Daily operation count:**
```
protoPayload.serviceName="secretmanager.googleapis.com"
protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
| stats count() by timestamp::date
```

### Cloud Monitoring Queries

**Monthly access operations:**
```
fetch gce_instance
| metric 'logging.googleapis.com/user/secret_manager_access_operations'
| group_by 1m, [value: sum(value)]
| every 1m
```

## Dashboard Setup (Optional)

### Create Custom Dashboard

1. **Navigate to Cloud Monitoring**
   ```
   https://console.cloud.google.com/monitoring/dashboards
   ```

2. **Create New Dashboard**
   - Click "Create Dashboard"
   - Name: "Secret Manager Usage"

3. **Add Charts**

   **Chart 1: Daily Access Operations**
   ```
   Resource Type: Global
   Metric: logging.googleapis.com/user/secret_manager_access_operations
   Filter: None
   Group By: None
   Aggregator: Sum
   ```

   **Chart 2: Budget Utilization**
   ```
   Resource Type: Global
   Metric: billing.googleapis.com/billing/utilization
   Filter: budget.displayName="Nos Ilha Free Tier Budget"
   ```

### Simple Text-Based Monitoring

For minimal overhead, use gcloud commands in scripts:

**check-secret-usage.sh:**
```bash
#!/bin/bash

# Check current month's Secret Manager operations
current_month=$(date +%Y-%m)
operations=$(gcloud logging read \
  "protoPayload.serviceName=secretmanager.googleapis.com protoPayload.methodName=google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion timestamp>=\"${current_month}-01\"" \
  --format="value(timestamp)" | wc -l)

echo "Secret Manager operations this month: $operations / 10000"

# Check active secret versions
for secret in supabase_jwt_secret supabase_db_url supabase_db_username supabase_db_password; do
  versions=$(gcloud secrets versions list $secret --filter="state:enabled" --format="value(name)" | wc -l)
  echo "Active versions for $secret: $versions"
done

echo "Total active versions: $(gcloud secrets versions list --filter="state:enabled" --format="value(name)" | wc -l) / 6"
```

## Alert Notification Setup

### Email Notifications

1. **Create Notification Channel**
   ```bash
   gcloud alpha monitoring channels create \
     --display-name="Budget Alerts" \
     --type=email \
     --channel-labels=email_address=your-email@example.com
   ```

2. **Link to Budget**
   ```bash
   # Update budget to include notification channel
   gcloud billing budgets update BUDGET_ID \
     --notification-channel-ids=CHANNEL_ID
   ```

### Slack Integration (Optional)

```bash
# Create webhook notification channel
gcloud alpha monitoring channels create \
  --display-name="Slack Alerts" \
  --type=webhook_tokenauth \
  --channel-labels=url=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Verification Steps

### Check Monitoring Setup

```bash
# Verify audit logging is enabled
gcloud logging sinks list --filter="name:secret-manager-audit"

# Check log-based metrics
gcloud logging metrics list --filter="name:secret_manager_access_operations"

# Verify budget alerts
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID

# Test query execution
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=1 --format="table(timestamp,protoPayload.methodName)"
```

### Manual Testing

```bash
# Trigger a secret access to test monitoring
gcloud secrets versions access latest --secret=supabase_jwt_secret

# Check if the access appears in logs (may take 1-2 minutes)
gcloud logging read \
  "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=5 \
  --format="table(timestamp,protoPayload.methodName,protoPayload.resourceName)"
```

## Cost Analysis

### Expected Monthly Costs

**With Current Usage Pattern:**
- Budget monitoring: $0 (free tier)
- Audit logging: $0 (within free allowance)
- Secret Manager operations: $0 (120 ops vs 10,000 free)
- Cloud Monitoring: $0 (basic metrics within free tier)

**Total Expected Cost: $0/month**

### Scaling Thresholds

**When costs may occur:**
- \>10,000 Secret Manager operations/month
- \>50GB Cloud Logging ingestion/month
- \>100 custom metrics in Cloud Monitoring
- Budget exceeded (actual cloud resource usage)

## Troubleshooting

### Common Issues

**No audit logs appearing:**
```bash
# Check if audit logging is enabled
gcloud logging sinks describe secret-manager-audit

# Verify IAM permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/logging.configWriter"
```

**Budget alerts not working:**
```bash
# Check budget configuration
gcloud billing budgets describe BUDGET_ID --billing-account=BILLING_ACCOUNT_ID

# Verify notification channels
gcloud alpha monitoring channels list
```

**Metrics not updating:**
```bash
# Check log-based metric configuration
gcloud logging metrics describe secret_manager_access_operations

# Test metric query manually
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" --limit=1
```

## Related Documentation

- [Secret Management Guide](SECRET_MANAGEMENT.md)
- [Budget Monitoring Configuration](../infrastructure/terraform/monitoring.tf)
- [Cloud Run Secret Injection](../infrastructure/terraform/cloudrun.tf)
- [CI/CD Pipeline](CI_CD_PIPELINE.md)