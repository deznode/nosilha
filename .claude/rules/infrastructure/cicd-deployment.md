---
paths: infrastructure/**, .github/**
---

# Infrastructure, CI/CD & Cloud Deployment

## Docker Compose Commands

```bash
cd infrastructure/docker
docker-compose up -d    # Start PostgreSQL, Firestore & GCS emulators
docker-compose down     # Stop all services

# Database management
docker-compose exec postgres psql -U nosilha -d nosilha_db  # Access PostgreSQL
docker-compose exec postgres pg_dump -U nosilha nosilha_db > backup.sql  # Create backup
```

## CI/CD Pipeline

The project uses a **modular CI/CD architecture** with service-specific workflows. See `docs/CI_CD_PIPELINE.md` for comprehensive details.

### Key Workflows

| Workflow | Path | Purpose |
|----------|------|---------|
| Backend CI/CD | `.github/workflows/backend-ci.yml` | Spring Boot/Kotlin pipeline with full test suite |
| Frontend CI/CD | `.github/workflows/frontend-ci.yml` | Next.js/React pipeline (TypeScript + ESLint + build only) |
| Infrastructure CI/CD | `.github/workflows/infrastructure-ci.yml` | Terraform infrastructure management |
| PR Validation | `.github/workflows/pr-validation.yml` | Consolidated PR validation |
| Integration Tests | `.github/workflows/integration-ci.yml` | Backend integration + security validation |

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
- **Security Scanning**: Trivy (containers/deps), detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)

## Cloud Deployment

| Service | Description |
|---------|-------------|
| **Platform** | Google Cloud Platform (GCP) |
| **Region** | `us-east1` |
| **Compute** | Cloud Run (auto-scaling serverless containers) |
| **Registry** | Google Artifact Registry (`us-east1-docker.pkg.dev`) |
| **Storage** | Google Cloud Storage for media assets |
| **Secrets** | Google Secret Manager for secure configuration |
| **IaC** | Terraform configurations in `/infrastructure/terraform/` |

## Reference

- See `docs/CI_CD_PIPELINE.md` for detailed CI/CD setup and troubleshooting
- See `docs/SECRET_MANAGEMENT.md` for secret management guide
