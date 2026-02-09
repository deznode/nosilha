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

The project uses a **modular CI/CD architecture** with service-specific workflows. See `docs/ci-cd-pipeline.md` for comprehensive details.

### Key Workflows

| Workflow | Path | Purpose |
|----------|------|---------|
| Backend CI/CD | `.github/workflows/backend-ci.yml` | Spring Boot/Kotlin pipeline with full test suite |
| Frontend CI/CD | `.github/workflows/frontend-ci.yml` | Next.js/React pipeline (TypeScript + ESLint + build only) |
| Infrastructure CI/CD | `.github/workflows/infrastructure-ci.yml` | Terraform infrastructure management |
| PR Validation | `.github/workflows/pr-validation.yml` | Consolidated PR validation |
| Integration Tests | `.github/workflows/integration-ci.yml` | Backend integration + security validation |
| Content Validation | `.github/workflows/content-validation.yml` | MDX content validation |
| Link Check | `.github/workflows/link-check.yml` | Documentation link validation |
| Security Scan | `.github/workflows/reusable-security-scan.yml` | Reusable security scanning (Trivy, ktlint, ESLint) |
| Budget Alerts | `.github/workflows/setup-budget-alerts.yml` | GCP budget alert configuration |

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
- **Security Scanning**: Trivy (containers/deps), ktlint (Kotlin style), ESLint (TypeScript), tfsec (Terraform)

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

**Note**: Media storage in production is deferred. Local filesystem is used for development only.

## Reference

- See `docs/ci-cd-pipeline.md` for detailed CI/CD setup and troubleshooting
- See `docs/secret-management.md` for secret management guide
