---
paths: infrastructure/**, .github/**
---

# Infrastructure, CI/CD & Cloud Deployment

## Docker Compose Commands

```bash
cd infrastructure/docker
docker-compose up -d    # Start PostgreSQL
docker-compose down     # Stop all services

# Database management
docker-compose exec db psql -U nosilha -d nosilha_db  # Access PostgreSQL
docker-compose exec db pg_dump -U nosilha nosilha_db > backup.sql  # Create backup
```

## CI/CD Pipeline

The project uses a **modular CI/CD architecture** with service-specific workflows. See `docs/40-operations/ci-cd-pipeline.md` for comprehensive details.

### Key Workflows

| Workflow | Path | Purpose |
|----------|------|---------|
| Backend CI/CD | `.github/workflows/backend-ci.yml` | Spring Boot/Kotlin pipeline with full test suite; deploys on main |
| Frontend CI/CD | `.github/workflows/frontend-ci.yml` | Next.js pipeline (Velite + TypeScript + ESLint + build); deploys on main |
| Infrastructure CI/CD | `.github/workflows/infrastructure-ci.yml` | Terraform plan/apply (also scheduled) |
| PR Validation | `.github/workflows/pr-validation.yml` | Nx affected-project detection, global security scan, PR status report |
| Integration & End-to-End | `.github/workflows/integration-ci.yml` | Backend integration, security and deployment health checks (weekly + manual only) |
| Content Validation | `.github/workflows/content-validation.yml` | MDX content validation on PRs |
| External Link Check | `.github/workflows/link-check.yml` | Weekly external link check of `apps/web/content` MDX |
| Security Scan | `.github/workflows/reusable-security-scan.yml` | Reusable scanning (Trivy fs + Terraform config, ktlint, ESLint) |
| Create Release | `.github/workflows/release.yml` | Manual GitHub release; scripts in `.github/workflows/scripts/` |
| Cleanup Old Workflow Runs | `.github/workflows/cleanup-old-runs.yml` | Scheduled deletion of old workflow runs |
| Setup GitHub Budget Alerts | `.github/workflows/setup-budget-alerts.yml` | Manual setup of GitHub Actions minutes budget alerts |

### Key Features

- Path-based triggering
- Comprehensive security scanning
- TypeScript-first quality gates (frontend)
- Direct deployment to production from main branch
- Health monitoring

### Testing Philosophy

Solo-maintained project using lean, budget-conscious CI/CD:
- Frontend uses TypeScript + ESLint only in CI (75% faster)
- E2E tests available locally for pre-release validation

## Integration & Security Testing

- **Backend Integration**: API validation with Testcontainers
- **Security Integration**: Security headers validation, deployment health checks
- **Security Scanning**: Trivy (containers/deps), ktlint (Kotlin style), ESLint (TypeScript), Trivy config scan (Terraform)

## Cloud Deployment

| Service | Description |
|---------|-------------|
| **Platform** | Google Cloud Platform (GCP) |
| **Region** | `us-east1` |
| **Compute** | Cloud Run (auto-scaling serverless containers) |
| **Registry** | Google Artifact Registry (`us-east1-docker.pkg.dev`) |
| **Database** | Supabase PostgreSQL (external) |
| **Secrets** | Google Secret Manager for secure configuration |
| **IaC** | Terraform configurations in `/infrastructure/terraform/` |
| **Media storage** | Cloudflare R2 bucket `nosilha-media` (`cloudflare.tf`), served at media.nosilha.com |
| **DNS** | Cloudflare (`cloudflare.tf`) |

**Note**: Production media is stored in Cloudflare R2 (`R2_ENABLED=true` in `cloudrun.tf`, `cloudflare.r2.*` in `application.yml`, credentials in Secret Manager). The R2 custom domain is managed in the Cloudflare dashboard, not Terraform.

## Reference

- See `docs/40-operations/ci-cd-pipeline.md` for detailed CI/CD setup and troubleshooting
- See `docs/40-operations/secret-management.md` for secret management guide
