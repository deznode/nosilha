# Secret Management Guide

This document describes the cost-optimized secret management strategy for the Nos Ilha platform, designed to stay within Google Cloud's free tier limits.

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

### Budget Monitoring (Enhanced Early Warning)
- **Budget Limit**: $5/month (early warning for free tier breaches)
- **Alert Thresholds**: 25%, 50%, 75%, 100% of budget (optimized for early detection)
- **Services Monitored**: Secret Manager, Cloud Run, Cloud Storage, Artifact Registry

### Secret Manager Usage Tracking (Free Tier Optimized)
- **Administrative Operations**: Tracked via Cloud Audit Logs (ADMIN_READ, DATA_WRITE)
- **Access Operations**: Disabled by default to prevent quota exhaustion
- **Alert Focus**: Unusual administrative activity (creation, deletion, rotation)
- **Cost Impact**: Minimal logging to preserve free tier quotas

### Monitoring Queries

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

### Monitoring Commands
```bash
# Check budget alerts
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID

# View Secret Manager audit logs
gcloud logging read "protoPayload.serviceName=secretmanager.googleapis.com" \
  --limit=10 --format="table(timestamp,protoPayload.methodName,protoPayload.resourceName)"

# List active secret versions
gcloud secrets versions list SECRET_NAME --filter="state:enabled"
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
- [Budget Monitoring](../infrastructure/terraform/monitoring.tf)
- [CI/CD Pipeline](CI_CD_PIPELINE.md)
- [Security Policy](SECURITY.md)