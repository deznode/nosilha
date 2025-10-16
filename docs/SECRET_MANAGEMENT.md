# Secret Management Guide

This document describes the comprehensive secret management strategy for the Nos Ilha platform, designed to stay within Google Cloud's free tier limits while maintaining security best practices.

## Overview

The Nos Ilha backend uses Google Cloud Secret Manager for secure storage of sensitive configuration data (database credentials, JWT secrets, etc.) with a cost-conscious approach that leverages Cloud Run's environment variable injection.

## Current Architecture

### Secret Storage
- **Service**: Google Cloud Secret Manager
- **Free Tier Limits**: 6 active versions, 10,000 access operations/month, 3 rotation notifications/month
- **Current Usage**: 4 active secrets (JWT secret, DB URL, DB username, DB password)
- **Access Method**: Environment variable injection at container startup

### Cost-Optimized Design
```
Secret Manager → Cloud Run Environment Variables → Spring Boot Properties
```

**Cost Impact**: 1 access operation per secret per container startup (~120 operations/month vs 10,000 free limit)

### Why Environment Variables Over Spring Cloud GCP

**Current Decision (September 2025)**: Defer Spring Cloud GCP Secret Manager integration

**Rationale**:
- ✅ Simple and reliable implementation
- ✅ No additional dependencies or complexity
- ✅ Fast application startup (critical for Cloud Run cold starts)
- ✅ Compatible with Spring Boot 3.4.7
- ✅ Already implemented and working
- ✅ Adequate security for community platform risk profile

**When to Reconsider Spring Cloud GCP**:
- Security requirements change (audit logging becomes mandatory)
- Automatic rotation needed (secrets require frequent rotation)
- Compliance requirements (enhanced audit trail required)
- Team growth (dedicated DevOps resources become available)

See [Spring Cloud GCP Migration Assessment](#spring-cloud-gcp-migration-option) for detailed analysis.

## Secret Configuration

### Terraform Configuration
```hcl
# Pinned version approach for cost predictability
env {
  name = "SUPABASE_JWT_SECRET"
  value_source {
    secret_key_ref {
      secret  = "supabase_jwt_secret"
      version = "1" # Pinned to specific version
    }
  }
}
```

### Spring Boot Integration
```yaml
# application.yml
supabase:
  jwt-secret: ${SUPABASE_JWT_SECRET}

spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

## Secret Rotation Process

### Current Approach (Manual)
1. **Create New Secret Version**:
   ```bash
   echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=-
   ```

2. **Update Terraform Configuration**:
   ```hcl
   # Update version number in cloudrun.tf
   version = "2" # Increment version
   ```

3. **Deploy Updated Configuration**:
   ```bash
   cd infrastructure/terraform
   terraform plan
   terraform apply
   ```

4. **Verify Deployment**:
   ```bash
   # Check Cloud Run service is using new version
   gcloud run services describe SERVICE_NAME --region=us-east1
   ```

5. **Cleanup Old Version** (Important for free tier):
   ```bash
   # Delete old version to free up active version slot
   gcloud secrets versions destroy VERSION_NUMBER --secret=SECRET_NAME
   ```

### Rotation Schedule
- **Production Secrets**: Quarterly rotation (stays within 3 free notifications/quarter)
- **Development Secrets**: As needed
- **Emergency Rotation**: Immediate (may exceed free tier temporarily)

## Monitoring and Alerts

### Terraform-Managed Monitoring

The monitoring infrastructure is automatically deployed via Terraform in `infrastructure/terraform/monitoring.tf`.

#### Budget Alerts

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

**Thresholds**: 25%, 50%, 75%, 100% of budget (optimized for early detection)
**Services Monitored**: Secret Manager, Cloud Run, Cloud Storage, Artifact Registry

#### Audit Logging

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

**Free Tier Optimization**:
- **Administrative Operations**: Tracked via Cloud Audit Logs (ADMIN_READ, DATA_WRITE)
- **Access Operations**: Disabled by default to prevent quota exhaustion
- **Alert Focus**: Unusual administrative activity (creation, deletion, rotation)
- **Cost Impact**: Minimal logging to preserve free tier quotas

#### Usage Metrics

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

### Manual Monitoring Setup

If you need to set up monitoring manually or verify the Terraform deployment:

#### 1. Enable Audit Logging

```bash
# Enable audit logging for Secret Manager
gcloud logging sinks create secret-manager-audit \
  bigquery.googleapis.com/projects/PROJECT_ID/datasets/audit_logs \
  --log-filter='protoPayload.serviceName="secretmanager.googleapis.com"'
```

#### 2. Create Custom Metrics

```bash
# Create log-based metric for access operations
gcloud logging metrics create secret_manager_access_operations \
  --description="Count of Secret Manager access operations" \
  --log-filter='protoPayload.serviceName="secretmanager.googleapis.com" protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"'
```

#### 3. Set Up Budget Alerts

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

### Monitoring Queries

#### Cloud Logging Queries

**All Secret Manager operations:**
```
protoPayload.serviceName="secretmanager.googleapis.com"
```

**Administrative operations (tracked by default):**
```
# Secret Manager admin operations
protoPayload.serviceName="secretmanager.googleapis.com"
(protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.CreateSecret" OR
 protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.UpdateSecret" OR
 protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.DeleteSecret")
```

**Access operations (disabled by default for cost optimization):**
```
# Secret Manager access operations (enable only when needed)
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

#### Cloud Monitoring Queries

**Monthly access operations:**
```
fetch gce_instance
| metric 'logging.googleapis.com/user/secret_manager_access_operations'
| group_by 1m, [value: sum(value)]
| every 1m
```

### Alert Notification Setup

#### Email Notifications

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

#### Slack Integration (Optional)

```bash
# Create webhook notification channel
gcloud alpha monitoring channels create \
  --display-name="Slack Alerts" \
  --type=webhook_tokenauth \
  --channel-labels=url=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Dashboard Setup (Optional)

#### Create Custom Dashboard

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

#### Simple Text-Based Monitoring

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

### Cost Analysis

#### Expected Monthly Costs

**With Current Usage Pattern:**
- Budget monitoring: $0 (free tier)
- Audit logging: $0 (within free allowance)
- Secret Manager operations: $0 (120 ops vs 10,000 free)
- Cloud Monitoring: $0 (basic metrics within free tier)

**Total Expected Cost: $0/month**

#### Scaling Thresholds

**When costs may occur:**
- \>10,000 Secret Manager operations/month
- \>50GB Cloud Logging ingestion/month
- \>100 custom metrics in Cloud Monitoring
- Budget exceeded (actual cloud resource usage)

## Version Management Strategy

### Active Version Limits
- **Free Tier**: 6 active versions maximum
- **Current Usage**: 4 versions (1 per secret)
- **Available Capacity**: 2 additional secrets

### Version Cleanup
```bash
# List all versions of a secret
gcloud secrets versions list SECRET_NAME

# Disable old version (still counts as active)
gcloud secrets versions disable VERSION_NUMBER --secret=SECRET_NAME

# Destroy old version (frees up active version slot)
gcloud secrets versions destroy VERSION_NUMBER --secret=SECRET_NAME
```

### Best Practices
- Always pin to specific versions in Terraform
- Delete old versions after successful deployment
- Keep maximum 1-2 versions per secret to allow for rollback
- Use descriptive labels for version tracking

## Troubleshooting

### Common Issues

**Container startup fails with permission denied**:
```bash
# Check service account has secretAccessor role
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:SERVICE_ACCOUNT_EMAIL"
```

**Secret not updating after rotation**:
- Verify Terraform version number is updated
- Check Cloud Run revision is using new version
- Restart Cloud Run service if needed

**Approaching free tier limits**:
```bash
# Check current usage
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=50 --format="value(timestamp)"
```

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

### Monitoring Commands
```bash
# Check budget alerts
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID

# View Secret Manager audit logs
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=10 --format="table(timestamp,protoPayload.methodName,protoPayload.resourceName)"

# List active secret versions
gcloud secrets versions list SECRET_NAME --filter="state:enabled"

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

## Cost Optimization Guidelines

### Do ✅
- Use environment variable injection for startup-time secrets
- Pin to specific secret versions in Terraform
- Delete old versions after successful deployment
- Monitor usage with budget alerts (25%, 50%, 75% thresholds)
- Batch secret rotations quarterly
- Disable DATA_READ audit logging to preserve quotas
- Use 15-minute evaluation windows for alerts

### Don't ❌
- Enable DATA_READ audit logging by default (exhausts quotas quickly)
- Use Spring Cloud GCP Secret Manager integration for runtime access (adds API costs)
- Use volume mounts for static secrets (adds per-access costs)
- Keep unused secret versions active
- Rotate secrets frequently without need
- Use "latest" version in production (unpredictable costs)
- Use short evaluation windows (increases monitoring costs)

## Security Considerations

### IAM Best Practices
- Service accounts have minimal required permissions
- Use `roles/secretmanager.secretAccessor` only for necessary secrets
- Regular audit of IAM bindings

### Access Patterns
- Secrets loaded only at container startup
- No runtime secret access (cost and security optimization)
- Audit logs enabled for all secret operations

### Compliance
- Cloud Audit Logs provide complete access trail
- Secrets never logged or exposed in application logs
- Environment variables secured within Cloud Run containers

## Spring Cloud GCP Migration Option

### Overview

While our current environment variable approach is adequate, Spring Cloud GCP Secret Manager integration offers enhanced security features for future consideration.

### Implementation Requirements

#### 1. Add Dependency
```kotlin
// backend/build.gradle.kts
implementation("com.google.cloud:spring-cloud-gcp-starter-secretmanager")
```

#### 2. Update Configuration
```yaml
# application.yml
spring:
  cloud:
    gcp:
      project-id: ${SPRING_CLOUD_GCP_PROJECT_ID}
      secretmanager:
        enabled: true
```

#### 3. Update Secret References (Spring Boot 3.4+ Syntax)
```yaml
spring:
  datasource:
    url: ${sm@supabase-db-url}
    username: ${sm@supabase-db-username}
    password: ${sm@supabase-db-password}
```

#### 4. Update Terraform Configuration
```hcl
# Remove environment variable injection from cloudrun.tf
# Keep IAM permissions for runtime secret access
```

### Benefits vs. Trade-offs

#### Security Enhancements
- **Runtime Retrieval**: Secrets fetched at application startup, not exposed in environment
- **Comprehensive Audit Logging**: Cloud Audit Logs track all secret access operations
- **Fine-grained IAM Control**: More granular permissions and conditions
- **Automatic Rotation Support**: Secrets can be rotated without redeployment
- **No Process Visibility**: Secrets not visible in process environment space

#### Performance Impact
- **Startup Delay**: 200-500ms additional startup time per secret fetch
- **API Calls**: Additional Secret Manager API calls during application boot
- **Cold Start Impact**: Increased cold start latency for Cloud Run

#### Complexity Increase
- **Additional Dependencies**: Spring Cloud GCP Secret Manager starter
- **Configuration Changes**: Update application properties and Terraform
- **Testing Complexity**: More integration testing required
- **Troubleshooting**: Additional failure points and debugging complexity

### Decision Summary

**Current Recommendation (September 2025)**: **Defer migration**

**Rationale**:
- Current security is sufficient for application's risk profile
- Performance is critical for Cloud Run cold starts and user experience
- Simplicity is valuable for volunteer-run community project
- Resources are limited and better spent on cultural heritage features

**When to Reconsider**:
- Security requirements change (audit logging becomes mandatory)
- Automatic rotation needed (secrets require frequent rotation)
- Compliance requirements (enhanced audit trail required)
- Team growth (dedicated DevOps resources become available)

## Future Scaling Considerations

### When to Consider Alternatives
- Monthly operations approaching 8,000+ (80% of free tier)
- Need for more than 6 active secret versions
- Requirement for hot secret rotation
- Complex secret management workflows

### Alternative Approaches (if needed)
- HashiCorp Vault on minimal GKE Autopilot
- Encrypted secrets in Cloud Storage
- Client-side encryption with Cloud KMS

## Related Documentation
- [Cloud Run Configuration](../infrastructure/terraform/cloudrun.tf)
- [Budget Monitoring Configuration](../infrastructure/terraform/monitoring.tf)
- [CI/CD Pipeline](CI_CD_PIPELINE.md)
- [Security Policy](SECURITY.md)
- [GCloud Cloud Run Troubleshooting](GCLOUD_CLOUD_RUN_TROUBLESHOOTING.md)
