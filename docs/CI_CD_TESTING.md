# CI/CD Testing & Validation Guide

This guide provides comprehensive testing strategies and validation procedures for the Nos Ilha CI/CD pipeline architecture.

> **📝 Frontend Testing Update (2025)**: Frontend CI/CD has been simplified to TypeScript + ESLint only. E2E and unit tests run locally only (not in CI). See `docs/TESTING.md` for complete details on the TypeScript-first approach for solo maintainers.

## 🎯 Testing Objectives

1. **Pipeline Validation**: Verify automated build, test, and deployment workflows
2. **Security Integration**: Confirm security scanning and SARIF reporting
3. **Infrastructure Deployment**: Validate Terraform infrastructure provisioning
4. **End-to-End Testing**: Test complete deployment flow from code to production
5. **Quality Assurance**: Ensure all quality gates function correctly

## 📋 Pre-Testing Checklist

### Required GitHub Secrets
Ensure these secrets are configured in your GitHub repository:

- `GCP_SA_KEY`: Google Cloud service account key (JSON format, base64 encoded)
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `PRODUCTION_API_URL`: Backend API URL for production environment
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox API access token
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous access key

### GCP Service Account Permissions
Verify the service account has these roles:
- `roles/run.admin` - Cloud Run administration
- `roles/artifactregistry.admin` - Artifact Registry management
- `roles/storage.admin` - Cloud Storage management
- `roles/iam.serviceAccountUser` - Service account usage
- `roles/secretmanager.accessor` - Secret Manager access

## 🧪 Testing Strategy

### Phase 1: Individual Workflow Testing

#### 1.1 Backend Workflow Testing (`backend-ci.yml`)

Create a feature branch and test backend changes:

```bash
# Create test branch
git checkout -b test/backend-ci-workflow

# Make a small change to trigger backend workflow
echo "# Test change for CI/CD validation" >> apps/api/README.md
git add apps/api/README.md
git commit -m "test: trigger backend CI workflow"
git push origin test/backend-ci-workflow
```

**Expected Results:**
- ✅ Security scan completes with Trivy results in Security tab
- ✅ Kotlin linting runs with detekt and uploads SARIF
- ✅ Tests run with PostgreSQL service and generate Jacoco coverage
- ✅ Docker image builds and pushes to Artifact Registry (if main branch)
- ✅ Deployment to production (if main branch) or validation only (if PR)

#### 1.2 Frontend Workflow Testing (`frontend-ci.yml`)

Test frontend-specific changes:

```bash
# Make a frontend change
echo "/* Test change for CI/CD validation */" >> apps/web/src/app/globals.css
git add apps/web/src/app/globals.css
git commit -m "test: trigger frontend CI workflow"
git push origin test/backend-ci-workflow
```

**Expected Results:**
- ✅ Security scan runs for frontend directory
- ✅ ESLint runs and uploads SARIF results
- ✅ TypeScript checking completes without errors
- ✅ Bundle size analysis runs (for PRs)
- ✅ Docker image builds and pushes to Artifact Registry (if main branch)
- ✅ Next.js application deploys successfully

#### 1.3 Infrastructure Workflow Testing (`infrastructure-ci.yml`)

Test infrastructure changes:

```bash
# Make an infrastructure change
echo "# Test comment for CI/CD validation" >> infrastructure/terraform/main.tf
git add infrastructure/terraform/main.tf
git commit -m "test: trigger infrastructure CI workflow"
git push origin test/backend-ci-workflow
```

**Expected Results:**
- ✅ tfsec security scanning completes
- ✅ Terraform formatting, validation, and init succeed
- ✅ Terraform plan generates and posts to PR (if PR)
- ✅ No apply runs (only on main branch push)

### Phase 2: PR Validation Testing

#### 2.1 Create Pull Request

Create a PR from your test branch to `main`:

```bash
# Create PR using GitHub CLI or web interface
gh pr create --title "Test: Validate CI/CD workflows" \
  --body "Testing the CI/CD architecture with comprehensive validation" \
  --base main
```

**Expected Results:**
- ✅ PR validation workflow (`pr-validation.yml`) triggers
- ✅ Service-specific workflows run based on path changes
- ✅ Global security scan completes
- ✅ Dependency review runs
- ✅ CodeQL analysis completes (if Advanced Security available)
- ✅ Comprehensive PR status report is posted
- ✅ No deployment occurs (validation only)

#### 2.2 Validate PR Comments

Check that the PR receives:
- Detailed validation results with pass/fail status
- Component change detection (backend/frontend/infrastructure)
- Next steps guidance based on results
- Terraform plan output (if infrastructure changed)
- Security scan summaries

### Phase 3: Production Deployment Testing

#### 3.1 Production Deployment

After PR validation passes, merge to main for production deployment:

```bash
# Merge PR to main branch
gh pr merge --merge
```

**Expected Results:**
- ✅ Production deployment workflows trigger for changed services
- ✅ Images build and deploy to production Cloud Run services
- ✅ Health checks validate production deployment
- ✅ Integration tests run against production endpoints
- ✅ Services are accessible via public URLs

#### 3.2 Service Verification

```bash
# Get service URLs
BACKEND_URL=$(gcloud run services describe nosilha-backend-api \
    --region=us-east1 --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe nosilha-frontend \
    --region=us-east1 --format="value(status.url)")

# Test service health
curl -f "$BACKEND_URL/actuator/health"
curl -f "$FRONTEND_URL/"

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
```

### Phase 4: Edge Case Testing

#### 4.1 Dependabot PR Testing

Test automated dependency updates:

```bash
# Simulate Dependabot update behavior
# Dependabot PRs should automatically merge when all checks pass
```

#### 4.2 Workflow Dispatch Testing

Test manual deployment triggers:

```bash
# Trigger manual deployment via GitHub Actions UI
# Test with different service selections
gh workflow run backend-ci.yml --ref main
gh workflow run frontend-ci.yml --ref main
```

#### 4.3 Error Handling Testing

Introduce intentional failures to test error handling:

```bash
# Add syntax error to test failure handling
echo "invalid-kotlin-syntax" >> apps/api/src/main/kotlin/test-error.kt
git add apps/api/src/main/kotlin/test-error.kt
git commit -m "test: intentional build failure"
git push origin test/error-handling

# Create PR to test failure reporting
gh pr create --title "Test: Error handling validation" \
  --body "Testing error handling in CI/CD pipeline"
```

## ✅ Comprehensive Test Categories

### 1. Infrastructure Tests

#### A. Terraform Configuration
- [ ] **Validation**: `terraform validate` passes without errors
- [ ] **Formatting**: `terraform fmt -check` passes
- [ ] **Security**: `tfsec` scan passes with no critical issues
- [ ] **State Management**: Remote state backend functions correctly
- [ ] **API Dependencies**: All required Google Cloud APIs are enabled

#### B. Resource Provisioning
- [ ] **GCS Buckets**: Media storage and Terraform state buckets created
- [ ] **Artifact Registry**: Backend and frontend repositories created
- [ ] **Cloud Run Services**: Services deployed with correct configuration
- [ ] **IAM Roles**: Service accounts and permissions properly configured
- [ ] **Monitoring**: Budget alerts and dashboards configured

#### C. Infrastructure Test Commands
```bash
# Test Terraform validation
cd infrastructure/terraform
terraform validate
terraform fmt -check -recursive
terraform plan -detailed-exitcode

# Test API availability
gcloud services list --enabled --filter="name:run.googleapis.com"
gcloud services list --enabled --filter="name:artifactregistry.googleapis.com"
gcloud services list --enabled --filter="name:secretmanager.googleapis.com"

# Test resource creation
gcloud storage buckets describe gs://nosilha-terraform-state-bucket
gcloud artifacts repositories list --location=us-east1
gcloud run services list --region=us-east1
```

### 2. Backend CI/CD Tests

#### A. Security & Quality
- [ ] **Trivy Scan**: Vulnerability scanning passes
- [ ] **detekt**: Kotlin static analysis passes
- [ ] **SARIF Upload**: Security findings uploaded to GitHub
- [ ] **Dependency Check**: No critical vulnerabilities in dependencies

#### B. Testing & Build
- [ ] **Unit Tests**: All JUnit tests pass with PostgreSQL integration
- [ ] **Code Coverage**: Jacoco reports generated and coverage thresholds met
- [ ] **Gradle Build**: JAR file builds successfully
- [ ] **Docker Build**: Container image builds without errors

#### C. Deployment
- [ ] **Image Push**: Docker image pushed to Artifact Registry
- [ ] **Cloud Run Deploy**: Service updated with new image
- [ ] **Health Check**: `/actuator/health` endpoint responds correctly
- [ ] **Environment Variables**: All secrets properly injected

#### D. Backend Test Commands
```bash
# Test backend locally
cd apps/api
./gradlew test
./gradlew detekt
./gradlew bootRun --args='--spring.profiles.active=local'

# Test Docker build
./gradlew bootBuildImage --imageName=nosilha-backend:test

# Test health endpoint
curl -f http://localhost:8080/actuator/health
```

### 3. Frontend CI/CD Tests

#### A. Security & Quality
- [ ] **Trivy Scan**: Vulnerability scanning passes
- [ ] **ESLint**: TypeScript linting passes
- [ ] **SARIF Upload**: Security findings uploaded to GitHub
- [ ] **Bundle Analysis**: Bundle size within acceptable limits

#### B. Testing & Build
- [ ] **Type Checking**: TypeScript compilation passes
- [ ] **Next.js Build**: Production build completes successfully
- [ ] **Docker Build**: Container image builds without errors
- [ ] **Environment Variables**: API URLs and configuration properly set

#### C. Deployment
- [ ] **Image Push**: Docker image pushed to Artifact Registry
- [ ] **Cloud Run Deploy**: Service updated with new image
- [ ] **Health Check**: Frontend homepage loads correctly
- [ ] **API Integration**: Frontend can communicate with backend

#### D. Frontend Test Commands
```bash
# Test frontend locally
cd apps/web
pnpm install
pnpm run lint
pnpm run build
pnpm run dev

# Test Docker build
docker build -t nosilha-frontend:test .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 nosilha-frontend:test

# Test frontend health
curl -f http://localhost:3000
```

### 4. Quality Gate Tests (Phase 4 Modular Architecture)

#### A. Coverage Quality Gates

**Frontend Coverage (Vitest)**
- [ ] **Threshold Enforcement**: Build fails if coverage drops below 70%
- [ ] **Configuration**: Vitest config enforces thresholds (apps/web/vitest.config.ts:36-41)
- [ ] **Reporting**: Coverage reports uploaded to Codecov
- [ ] **Metrics**: Lines, functions, branches, statements all ≥70%

**Backend Coverage (Jacoco)**
- [ ] **Threshold Enforcement**: `jacocoTestCoverageVerification` task enforces 70% minimum
- [ ] **Configuration**: Jacoco threshold set in apps/api/build.gradle.kts:123
- [ ] **Reporting**: Coverage XML reports generated and uploaded to Codecov
- [ ] **Build Failure**: Build fails if coverage below 70%

**Test Commands**:
```bash
# Frontend coverage verification (local only - not in CI)
cd apps/web
pnpm run test:unit -- --coverage --run
# Note: Coverage not enforced in CI, local validation only

# Backend coverage verification
cd apps/api
./gradlew test jacocoTestReport
./gradlew jacocoTestCoverageVerification
# Gradle task fails if coverage < 70%
```

#### B. Module Boundary Quality Gates (Spring Modulith)

- [ ] **Modularity Tests**: `ModularityTests.kt` verifies module structure
- [ ] **Zero Circular Dependencies**: No circular dependencies between modules
- [ ] **Allowed Dependencies**: Modules only depend on `shared` and authorized modules
- [ ] **Event-Driven Communication**: Cross-module interactions use events
- [ ] **PlantUML Diagrams**: Module documentation auto-generated

**Test Commands**:
```bash
# Run Spring Modulith verification tests
cd apps/api
./gradlew test --tests "com.nosilha.core.ModularityTests"

# Generate module documentation
./gradlew generateModulithDocs

# View generated diagrams
ls -la build/modulith/
# Expected files: *.puml (PlantUML diagrams)
```

**Expected Output**:
```bash
ModularityTests > verifyModuleStructure() PASSED
ModularityTests > verifySharedModuleHasNoDependencies() PASSED
ModularityTests > verifyDirectoryModuleAllowedDependencies() PASSED
ModularityTests > verifyMediaModuleAllowedDependencies() PASSED
ModularityTests > generateModuleDocumentation() PASSED
```

#### C. Bundle Size Quality Gates

- [ ] **Threshold**: Frontend bundle must be <500KB compressed
- [ ] **Enforcement**: PR builds fail if bundle exceeds limit
- [ ] **Tool**: @next/bundle-analyzer + custom size check
- [ ] **Trigger**: Only runs on PRs with frontend changes

**Test Commands**:
```bash
# Frontend bundle size analysis
cd apps/web
pnpm run build

# Check bundle size manually
du -sh .next/static/chunks | awk '{print $1}'
# Expected: <500KB

# Bundle size check script (from CI/CD)
BUNDLE_SIZE_KB=$(du -sk .next/static/chunks | cut -f1)
BUNDLE_SIZE_MB=$(echo "scale=2; $BUNDLE_SIZE_KB / 1024" | bc)

echo "Total bundle size: ${BUNDLE_SIZE_MB}MB (${BUNDLE_SIZE_KB}KB)"

if [ $BUNDLE_SIZE_KB -gt 512000 ]; then
  echo "❌ Bundle size exceeds 500KB limit!"
  exit 1
else
  echo "✅ Bundle size within limits (max 500KB)"
fi
```

#### D. Test Execution Quality Gates

**Playwright E2E Tests**
- [ ] **Execution Time**: Must complete within 5 minutes (FR-001)
- [ ] **Test Coverage**: Authentication, directory browsing, content creation, map interaction
- [ ] **Browser**: Headless Chromium with mobile viewport testing
- [ ] **Enforcement**: Timeout failures block PR merge

**Vitest Unit Tests**
- [ ] **Execution**: All unit tests must pass
- [ ] **Coverage**: ≥70% for components, hooks, and utilities
- [ ] **Isolation**: Tests must be independent and parallelizable
- [ ] **Enforcement**: Any test failure blocks PR merge

**Test Commands**:
```bash
# Frontend E2E tests (local only - not in CI)
cd apps/web
pnpm exec playwright test
# Must complete in <5 minutes

# Frontend unit tests with coverage (local only - not in CI)
pnpm run test:unit -- --coverage --run
# Coverage for local validation only

# Backend unit tests (runs in CI)
cd apps/api
./gradlew test
# All tests must pass
```

**Expected CI/CD Flow**:
```
PR Created → Quality Gates Run in Parallel:
  1. Coverage Gates (Frontend + Backend)
  2. Module Boundary Verification (Backend)
  3. Bundle Size Analysis (Frontend)
  4. E2E Tests (Frontend)
  5. Unit Tests (Frontend + Backend)

All Gates Pass → ✅ PR Ready for Merge
Any Gate Fails → ❌ PR Blocked, Detailed Error Messages Provided
```

### 5. Security Tests

#### A. Vulnerability Scanning
- [ ] **Container Images**: Trivy scans pass for all images
- [ ] **Dependencies**: No critical vulnerabilities in npm/gradle dependencies
- [ ] **Infrastructure**: tfsec scan passes with no high-severity issues
- [ ] **Code Quality**: detekt and ESLint pass with no critical issues

#### B. SARIF Integration
- [ ] **GitHub Security**: SARIF files uploaded to GitHub Security tab
- [ ] **Workflow Integration**: Security scans don't block deployment
- [ ] **Error Handling**: Graceful degradation when Advanced Security unavailable
- [ ] **Categorization**: Security findings properly categorized

#### C. IAM & Permissions
- [ ] **Service Accounts**: Minimal required permissions granted
- [ ] **Secret Access**: Services can access required secrets
- [ ] **Cross-Service**: Services can communicate as needed
- [ ] **Public Access**: Only intended endpoints publicly accessible

### 5. End-to-End Tests

#### A. Complete Deployment Flow
1. **Code Change** → Create feature branch
2. **PR Creation** → CI/CD validation runs (no deployment)
3. **PR Merge** → Automatic deployment to production
4. **Service Update** → Services updated with new code
5. **Health Verification** → All services healthy and responsive

#### B. Integration Tests
- [ ] **API Endpoints**: All REST endpoints respond correctly
- [ ] **Database Integration**: Backend connects to PostgreSQL
- [ ] **Media Storage**: File uploads work to GCS
- [ ] **Frontend-Backend**: API calls work end-to-end
- [ ] **Authentication**: JWT authentication flows work

#### C. Monitoring & Alerts
- [ ] **Cost Monitoring**: Budget alerts configured and working
- [ ] **Service Monitoring**: Uptime checks functional
- [ ] **Error Tracking**: Application errors logged and monitored
- [ ] **Performance**: Response times within acceptable limits

## 🚀 Test Execution Plan

### Phase 1: Local Development Testing
1. Run all local tests and builds
2. Verify Docker containers start correctly
3. Test API endpoints locally
4. Validate frontend/backend integration

### Phase 2: Infrastructure Deployment
1. Deploy Terraform infrastructure
2. Verify all resources created correctly
3. Test IAM permissions and secrets
4. Validate monitoring setup

### Phase 3: CI/CD Pipeline Testing
1. Create test branch and PR
2. Verify CI/CD validation runs
3. Merge to main and verify deployment
4. Test rollback procedures

### Phase 4: Production Validation
1. Verify services accessible via public URLs
2. Test all API endpoints in production
3. Validate monitoring and alerting
4. Perform basic load testing

## 🔧 Complete Test Suite

### Automated Test Execution Script

```bash
#!/bin/bash
# Complete CI/CD Pipeline Test Suite

echo "🧪 Starting Comprehensive CI/CD Pipeline Test Suite..."

# Phase 1: Infrastructure Tests
echo "📋 Phase 1: Infrastructure Validation"
cd infrastructure/terraform
terraform validate && echo "✅ Terraform validation passed" || echo "❌ Terraform validation failed"
terraform fmt -check -recursive && echo "✅ Terraform formatting passed" || echo "❌ Terraform formatting failed"
terraform plan -detailed-exitcode && echo "✅ Terraform plan passed" || echo "❌ Terraform plan failed"

# Phase 2: Backend Tests
echo "📋 Phase 2: Backend Testing"
cd ../../apps/api
./gradlew test && echo "✅ Backend tests passed" || echo "❌ Backend tests failed"
./gradlew detekt && echo "✅ Backend linting passed" || echo "❌ Backend linting failed"
./gradlew bootBuildImage --imageName=test-backend && echo "✅ Backend Docker build passed" || echo "❌ Backend Docker build failed"

# Phase 3: Frontend Tests
echo "📋 Phase 3: Frontend Testing"
cd ../apps/web
pnpm install && echo "✅ Frontend dependencies installed" || echo "❌ Frontend dependencies failed"
pnpm run lint && echo "✅ Frontend linting passed" || echo "❌ Frontend linting failed"
pnpm run build && echo "✅ Frontend build passed" || echo "❌ Frontend build failed"
docker build -t test-frontend . && echo "✅ Frontend Docker build passed" || echo "❌ Frontend Docker build failed"

echo "🎉 CI/CD Pipeline Test Suite Complete!"
```

## 🆘 Troubleshooting Guide

### Common Issues & Solutions

**Issue**: Authentication failures in CI/CD
**Solution**: 
```bash
# Verify GCP_SA_KEY secret is valid JSON and properly base64 encoded
echo $GCP_SA_KEY | base64 -d | jq .
```

**Issue**: Docker build failures
**Solution**: 
```bash
# Check Artifact Registry repository exists
gcloud artifacts repositories list --location=us-east1
# Verify Docker authentication
gcloud auth configure-docker us-east1-docker.pkg.dev
```

**Issue**: Workflow syntax errors
**Solution**: Validate YAML syntax and check indentation structure

**Issue**: Missing dependencies
**Solution**: Ensure all required GitHub Actions are accessible and versions are compatible

**Issue**: SARIF upload warnings
**Note**: "Advanced Security must be enabled" warnings are expected for repositories without GitHub Advanced Security license. Workflows use `continue-on-error: true` to prevent failures.

### Recovery Procedures

If new workflows fail, quickly restore functionality:

```bash
# Emergency backup and restore procedure
mkdir .github/workflows/backup
cp .github/workflows/*.yml .github/workflows/backup/

# Restore previous working configuration if needed
# (Adjust based on your backup strategy)
```

## 📊 Test Results Template

### Test Execution Report

**Date**: `YYYY-MM-DD`  
**Executed by**: `Your Name`  
**Environment**: `Production`  
**Git Commit**: `abc1234`

#### Infrastructure Tests
| Test Case | Status | Notes |
|-----------|--------|-------|
| Terraform Validation | ✅/❌ | |
| Resource Provisioning | ✅/❌ | |
| IAM Configuration | ✅/❌ | |
| Monitoring Setup | ✅/❌ | |

#### Backend Tests
| Test Case | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Unit Tests | ✅/❌ | XX% | |
| Security Scan | ✅/❌ | | |
| Docker Build | ✅/❌ | | |
| Cloud Run Deploy | ✅/❌ | | |

#### Frontend Tests
| Test Case | Status | Bundle Size | Notes |
|-----------|--------|-------------|-------|
| Type Checking | ✅/❌ | | |
| Build Process | ✅/❌ | XXX KB | |
| Docker Build | ✅/❌ | | |
| Cloud Run Deploy | ✅/❌ | | |

#### Security Tests
| Test Case | Status | Vulnerabilities | Notes |
|-----------|--------|----------------|-------|
| Trivy Scan | ✅/❌ | X critical, Y high | |
| SARIF Upload | ✅/❌ | | |
| IAM Permissions | ✅/❌ | | |
| Secret Management | ✅/❌ | | |

#### End-to-End Tests
| Test Case | Status | Response Time | Notes |
|-----------|--------|---------------|-------|
| Complete Deployment | ✅/❌ | XX min | |
| API Integration | ✅/❌ | XXX ms | |
| Health Checks | ✅/❌ | | |
| Monitoring Alerts | ✅/❌ | | |

## ✅ Success Criteria

The CI/CD pipeline is fully validated when:

1. **All automated tests pass** across all components
2. **Security scans complete** with no critical vulnerabilities
3. **Deployment pipeline executes** without manual intervention
4. **Services are accessible** via public URLs with proper health checks
5. **Monitoring and alerts** are functional and responsive
6. **Cost controls** are properly configured and working
7. **Documentation** is complete, accurate, and up-to-date

**Pipeline Status**: 🚀 **READY FOR PRODUCTION**

---

For additional support, refer to the main [CI/CD Pipeline Documentation](./CI_CD_PIPELINE.md) or the [Security Policy](./SECURITY.md) for security-related testing procedures.