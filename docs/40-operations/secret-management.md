# Secret Management Guide

This document describes secret management for Nos Ilha, optimized for Google Cloud's free tier.

## Overview

**Architecture**: Google Cloud Secret Manager → Cloud Run Environment Variables → Spring Boot Properties

**Why Environment Variables** (not Spring Cloud GCP):
- Simple, reliable, fast startup (critical for Cloud Run cold starts)
- 1 access operation per secret per container startup (~120 ops/month vs 10,000 free limit)
- Already working - no additional dependencies

## Current Secrets Inventory

| Secret | Service | Version | Purpose |
|--------|---------|---------|---------|
| `supabase_db_url` | Backend | 3 | Database connection (Session Mode pooler) |
| `supabase_db_username` | Backend | 3 | Database credentials |
| `supabase_db_password` | Backend | 4 | Database credentials |
| `supabase_session_db_url` | Backend | 1 | Flyway migrations connection |
| `supabase_jwt_secret` | Backend | - | JWT validation (IAM configured, not injected) |
| `resend_api_key` | Frontend | 1 | Newsletter email service |
| `gemini_api_key` | Backend | 1 | Google Gemini API authentication |

**Free Tier Limits**: 6 active versions, 10,000 access operations/month

**Current Usage**: 7 secrets configured across backend and frontend services

> **Note**: Cloud Vision uses GCP Application Default Credentials (same service account as Cloud Run) — no separate secret needed.

## Secret Rotation

### Step-by-Step Process

1. **Create new secret version**:
   ```bash
   echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=-
   ```

2. **Update Terraform** (`infrastructure/terraform/cloudrun.tf`):
   ```hcl
   env {
     name = "SPRING_DATASOURCE_PASSWORD"
     value_source {
       secret_key_ref {
         secret  = "supabase_db_password"
         version = "5"  # Increment version
       }
     }
   }
   ```

3. **Deploy**:
   ```bash
   cd infrastructure/terraform
   terraform plan && terraform apply
   ```

4. **Cleanup old version** (important for free tier):
   ```bash
   gcloud secrets versions destroy OLD_VERSION --secret=SECRET_NAME
   ```

### Rotation Schedule
- **Production**: Quarterly (stays within 3 free notifications/quarter)
- **Emergency**: Immediate (may temporarily exceed free tier)

## Monitoring

Monitoring is **Terraform-managed** in `infrastructure/terraform/monitoring.tf`:

| Resource | What It Does |
|----------|--------------|
| `google_billing_budget.project_budget` | $5 budget with alerts at 25%, 50%, 75%, 100% |
| `google_project_iam_audit_config.secret_manager_audit` | Tracks ADMIN_READ and DATA_WRITE (DATA_READ disabled for cost) |
| `google_logging_metric.secret_manager_operations` | Counts admin/write operations |
| `google_monitoring_alert_policy.secret_manager_admin_alert` | Alerts on >5 admin ops in 15 minutes |

### Quick Checks

```bash
# View recent secret operations
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=10 --format="table(timestamp,protoPayload.methodName)"

# List active versions for a secret
gcloud secrets versions list SECRET_NAME --filter="state:enabled"

# Check this month's operations count
gcloud logging read \
  "protoPayload.serviceName=secretmanager.googleapis.com timestamp>=\"$(date +%Y-%m)-01\"" \
  --format="value(timestamp)" | wc -l
```

## Troubleshooting

### Container startup fails with permission denied
```bash
# Check service account has secretAccessor role
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:SERVICE_ACCOUNT_EMAIL"
```

### Secret not updating after rotation
1. Verify Terraform version number is updated
2. Check Cloud Run revision is using new version: `gcloud run services describe SERVICE_NAME --region=us-east1`
3. Restart service if needed

### Approaching free tier limits
Check current usage with the "Quick Checks" commands above. Free limit is 10,000 access operations/month.

## Cost Guidelines

### Do
- Use environment variable injection (startup-time only)
- Pin to specific secret versions in Terraform
- Delete old versions after successful deployment
- Batch secret rotations quarterly

### Don't
- Enable DATA_READ audit logging (exhausts quotas quickly)
- Use "latest" version in production (unpredictable)
- Keep unused secret versions active
- Rotate secrets frequently without need

## Related Documentation

- [Cloud Run Configuration](../infrastructure/terraform/cloudrun.tf)
- [Monitoring Configuration](../infrastructure/terraform/monitoring.tf)
- [IAM Configuration](../infrastructure/terraform/iam.tf)
- [CI/CD Pipeline](ci-cd-pipeline.md)
