# GCP Cost Optimization Guide

This guide provides strategies for maintaining sustainable infrastructure costs (<$50/month) for the volunteer-supported Nos Ilha cultural heritage platform using Google Cloud Platform Always Free tier and cost-effective practices.

## Cost Optimization Philosophy

**Community Budget Priority**: As a volunteer-supported cultural heritage project preserving Cape Verdean traditions, infrastructure costs must remain minimal while maintaining reliable service for the global diaspora community.

**Target**: <$50/month total infrastructure cost
**Strategy**: Maximize Always Free tier services + scale-to-zero patterns + open source tools

## Always Free Tier Services

### Cloud Run (Serverless Compute)

**Free Tier Limits** (per month):
- 2 million requests
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time
- 1GB of outbound data

**Optimization Strategies**:

1. **Scale-to-Zero Configuration**:
```bash
gcloud run deploy backend \
  --min-instances=0 \
  --region=us-east1
```
- Instances automatically shut down when idle
- No cost during zero-traffic periods
- Cold start penalty acceptable for cultural heritage platform

2. **Resource Right-Sizing**:
```bash
# Backend (Spring Boot)
--memory=1Gi \
--cpu=1 \
--concurrency=1000

# Frontend (Next.js)
--memory=512Mi \
--cpu=1 \
--concurrency=500
```
- Minimal resources sufficient for platform workload
- 1 CPU + appropriate memory balances performance and cost

3. **Request Concurrency Optimization**:
```yaml
# Cloud Run configuration
containerConcurrency: 1000  # Backend
containerConcurrency: 500   # Frontend
```
- Higher concurrency reduces instance count
- Fewer instances = lower cost
- Spring Boot and Next.js handle concurrency well

4. **Timeout Configuration**:
```bash
--timeout=300  # 5 minutes maximum
```
- Appropriate timeout prevents hung requests
- Releases resources for other requests

**Cost Monitoring**:
```bash
# Check current month usage
gcloud run services describe backend --region=us-east1 \
  --format='value(status.traffic[0].percent,status.conditions[0].status)'

# Estimate requests (manual GCP Console review)
# Billing → Reports → Filter by Cloud Run
```

### Artifact Registry (Container Images)

**Free Tier Limits**:
- 0.5 GB storage per month

**Optimization Strategies**:

1. **Image Cleanup Policy**:
```bash
# Delete images older than 30 days
gcloud artifacts repositories set-cleanup-policies nosilha-images \
  --location=us-east1 \
  --policy=delete-images-older-than-30-days.json
```

```json
{
  "rules": [
    {
      "condition": {
        "olderThan": "2592000s"
      },
      "action": {
        "type": "DELETE"
      }
    }
  ]
}
```

2. **Manual Image Pruning**:
```bash
# List all images
gcloud artifacts docker images list us-east1-docker.pkg.dev/nosilha/nosilha-images

# Delete specific old images
gcloud artifacts docker images delete us-east1-docker.pkg.dev/nosilha/nosilha-images/backend:old-tag --quiet
```

3. **Minimize Image Size**:
```dockerfile
# Frontend: Multi-stage build
FROM node:18-alpine AS deps
# ... dependency installation

FROM node:18-alpine AS builder
# ... build step

FROM node:18-alpine AS runner
# ... final minimal image
```

- Use Alpine base images (smaller size)
- Multi-stage builds reduce final image size
- Smaller images = less storage cost

**Storage Monitoring**:
```bash
# Check registry storage usage
gcloud artifacts repositories describe nosilha-images \
  --location=us-east1 \
  --format='value(sizeBytes)'
```

### Secret Manager (Secrets Storage)

**Free Tier Limits**:
- 6 active secret versions

**Optimization Strategies**:

1. **Minimal Secret Count**:
```bash
# Essential secrets only:
- DATABASE_URL
- DATABASE_USERNAME
- DATABASE_PASSWORD
- SUPABASE_JWT_SECRET
- NEXT_PUBLIC_SUPABASE_URL (could be public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (could be public)
```

2. **Version Cleanup**:
```bash
# Destroy old secret versions
gcloud secrets versions destroy <version> --secret=DATABASE_URL
```

3. **Public Environment Variables**:
```dockerfile
# Frontend: Build-time environment variables (not secrets)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```
- Use build args for public configuration
- Reserve Secret Manager for truly sensitive data

**Secret Monitoring**:
```bash
# List all secrets and versions
gcloud secrets list
gcloud secrets versions list DATABASE_URL
```

### Cloud Storage (if needed)

**Free Tier Limits**:
- 5 GB-months of regional storage

**Optimization Strategies**:

1. **Use External Services for Large Assets**:
   - Mapbox for tile caching
   - Cloudflare for CDN (free tier)
   - Consider GitHub for static assets

2. **Lifecycle Policies**:
```bash
gsutil lifecycle set lifecycle.json gs://bucket-name
```

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
```

## Cost Reduction Strategies

### 1. Avoid Paid Services

**Do NOT Use** (unless absolutely necessary):
- Cloud SQL (use self-hosted PostgreSQL or Supabase free tier)
- Cloud Load Balancing (Cloud Run has built-in load balancing)
- Cloud Monitoring (use basic GCP Console metrics + open source tools)
- Cloud Logging (use default Cloud Run logging, manual review)
- BigQuery (not needed for small dataset)
- Cloud CDN (use Cloudflare free tier or Cloud Run direct)

### 2. Self-Hosted Development Environment

**Use Docker Compose for Local Development**:
```yaml
# infrastructure/docker/docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
  gcs:
    image: fsouza/fake-gcs-server
```

- Zero cloud cost for development and testing
- Faster iteration without deployment overhead
- Consistent environment across team

### 3. Open Source Tool Stack

**Free Security Scanning**:
- Trivy (container/dependency vulnerabilities)
- detekt (Kotlin code analysis)
- ESLint (TypeScript security)
- tfsec (Terraform security)

**Alternative to Paid Tools**:
- GitHub Actions (not CircleCI/Jenkins Cloud)
- Manual GCP Console monitoring (not Cloud Monitoring)
- Docker Compose (not Cloud SQL)
- Self-hosted PostgreSQL (not managed database)

### 4. Efficient CI/CD Pipeline

**Cost-Saving Pipeline Patterns**:

1. **Path-Based Triggering**:
```yaml
on:
  push:
    paths:
      - 'backend/**'  # Only rebuild when backend changes
```
- Avoid unnecessary builds
- Reduce compute and storage usage

2. **Parallel Workflow Execution**:
```yaml
jobs:
  backend:
    if: contains(github.event.head_commit.modified, 'backend/')
  frontend:
    if: contains(github.event.head_commit.modified, 'frontend/')
```
- Services build independently
- Faster deployments, less GitHub Actions time

3. **Docker Layer Caching**:
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```
- Reuse cached layers
- Faster builds, lower compute cost

### 5. Traffic Pattern Optimization

**Strategies for Low-Traffic Platform**:

1. **Accept Cold Start Latency**:
   - First request after idle period may take 3-5 seconds
   - Acceptable for cultural heritage platform (not e-commerce)
   - Zero cost when no traffic

2. **Batched Deployments**:
   - Deploy multiple small changes together
   - Reduce deployment frequency
   - Lower deployment-related costs

3. **Off-Peak Usage**:
   - Schedule intensive operations (data imports, migrations) during low traffic
   - Monitor traffic patterns to identify low-usage windows

## Budget Monitoring

### Manual Cost Tracking

**Weekly Review Process**:

1. **GCP Console Billing Report**:
   - Navigate to Billing → Reports
   - Filter by project: `nosilha`
   - Review current month charges
   - Compare to previous month

2. **Service-Level Breakdown**:
```bash
# Check service usage (manual Console review)
# Billing → Cost Table → Group by Service
- Cloud Run: Should be $0-10/month
- Artifact Registry: Should be $0-5/month
- Secret Manager: Should be $0/month (within free tier)
```

3. **Track Trends**:
   - Document monthly costs in spreadsheet
   - Identify cost spikes and investigate
   - Adjust infrastructure if approaching budget

### Cost Alert Thresholds

**Manual Monitoring Thresholds**:
- **$0-25/month**: Green (normal operations)
- **$25-40/month**: Yellow (review and optimize)
- **$40-50/month**: Orange (immediate optimization required)
- **>$50/month**: Red (urgent action, consider service reduction)

### Budget Enforcement

**If Costs Exceed Budget**:

1. **Identify High-Cost Services**:
```bash
# GCP Console Billing → Reports
# Sort by cost descending
```

2. **Optimization Actions**:
   - Reduce Cloud Run max instances
   - Delete unused container images
   - Review Secret Manager version count
   - Consider migrating to cheaper alternatives

3. **Service Reduction** (last resort):
   - Temporarily reduce service availability
   - Pause non-critical features
   - Communicate with community about budget constraints

## Cost Optimization Checklist

### Monthly Review

- [ ] Check total GCP costs for current month
- [ ] Review Cloud Run request count and compute time
- [ ] Verify scale-to-zero configuration active
- [ ] Delete old Artifact Registry images (>30 days)
- [ ] Clean up unused Secret Manager versions
- [ ] Confirm all services within Always Free tier limits
- [ ] Document cost trends in tracking spreadsheet
- [ ] Identify optimization opportunities for next month

### Quarterly Review

- [ ] Analyze traffic patterns and peak usage times
- [ ] Review resource allocation (CPU, memory) for right-sizing
- [ ] Evaluate alternative free-tier services for potential migration
- [ ] Update cost optimization strategies based on platform growth
- [ ] Communicate cost status to volunteer team
- [ ] Plan for potential donations or sponsorship if approaching limits

## Example Cost Breakdown

**Typical Monthly Cost** (actual usage):

```
Cloud Run (Backend):      $0-8/month
  - 500K requests/month (within free tier)
  - 50 hours compute time = $0-8

Cloud Run (Frontend):     $0-5/month
  - 300K requests/month (within free tier)
  - 30 hours compute time = $0-5

Artifact Registry:        $0-3/month
  - 2-3 active images
  - ~400MB total storage = $0-3

Secret Manager:           $0/month
  - 6 active secret versions (within free tier)

Total:                    $0-16/month
```

**Well Within Budget**: Current usage ~$15/month average, leaving substantial margin for growth

## Community Sustainability

### Volunteer Budget Model

**Revenue**: $0/month (fully volunteer-supported)
**Infrastructure Cost**: <$50/month target
**Sustainability**: Always Free tier + donations for overages

### Scaling Considerations

**If Traffic Grows Beyond Free Tier**:

1. **Community Fundraising**:
   - Transparent cost communication to diaspora community
   - Donation campaigns for infrastructure support
   - Sponsorship from Cape Verdean cultural organizations

2. **Alternative Hosting**:
   - Consider Vercel/Netlify free tiers for frontend
   - Migrate to Render/Railway free tiers for backend
   - Evaluate self-hosted options (community server donations)

3. **Tiered Service Model**:
   - Core heritage content always free
   - Premium features for donors (optional)
   - Maintain cultural accessibility priority

## Quick Reference

**Check Current Costs**:
```
GCP Console → Billing → Reports → Filter: nosilha project
```

**Verify Scale-to-Zero**:
```bash
gcloud run services describe backend --region=us-east1 \
  --format='value(spec.template.metadata.annotations.autoscaling.knative.dev/minScale)'
```

**Clean Old Images**:
```bash
gcloud artifacts docker images list us-east1-docker.pkg.dev/nosilha/nosilha-images \
  --filter="createTime<2024-12-01" --format="get(image)" | xargs -I {} gcloud artifacts docker images delete {} --quiet
```

**Review Secret Versions**:
```bash
gcloud secrets versions list DATABASE_URL --filter="state=ENABLED"
```

**Always Free Tier Summary**:
- Cloud Run: 2M requests/month
- Artifact Registry: 0.5GB storage
- Secret Manager: 6 active versions
- Target: <$50/month with substantial free tier buffer

**Remember**: Cultural heritage preservation takes priority. Optimize costs while maintaining service reliability for the Cape Verdean diaspora community discovering their ancestral homeland.
