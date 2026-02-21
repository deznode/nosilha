# Terraform Infrastructure

Google Cloud Platform infrastructure for the Nos Ilha cultural heritage platform.

## Overview

This Terraform configuration manages the complete GCP infrastructure for our containerized Spring Boot backend and Next.js frontend, both deployed on Cloud Run. The infrastructure is optimized for **free tier usage** with **security-first** design principles.

**What Gets Created:**
- 2 Cloud Run services (backend API, frontend)
- 2 Artifact Registry repositories (container images)
- 1 GCS bucket (media storage)
- 1 Firestore database (metadata)
- 3 service accounts (CI/CD, backend runtime, frontend runtime)
- 1 Workload Identity Pool (GitHub Actions OIDC)
- 5 Secret Manager secrets (database credentials, JWT)
- 2 uptime checks + 1 budget alert (optional)
- 3 domain mappings (nosilha.com, www.nosilha.com, api.nosilha.com)

**Location:** `us-east1` (South Carolina, USA)

**Remote State:** GCS bucket `nosilha-terraform-state-bucket` with 90-day versioning

## Quick Reference

```bash
# View current state
terraform show

# List resources
terraform state list

# View specific resource
terraform state show google_cloud_run_service.backend

# View outputs
terraform output
terraform output backend_service_url

# Refresh state from GCP
terraform refresh

# Format configuration files
terraform fmt

# Validate configuration
terraform validate

# Destroy all infrastructure (⚠️ destructive)
terraform destroy
```

## Prerequisites

1. **GCP Project** with billing enabled
   ```bash
   gcloud projects create nosilha
   gcloud config set project nosilha
   ```

2. **Domain Verification** for custom domains via [Google Cloud Console](https://cloud.google.com/run/docs/mapping-custom-domains#verify)

3. **Secret Manager Secrets** (create manually before first apply)
   - `supabase_jwt_secret`, `supabase_db_url`, `supabase_db_username`, `supabase_db_password`, `supabase_session_db_url`

4. **Software**: Terraform v1.0+ and gcloud CLI

5. **Permissions**: `roles/owner` or `roles/editor` + `roles/resourcemanager.projectIamAdmin`

## Standard Workflow

### 1. Initial Setup

```bash
cd nosilha/infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project ID

gcloud auth application-default login
gcloud config set project nosilha
terraform init
```

### 2. Review and Apply

```bash
terraform plan -out=tfplan    # Review changes
terraform show tfplan         # Inspect plan details
terraform apply tfplan        # Apply changes
```

### 3. Post-Apply Setup

After first apply, manually grant Editor role to CI/CD service account:
```bash
gcloud projects add-iam-policy-binding nosilha \
    --member="serviceAccount:nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com" \
    --role="roles/editor"
```

### 4. Verify Deployment

```bash
gcloud run services list --region=us-east1
curl https://nosilha-backend-api-[random].a.run.app/actuator/health
terraform output
```

## Key Decisions

This infrastructure follows two key architectural decisions documented in ADRs:

**[ADR 0005: Workload Identity Federation](../../docs/20-architecture/adr/0005-workload-identity-federation.md)** — CI/CD authentication uses OIDC tokens from GitHub Actions instead of long-lived service account keys. This eliminates credential management overhead and follows zero-trust principles.

**[ADR 0006: Free Tier Cost Optimization](../../docs/20-architecture/adr/0006-free-tier-cost-optimization.md)** — Infrastructure is architected to stay within GCP's free tier limits (~$0-5/month) using `cpu_idle = true`, scale-to-zero, and budget alerting.

## Updating Resources

```bash
# Update Cloud Run service (e.g., new image)
# Edit cloudrun.tf, then:
terraform plan && terraform apply

# Rotate secret version
# 1. Create new version in Secret Manager UI
# 2. Update version number in cloudrun.tf
# 3. terraform apply
```

## Troubleshooting

**State Lock Errors:**
```bash
terraform force-unlock LOCK_ID  # Use carefully
```

**Out of Sync State:**
```bash
terraform import google_cloud_run_service.backend projects/nosilha/locations/us-east1/services/nosilha-backend-api
terraform refresh
```

**Workload Identity Auth Fails:**
- Verify GitHub repository is `bravdigital/nosilha` (hardcoded in `iam.tf:246`)
- Check pool exists: `gcloud iam workload-identity-pools list --location=global`
- Ensure workflow uses correct file path (any `.yml` in `.github/workflows/`)

## Additional Resources

- [Terraform Google Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Project CI/CD Pipeline](../../docs/40-operations/ci-cd-pipeline.md)
