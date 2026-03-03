---
name: deploying-infrastructure
description: CI/CD pipeline management, GCP deployment, and infrastructure automation with cost optimization. Use when managing/troubleshooting GitHub Actions, deploying/releasing to Cloud Run, optimizing/reducing cloud costs, or user mentions 'deployment', 'CI/CD', 'pipeline', 'infrastructure', 'Cloud Run', or needs deployment automation.
---

# DevOps & Infrastructure Specialist

This skill should be used when working with CI/CD pipelines, Google Cloud Platform deployment, infrastructure automation, container builds, security scanning, or cost optimization for the Nos Ilha cultural heritage platform.

## When to Use This Skill

- User needs CI/CD pipeline troubleshooting or configuration
- GitHub Actions workflow failures need diagnosis and fixes
- GCP deployment required to Cloud Run services
- Infrastructure as code changes needed with Terraform
- Security scanning integration or vulnerability remediation
- Cost optimization strategies for volunteer-supported platform
- Container build issues (Spring Boot bootBuildImage, Next.js Docker)
- Health checks and deployment validation needed

## Core Capabilities

This skill specializes in:

- **CI/CD Pipeline Management**: Modular GitHub Actions workflows with path-based triggering
- **GCP Infrastructure Operations**: Cloud Run, Artifact Registry, Secret Manager optimized for free tier
- **Infrastructure as Code**: Terraform configurations with state management and drift detection
- **Security & Compliance**: Comprehensive scanning (Trivy, detekt, ESLint, tfsec) with SARIF reporting
- **Cost Optimization**: Sustainable infrastructure <$50/month using Always Free tier and scale-to-zero
- **Deployment Automation**: Zero-downtime deployments with health checks and automated rollback

## Mandatory Architecture Standards

### OIDC Workload Identity Authentication

To authenticate GitHub Actions to GCP securely:

1. **Use Workload Identity Provider**: `projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`
2. **Service Account**: `nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com`
3. **No Service Account Keys**: OIDC token exchange eliminates need for stored secrets
4. **GitHub Actions Integration**: Automatic authentication via OIDC token in workflows

### Modular CI/CD Architecture

To maintain service-specific pipelines:

1. **Path-Based Triggering**: Workflows run only when relevant files change
   - Backend workflow: `backend/**` changes
   - Frontend workflow: `frontend/**` changes
   - Infrastructure workflow: `infrastructure/**` changes
2. **Service-Specific Workflows**: Separate pipelines for backend, frontend, infrastructure
3. **Parallel Execution**: Independent workflows run concurrently for faster deployments

### Cloud Run Deployment Standards

To ensure consistent Cloud Run configuration:

**Backend Service (Spring Boot)**:
- Built with `./gradlew bootBuildImage` (Paketo buildpacks, Java 21)
- 1 CPU, 1Gi memory, scale 0-10 instances
- PostgreSQL connection via Secret Manager
- Health endpoint: `/actuator/health`

**Frontend Service (Next.js)**:
- Built with multi-stage Dockerfile (Node.js Alpine base)
- 1 CPU, 512Mi memory, scale 0-5 instances
- Standalone output for optimized container size
- Build-time environment variable injection

### Cost-First Design

To maintain volunteer budget sustainability:

1. **Always Free Tier Services**: Cloud Run with scale-to-zero, limited Artifact Registry, Secret Manager
2. **Scale-to-Zero Configuration**: `minInstances: 0` for automatic cost reduction during low traffic
3. **Resource Right-Sizing**: Minimal CPU/memory allocation sufficient for workload
4. **Budget Target**: <$50/month total infrastructure cost
5. **Open Source Tools**: Free security scanning instead of commercial alternatives

Reference `docs/CI_CD_PIPELINE.md` for comprehensive CI/CD architecture documentation.

## CI/CD Workflow Management

### Troubleshooting Workflow Failures

Follow this process to diagnose CI/CD issues:

1. **Analyze Workflow Logs**: Check GitHub Actions run logs for specific error messages
2. **Identify Failure Point**: Determine which job and step failed
3. **Validate Dependencies**: Ensure required services (PostgreSQL, Firestore, APIs) available
4. **Review Security Scans**: Check Trivy, detekt, ESLint, tfsec results for blocking vulnerabilities
5. **Test Locally**: Reproduce issue in development environment before fixing

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common CI/CD issues and solutions.

### Updating Workflow Configurations

Follow this process for workflow changes:

1. **Review Existing Patterns**: Check `.github/workflows/` files for consistency
2. **Reference Documentation**: Consult `docs/CI_CD_PIPELINE.md` for architecture patterns
3. **Test Changes**: Validate workflow syntax and logic in non-production branch
4. **Update Modular Architecture**: Maintain service-specific workflow separation
5. **Verify Path Triggering**: Ensure path-based triggers work correctly

## Infrastructure Management

### Terraform State Management

To manage infrastructure as code:

1. **Monitor State Drift**: Run `terraform plan -detailed-exitcode` to detect changes
2. **Remote State Backend**: Use Google Cloud Storage for Terraform state storage
3. **State Locking**: Prevent concurrent modifications with state locking
4. **Drift Detection**: Identify manual changes outside Terraform
5. **Reconciliation**: Apply Terraform configurations to restore desired state

### Cloud Run Service Health

To monitor and validate deployments:

1. **Service Status**: Use `gcloud run services describe` for service details
2. **Analyze Logs**: Check Cloud Run logs with `gcloud logging read` for errors
3. **Health Checks**: Verify liveness and readiness probes responding correctly
4. **Performance Metrics**: Monitor request latency and error rates
5. **Auto-Scaling**: Validate instance scaling behavior under load

See [GCP_OPTIMIZATION.md](GCP_OPTIMIZATION.md) for free tier cost optimization strategies.

### IAM Permission Validation

To ensure secure access:

1. **Service Account Permissions**: Verify required roles assigned correctly
2. **Workload Identity Binding**: Validate GitHub Actions → GCP OIDC configuration
3. **Least Privilege Principle**: Grant minimum permissions needed for operations
4. **Audit IAM Changes**: Review IAM policy modifications regularly

## Security Scanning Integration

### Comprehensive Security Coverage

To maintain 100% vulnerability scanning:

**Container & Dependency Scanning** (Trivy):
- Scan Docker images for OS and application vulnerabilities
- Check dependency manifests (package.json, build.gradle.kts)
- SARIF reporting for GitHub Security tab integration

**Kotlin Code Analysis** (detekt):
- Static analysis for Kotlin code quality and security
- Custom rule sets for best practices
- SARIF output for centralized vulnerability tracking

**TypeScript Security Scanning** (ESLint):
- Security-focused linting rules
- Detect potential XSS, injection, and other web vulnerabilities
- SARIF reporting integration

**Terraform Security Validation** (tfsec):
- Infrastructure as code security scanning
- GCP-specific security checks
- Compliance validation for cloud resources

### Security Scan Workflow

Follow this process:

1. **Configure Scanners**: Enable all security tools in GitHub Actions workflows
2. **Review Findings**: Analyze security scan results for critical/high vulnerabilities
3. **Remediate Issues**: Fix vulnerabilities before deployment
4. **Upload SARIF**: Submit results to GitHub Security tab (if Advanced Security enabled)
5. **Monitor Trends**: Track vulnerability trends over time

## Cost Optimization Strategies

### Always Free Tier Optimization

To minimize infrastructure costs:

**Cloud Run**:
- Scale-to-zero configuration (minInstances: 0)
- CPU allocation only during request processing
- Automatic instance shutdown when idle
- Within Always Free tier limits (2 million requests/month)

**Artifact Registry**:
- Limited image storage within free tier
- Delete old/unused images regularly
- Use image tagging strategy to track active images

**Secret Manager**:
- Minimal secret count and versions
- Within free tier limits (6 active secret versions)

See [GCP_OPTIMIZATION.md](GCP_OPTIMIZATION.md) for detailed optimization techniques.

### Resource Right-Sizing

To optimize service performance vs cost:

1. **Backend Resources**: 1 CPU, 1Gi memory sufficient for Spring Boot application
2. **Frontend Resources**: 1 CPU, 512Mi memory sufficient for Next.js
3. **Concurrency Limits**: Backend 1000 requests/instance, Frontend 500 requests/instance
4. **Timeout Configuration**: 300 seconds request timeout
5. **Monitor Utilization**: Adjust resources based on actual usage patterns

### Budget Monitoring

To prevent cost overruns:

1. **Manual GCP Console Review**: Weekly billing reports check
2. **Cost Breakdown Analysis**: Identify highest-cost services
3. **Usage Trend Tracking**: Monitor month-over-month cost changes
4. **Optimization Opportunities**: Identify services exceeding free tier
5. **Volunteer Budget Adherence**: Maintain <$50/month target

## Deployment Automation

### Zero-Downtime Deployment Process

To ensure reliable deployments:

1. **Blue-Green Deployment**: Cloud Run manages traffic shifting automatically
2. **Health Check Validation**: Verify new revision healthy before traffic shift
3. **Gradual Traffic Migration**: Cloud Run gradually shifts traffic to new revision
4. **Automated Rollback**: Revert to previous revision if health checks fail
5. **Post-Deployment Validation**: Run health check script to confirm deployment success

See [scripts/health-check.sh](scripts/health-check.sh) for deployment validation script.

### Deployment Speed Optimization

To minimize deployment lead time (<10 minutes):

1. **Parallel Workflows**: Service-specific workflows run concurrently
2. **Path-Based Triggering**: Only affected services deploy
3. **Docker Layer Caching**: Buildx caching for faster frontend builds
4. **Artifact Registry Caching**: Reuse cached container layers
5. **Optimized Build Steps**: Minimize unnecessary build operations

## Documentation References

**Always consult before infrastructure changes**:

- `docs/CI_CD_PIPELINE.md` - Comprehensive CI/CD architecture and troubleshooting
- `.github/workflows/backend-ci.yml` - Spring Boot/Kotlin backend pipeline
- `.github/workflows/frontend-ci.yml` - Next.js/React frontend pipeline
- `.github/workflows/infrastructure-ci.yml` - Terraform infrastructure pipeline
- `infrastructure/terraform/main.tf` - Core GCP infrastructure definitions

**Supporting Documentation**:

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common CI/CD issues and solutions
- [GCP_OPTIMIZATION.md](GCP_OPTIMIZATION.md) - Free tier cost optimization strategies
- [scripts/health-check.sh](scripts/health-check.sh) - Deployment validation script

## Technical Context

### GCP Deployment Architecture

All services deployed to Google Cloud Platform using serverless Cloud Run:

- **Region**: us-east1 for cost efficiency and global access
- **Authentication**: OIDC workload identity for GitHub Actions integration
- **Container Registry**: Google Artifact Registry (us-east1-docker.pkg.dev)
- **Secrets Management**: Google Secret Manager for environment variables

### Containerization Patterns

**Backend (Spring Boot)**:
- Paketo buildpacks generate OCI-compliant images
- No Dockerfile required (`./gradlew bootBuildImage`)
- Java 21 runtime with automatic health checking

**Frontend (Next.js)**:
- Multi-stage Dockerfile (deps → builder → runner)
- Next.js standalone output for minimal container size
- Node.js Alpine base image for security and size

## Best Practices

**Remember these principles**:

1. **Reference Documentation First**: Always consult `docs/CI_CD_PIPELINE.md` before changes
2. **Follow Existing Patterns**: Review workflow files for consistency
3. **Cost-First Design**: Prioritize free tier and <$50/month budget
4. **Security Scanning**: Run all security tools before deployment
5. **Zero-Downtime Deployments**: Use Cloud Run blue-green deployment
6. **OIDC Authentication**: Never store service account keys
7. **Modular Workflows**: Maintain service-specific pipeline separation
8. **Monitor Budgets**: Weekly GCP Console cost review

Every infrastructure change must maintain cost efficiency, security scanning coverage, and reliable deployment automation for the volunteer-supported cultural heritage platform.
