# CI/CD Pipeline

Pipeline architecture for Nos Ilha. Uses modular workflows with path-based triggering.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              TRIGGERS                                    │
├──────────────┬──────────────┬──────────────┬───────────────────────────┤
│  Pull Request │ Push to main │   Manual     │ Weekly (Mon 6am UTC)      │
└──────┬───────┴──────┬───────┴──────┬───────┴───────────┬───────────────┘
       │              │              │                   │
       ▼              ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VALIDATION STAGE                                 │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Security Scan     │   Tests & Linting   │   Bundle Analysis (PRs)     │
│   Trivy + ktlint    │   Unit + TypeCheck  │   Size < 500KB              │
└─────────┬───────────┴─────────┬───────────┴─────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BUILD STAGE                                    │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Backend Image     │   Frontend Image    │   Terraform Plan            │
│   Spring Boot       │   Next.js           │   (PRs only)                │
└─────────┬───────────┴─────────┬───────────┴─────────────┬───────────────┘
          │                     │                         │
          ▼                     ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEPLOY STAGE                                    │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│   Cloud Run         │   Cloud Run         │   Terraform Apply           │
│   Backend API       │   Frontend          │   (main only)               │
└─────────┬───────────┴─────────┬───────────┴─────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION                                     │
├─────────────────────────────┬───────────────────────────────────────────┤
│      Health Checks          │         Status Report                      │
└─────────────────────────────┴───────────────────────────────────────────┘
```

## Workflows

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| Backend CI/CD | `backend-ci.yml` | `apps/api/**` | Build, test, deploy Spring Boot |
| Frontend CI/CD | `frontend-ci.yml` | `apps/web/**` | Build, lint, deploy Next.js |
| Infrastructure | `infrastructure-ci.yml` | `infrastructure/**` | Terraform plan/apply |
| PR Validation | `pr-validation.yml` | All PRs to main | Status report, Dependabot auto-merge |
| Integration | `integration-ci.yml` | Main push, Mon 6am UTC | Health checks, security headers |

```
Path Changes → Triggered Workflows
──────────────────────────────────
apps/api/**        → Backend CI, PR Validation, Integration
apps/web/**        → Frontend CI, PR Validation, Integration
infrastructure/**  → Infrastructure CI, PR Validation
```

## Backend CI/CD

**File:** `.github/workflows/backend-ci.yml`

**Jobs:** `security-scan` → `test-and-lint` → `build` → `deploy-production`

**Quality Gates:**
- 70% coverage (JaCoCo)
- Spring Modulith boundaries
- ktlint (detekt disabled for Java 25)
- Trivy HIGH/CRITICAL

**Cloud Run:** `nosilha-backend-api` | 1Gi memory | 0-3 instances

## Frontend CI/CD

**File:** `.github/workflows/frontend-ci.yml`

**Jobs:** `security-scan` → `test-and-lint` → `bundle-analysis` (PRs) → `build` → `deploy-production`

**Quality Gates:**
- TypeScript (`tsc --noEmit`)
- ESLint
- Bundle size < 500KB
- Trivy HIGH/CRITICAL

**Cloud Run:** `nosilha-frontend` | 512Mi memory | 0-2 instances

**Testing:** CI runs TypeScript + ESLint + build only. E2E tests run locally.

## Infrastructure CI/CD

**File:** `.github/workflows/infrastructure-ci.yml`

**Jobs:** `security-scan` → `validate` → `plan` (PRs) → `apply` (main) | `drift-detection` (manual)

**Config:** Terraform 1.12.2 | State: `gs://nosilha-terraform-state-bucket`

## PR Validation

**File:** `.github/workflows/pr-validation.yml`

**Jobs:** `changes` (Nx detection) → `global-security-scan` → `pr-status-report` → `dependabot-auto-merge`

Generates PR comment with component changes and validation results.

## Integration Tests

**File:** `.github/workflows/integration-ci.yml`

**Schedule:** Push to main + Mondays 6am UTC

**Jobs:** `api-integration-tests` (Testcontainers) | `security-integration` (headers) | `deployment-health`

## Manual Deployment

```bash
# Deploy via GitHub Actions
gh workflow run backend-ci.yml --ref main -f deploy=true
gh workflow run frontend-ci.yml --ref main -f deploy=true
gh workflow run backend-ci.yml --ref main -f force_deploy=true  # bypass change detection

# Check service status
gcloud run services list --region=us-east1
curl https://[SERVICE_URL]/actuator/health
```

## Troubleshooting

### Build Failures

```bash
# Backend
cd apps/api && ./gradlew build --stacktrace

# Frontend
cd apps/web && pnpm build && npx tsc --noEmit
```

### Deployment Failures

```bash
# Check logs
gcloud logs read --service=nosilha-backend-api --limit=50

# Check service status
gcloud run services describe nosilha-backend-api --region=us-east1
gcloud run revisions list --service=nosilha-backend-api --region=us-east1
```

### Health Check Failures

```bash
curl -v https://[SERVICE_URL]/actuator/health
# Expected: {"status":"UP","components":{"db":{"status":"UP"},...}}
```

**Common causes:** Cold start (scale-to-zero), database connectivity, secret misconfiguration.

### Terraform Lock Issues

```bash
terraform force-unlock -force [LOCK_ID]
# Automatic cleanup: .github/scripts/terraform-lock-cleanup.sh
```

### Bundle Size Exceeded

```bash
cd apps/web && pnpm build && npx @next/bundle-analyzer
# Fix: dynamic imports, remove unused deps, tree-shaking
```

---

For secrets, see [secret-management.md](./secret-management.md). For security policy, see [SECURITY.md](../../SECURITY.md).
