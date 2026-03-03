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

## Security Decisions

### Workload Identity Federation (No Service Account Keys)

**Decision:** Use OIDC tokens from GitHub Actions instead of long-lived service account keys.

**Why:**
- **No credential management:** OIDC tokens expire in 10 minutes, automatically rotated
- **Reduced attack surface:** No JSON key files to secure or accidentally commit
- **Audit trail:** All actions tied to specific GitHub workflow runs
- **Zero trust:** Each deployment authenticates fresh with short-lived tokens

**Trade-offs:**
- ✅ More secure (no long-lived credentials to steal or rotate)
- ✅ No manual key rotation procedures needed
- ⚠️ More complex initial setup (requires Workload Identity Pool configuration)
- ⚠️ GitHub Actions dependency (must use GitHub, can't use other CI/CD without changes)

**How it works:**
```
GitHub Actions → OIDC Token → Workload Identity Pool → Service Account Impersonation → GCP Resources
```

**Configuration:** See `iam.tf:219-267` for Workload Identity Pool and provider setup.

**GitHub Actions Usage:**
```yaml
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider'
    service_account: 'nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com'
```

### IAM Role Assignments (Principle of Least Privilege)

**Decision:** Each service account has only the minimum permissions required for its specific function.

**Why:**
- Limits blast radius if a service account is compromised
- Follows Google Cloud security best practices
- Makes permission audits straightforward

**Service Account Roles:**

| Service Account | Purpose | Key Permissions | Rationale |
|----------------|---------|-----------------|-----------|
| **nosilha-cicd-deployer** | GitHub Actions CI/CD | `artifactregistry.writer`<br>`run.developer`<br>`iam.serviceAccountUser` | Can push images and deploy services, but cannot modify IAM or secrets |
| **nosilha-backend-runner** | Backend runtime | `secretmanager.secretAccessor`<br>`storage.objectAdmin`<br>`datastore.user` | Can access secrets and data, but cannot modify infrastructure |
| **nosilha-frontend-runner** | Frontend runtime | `secretmanager.secretAccessor` | Minimal permissions for static site serving |

**Important:** The CI/CD service account also needs `roles/editor` granted **manually** (not via Terraform) for domain mapping capabilities. This is a GCP limitation - see `iam.tf:163-172`.

**Secret Access Pattern:**
- Service accounts can only access secrets, not create or modify them
- Prevents application bugs from corrupting production credentials
- Secret versions are **pinned** (e.g., `version = 3`) not "latest" for predictable deployments

**Configuration:**
- Service accounts: `iam.tf:11-39`
- IAM role bindings: `iam.tf:93-161`
- Secret access permissions: `iam.tf:163-217`

## Cost Optimization

### cpu_idle = true (Critical for Free Tier)

**Decision:** Set `cpu_idle = true` on all Cloud Run services.

**Why:**
- **Cloud Run charges for CPU time** - with `cpu_idle = true`, CPU is only allocated during active request handling
- **Scale to zero:** When idle, services use **zero CPU seconds** (completely free)
- **Free tier alignment:** Google's free tier includes 360,000 vCPU-seconds/month - `cpu_idle = true` maximizes this allowance

**Trade-offs:**
- ✅ Massively reduces costs (can stay at $0 for low traffic)
- ✅ No CPU charges during container startup or idle time
- ⚠️ Slightly slower cold starts (~200-500ms additional latency)
- ⚠️ Not suitable for background processing or long-running tasks

**Impact Example:**
- **Without cpu_idle:** 24/7 idle backend = ~2.6M CPU-seconds/month = $20-40/month
- **With cpu_idle:** Same backend with 10K requests = ~5K CPU-seconds = **$0/month** (within free tier)

**Configuration:**
- Backend: `cloudrun.tf:54-63` (1 vCPU, 1Gi memory, cpu_idle = true)
- Frontend: `cloudrun.tf:185-257` (1 vCPU, 256Mi memory, cpu_idle = true)

### Free Tier Strategy

**Decision:** Architect infrastructure to stay within GCP's generous free tier limits.

**Why:**
- Volunteer-supported community project with minimal budget
- Free tier is sufficient for ~10,000 monthly active users
- Predictable costs for sustainability

**Free Tier Limits & Our Usage:**

| Service | Free Tier | Our Configuration | Expected Usage |
|---------|-----------|-------------------|----------------|
| **Cloud Run** | 2M requests/month<br>360K vCPU-seconds<br>180K GiB-seconds | `min_instances = 0`<br>`cpu_idle = true`<br>Auto-scale to zero | ~500K requests<br>~5K CPU-seconds<br>~3K GiB-seconds |
| **Cloud Storage** | 5 GB storage<br>5K Class A ops | 1 bucket<br>Public read access | ~2 GB media<br>~1K uploads/month |
| **Artifact Registry** | 0.5 GB storage | 2 repositories<br>~10 images | ~300 MB |
| **Secret Manager** | 10K access ops | 5 secrets<br>Pinned versions | ~2K accesses/month |
| **Firestore** | 1 GB storage<br>50K reads/day | Default database | ~100 MB<br>~5K reads/day |
| **Monitoring** | 50 uptime checks | 2 checks only | Well under limit |

**Monthly Cost Estimate:** $0-5/month with current architecture

**Key Optimizations:**
1. **Pinned secret versions** (not "latest") - predictable Secret Manager costs
2. **DATA_READ audit logging disabled** - prevents quota exhaustion (see `monitoring.tf:143-147`)
3. **Max instances limited** - backend max 3, frontend max 2 (prevents runaway scaling)
4. **Budget alert at $5** - early warning before free tier breach (see `monitoring.tf:7-63`)
5. **No monitoring dashboard** - uses free alerting instead of paid dashboards

**Trade-offs:**
- ✅ Sustainable costs for community project
- ✅ Scales gracefully within free tier limits
- ⚠️ Must monitor usage to avoid surprise bills
- ⚠️ May need scaling strategy if usage exceeds 10K MAU

## Prerequisites

### Required Before Running Terraform

1. **GCP Project** with billing enabled
   ```bash
   gcloud projects create nosilha
   gcloud config set project nosilha
   ```

2. **Domain Verification** (for custom domains)
   - Verify ownership of `nosilha.com` in [Google Cloud Console](https://cloud.google.com/run/docs/mapping-custom-domains#verify)

3. **Secret Manager Secrets** (create manually)
   ```bash
   echo -n "your-value" | gcloud secrets create supabase_jwt_secret \
       --data-file=- --replication-policy="automatic"

   # Create all 5 secrets:
   # - supabase_jwt_secret (version 1)
   # - supabase_db_url (version 1)
   # - supabase_db_username (version 3)
   # - supabase_db_password (version 4)
   # - supabase_session_db_url (version 1)
   ```

4. **Software Installed**
   - Terraform v1.0+: `brew install terraform`
   - gcloud CLI: `brew install --cask google-cloud-sdk`

### Required Permissions

Your GCP user account needs:
- `roles/owner` or `roles/editor` on the project
- `roles/resourcemanager.projectIamAdmin` for IAM changes

## Standard Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/bravdigital/nosilha.git
cd nosilha/infrastructure/terraform

# Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project ID

# Authenticate with GCP
gcloud auth application-default login
gcloud config set project nosilha

# Initialize Terraform
terraform init
```

### 2. Review Changes

```bash
# See what will be created/changed
terraform plan

# Save plan for review
terraform plan -out=tfplan

# Inspect saved plan in detail
terraform show tfplan
```

### 3. Apply Changes

```bash
# Apply from saved plan (recommended)
terraform apply tfplan

# Or apply directly (will show plan first)
terraform apply

# Type 'yes' to confirm
```

**First-time setup note:** After first apply, manually grant Editor role to CI/CD service account:
```bash
gcloud projects add-iam-policy-binding nosilha \
    --member="serviceAccount:nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com" \
    --role="roles/editor"
```

### 4. Verify Deployment

```bash
# Check Cloud Run services are running
gcloud run services list --region=us-east1

# Test backend health
curl https://nosilha-backend-api-[random].a.run.app/actuator/health

# View outputs
terraform output
```

## Quick Reference

### Common Commands

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

### Updating Resources

```bash
# Update Cloud Run service (e.g., new image)
# Edit cloudrun.tf, then:
terraform plan
terraform apply

# Update environment variables
# Edit cloudrun.tf env block, then:
terraform apply

# Rotate secret version
# 1. Create new version in Secret Manager UI
# 2. Update version number in cloudrun.tf
# 3. terraform apply
```

### Troubleshooting

**State Lock Errors:**
```bash
# If another process holds the lock, force unlock (use carefully)
terraform force-unlock LOCK_ID
```

**Out of Sync State:**
```bash
# Import existing resource
terraform import google_cloud_run_service.backend projects/nosilha/locations/us-east1/services/nosilha-backend-api

# Refresh state from GCP
terraform refresh
```

**Workload Identity Auth Fails:**
- Verify GitHub repository is `bravdigital/nosilha` (hardcoded in `iam.tf:246`)
- Check Workload Identity Pool exists: `gcloud iam workload-identity-pools list --location=global`
- Ensure GitHub Actions uses correct workflow file path (any `.yml` in `.github/workflows/`)

## Additional Resources

- [Terraform Google Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Workload Identity Federation Guide](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run Free Tier Details](https://cloud.google.com/run/pricing#tables)
- [Project CI/CD Pipeline](../../docs/CI_CD_PIPELINE.md)
- [GCP Troubleshooting Guide](../../docs/GCLOUD_CLOUD_RUN_TROUBLESHOOTING.md)
