# CI/CD Testing & Validation Guide

This guide provides comprehensive testing steps for the new modular CI/CD architecture.

## Pre-Testing Checklist

### Required GitHub Secrets
Ensure these secrets are configured in your GitHub repository:

- `GCP_SA_KEY`: Google Cloud service account key (JSON format)
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `STAGING_API_URL`: Backend API URL for staging environment
- `PRODUCTION_API_URL`: Backend API URL for production environment

### GCP Service Account Permissions
Verify the service account has these roles:
- `roles/run.admin` - Cloud Run administration
- `roles/artifactregistry.admin` - Artifact Registry management
- `roles/storage.admin` - Cloud Storage management
- `roles/iam.serviceAccountUser` - Service account usage

## Testing Strategy

### Phase 1: Individual Workflow Testing

#### 1.1 Backend Workflow Testing
Create a feature branch and test backend changes:

```bash
# Create test branch
git checkout -b test/backend-ci-workflow

# Make a small change to trigger backend workflow
echo "# Test change" >> backend/README.md
git add backend/README.md
git commit -m "test: trigger backend CI workflow"
git push origin test/backend-ci-workflow
```

**Expected Results:**
- ✅ Security scan completes with Trivy results in Security tab
- ✅ Kotlin linting runs with detekt and uploads SARIF
- ✅ Tests run with PostgreSQL service and generate coverage
- ✅ Docker image builds and pushes to Artifact Registry (if main/develop)
- ✅ Deployment skipped for feature branch

#### 1.2 Frontend Workflow Testing
Test frontend-specific changes:

```bash
# Make a frontend change
echo "/* Test change */" >> frontend/src/app/globals.css
git add frontend/src/app/globals.css
git commit -m "test: trigger frontend CI workflow"
git push origin test/backend-ci-workflow
```

**Expected Results:**
- ✅ Security scan runs for frontend directory
- ✅ ESLint runs and uploads SARIF results
- ✅ TypeScript checking completes
- ✅ Bundle size analysis runs (for PRs)
- ✅ Docker image builds and pushes (if main/develop)

#### 1.3 Infrastructure Workflow Testing
Test infrastructure changes:

```bash
# Make an infrastructure change
echo "# Test comment" >> infrastructure/terraform/main.tf
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
Create a PR from your test branch to `develop`:

```bash
# Create PR using GitHub CLI or web interface
gh pr create --title "Test: Validate new CI/CD workflows" \
  --body "Testing the new modular CI/CD architecture" \
  --base develop
```

**Expected Results:**
- ✅ PR validation workflow triggers
- ✅ Service-specific workflows run based on changes
- ✅ Global security scan completes
- ✅ Dependency review runs
- ✅ CodeQL analysis completes
- ✅ Comprehensive PR status report is posted
- ✅ No deployment occurs (skip-deploy: true)

#### 2.2 Validate PR Comments
Check that the PR receives:
- Detailed validation results with pass/fail status
- Component change detection (backend/frontend/infrastructure)
- Next steps guidance based on results
- Terraform plan output (if infrastructure changed)

### Phase 3: Integration Testing

#### 3.1 Production Deployment Testing
After PR validation passes, merge to main for production deployment:

```bash
# Merge PR to main branch
gh pr merge --merge
```

**Expected Results:**
- ✅ Production deployment workflow triggers
- ✅ Images build and deploy to production Cloud Run services
- ✅ Health checks validate production deployment
- ✅ Integration tests run against production

### Phase 4: Edge Case Testing

#### 4.1 Dependabot PR Testing
Create a fake Dependabot PR to test auto-merge:

```bash
# Simulate Dependabot update (requires admin privileges)
# This tests the auto-merge functionality
```

#### 4.2 Workflow Dispatch Testing
Test manual deployment triggers:

```bash
# Trigger manual deployment via GitHub Actions UI
# Test with different environment selections
```

#### 4.3 Error Handling Testing
Introduce intentional failures to test error handling:

```bash
# Add syntax error to test failure handling
echo "invalid-syntax" >> backend/src/main/kotlin/test.kt
git add backend/src/main/kotlin/test.kt
git commit -m "test: intentional build failure"
git push origin test/error-handling
```

## Validation Checklist

### Security & Compliance
- [ ] Trivy scans run for all components
- [ ] SARIF results appear in GitHub Security tab
- [ ] detekt, ESLint, tfsec all execute successfully
- [ ] Dependency review catches high-severity vulnerabilities
- [ ] CodeQL analysis completes without blocking issues

### Testing & Quality
- [ ] Backend tests run with PostgreSQL integration
- [ ] Coverage reports upload to Codecov
- [ ] Frontend type checking and linting pass
- [ ] Bundle size analysis runs for PR changes
- [ ] Terraform validation and planning work correctly

### Deployment & Operations
- [ ] Images build and push to Artifact Registry
- [ ] Staging deployments work from develop branch
- [ ] Production deployments work from main branch
- [ ] Health checks validate service availability
- [ ] Rollback procedures work if deployment fails

### Workflow Coordination
- [ ] Path-based triggering works correctly
- [ ] PR validation consolidates all checks
- [ ] Integration tests coordinate across services
- [ ] Workflow templates are reusable
- [ ] Legacy workflows are safely backed up

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify GCP_SA_KEY secret is valid JSON
   - Check service account permissions
   - Ensure project ID is correct

2. **Docker Build Failures**
   - Verify Artifact Registry repository exists
   - Check Docker authentication with `gcloud auth configure-docker us-east1-docker.pkg.dev`
   - Review build context and Dockerfile paths

3. **Workflow Syntax Errors**
   - Validate YAML syntax
   - Check indentation and structure
   - Verify input/output mappings

4. **Missing Dependencies**
   - Ensure all required GitHub Actions are accessible
   - Check action versions for compatibility
   - Verify external service availability

### Recovery Procedures

If new workflows fail, you can quickly restore the legacy system:

```bash
# If needed, backup current workflows and restore previous versions
# Note: Adjust these commands based on your actual workflow structure
mkdir .github/workflows/backup
mv .github/workflows/backend-ci.yml .github/workflows/backup/
mv .github/workflows/frontend-ci.yml .github/workflows/backup/
mv .github/workflows/infrastructure-ci.yml .github/workflows/backup/
mv .github/workflows/pr-validation.yml .github/workflows/backup/
mv .github/workflows/integration-ci.yml .github/workflows/backup/
```

## Success Criteria

The new CI/CD architecture is ready for production when:

- ✅ All individual workflows pass for respective component changes
- ✅ PR validation provides comprehensive status reporting
- ✅ Security scanning and quality gates function correctly
- ✅ Production deployments work reliably from main branch
- ✅ Health checks and monitoring validate deployments
- ✅ Integration tests coordinate properly across services
- ✅ Performance matches or exceeds legacy workflow efficiency

## Next Steps

After successful validation:

1. **Monitor Production Usage**: Watch for any issues in production workflows
2. **Optimize Performance**: Fine-tune caching and parallel execution
3. **Extend Templates**: Create additional reusable workflow components
4. **Documentation**: Update team documentation and runbooks
5. **Training**: Educate team members on new workflow structure