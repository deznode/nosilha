---
name: deploying-infrastructure
description: CI/CD pipeline management, GCP deployment, and infrastructure automation with cost optimization. Use when managing/troubleshooting GitHub Actions, deploying/releasing to Cloud Run, optimizing/reducing cloud costs, or user mentions 'deployment', 'CI/CD', 'pipeline', 'infrastructure', 'Cloud Run', or needs deployment automation.
---

# DevOps & Infrastructure Specialist

Use when working with CI/CD pipelines, GCP deployment, infrastructure automation, container builds, security scanning, or cost optimization.

## When to Use

- CI/CD pipeline troubleshooting or configuration
- GitHub Actions workflow failures
- GCP deployment to Cloud Run services
- Infrastructure as code with Terraform
- Security scanning or vulnerability remediation
- Cost optimization for volunteer-supported platform
- Container build issues (Spring Boot, Next.js)

## Mandatory Standards

### OIDC Workload Identity
- **Provider**: `projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`
- **Service Account**: `nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com`
- **No Service Account Keys**: OIDC token exchange only

### Modular CI/CD Architecture
- **Path-Based Triggering**: Backend (`backend/**`), Frontend (`frontend/**`), Infrastructure (`infrastructure/**`)
- **Service-Specific Workflows**: Separate pipelines run in parallel
- Reference: `.github/workflows/`

### Cloud Run Configuration
| Service | Build | CPU | Memory | Scale |
|---------|-------|-----|--------|-------|
| Backend | `./gradlew bootBuildImage` | 1 | 1Gi | 0-10 |
| Frontend | Multi-stage Dockerfile | 1 | 512Mi | 0-5 |

### Cost-First Design
- Scale-to-zero configuration
- Budget target: <$50/month
- See [references/gcp-optimization.md](references/gcp-optimization.md)

## Workflows

### Troubleshoot CI/CD Failures
1. Analyze workflow logs for error messages
2. Identify failed job and step
3. Validate dependencies (PostgreSQL, APIs)
4. Review security scan results
5. Test locally before fixing

### Update Workflows
1. Review existing patterns in `.github/workflows/`
2. Consult `docs/CI_CD_PIPELINE.md`
3. Test in non-production branch
4. Maintain modular architecture

### Deploy to Cloud Run
1. Build container image
2. Push to Artifact Registry
3. Deploy with health check validation
4. Verify zero-downtime traffic shift
5. Run post-deployment health check

## Security Scanning

100% vulnerability scanning coverage with Trivy, detekt, ESLint, tfsec.
See [references/security-scanning.md](references/security-scanning.md) for details.

## Infrastructure Operations

Terraform state, Cloud Run health, IAM, containerization, and deployment patterns.
See [references/infrastructure-operations.md](references/infrastructure-operations.md) for details.

## Documentation References

**Always consult before changes**:
- `docs/CI_CD_PIPELINE.md` - Comprehensive CI/CD architecture
- `.github/workflows/backend-ci.yml` - Backend pipeline
- `.github/workflows/frontend-ci.yml` - Frontend pipeline
- `infrastructure/terraform/main.tf` - GCP infrastructure

## Best Practices

1. Reference `docs/CI_CD_PIPELINE.md` first
2. Follow existing workflow patterns
3. Prioritize free tier and <$50/month budget
4. Run all security tools before deployment
5. Use OIDC authentication (never store keys)
6. Maintain service-specific pipeline separation
