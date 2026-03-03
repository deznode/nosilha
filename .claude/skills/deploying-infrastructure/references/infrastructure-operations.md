# Infrastructure Operations

Reference guide for Terraform, Cloud Run monitoring, IAM, and containerization.

## Terraform State Management

1. **Monitor State Drift**: Run `terraform plan -detailed-exitcode` to detect changes
2. **Remote State Backend**: Use Google Cloud Storage for Terraform state storage
3. **State Locking**: Prevent concurrent modifications with state locking
4. **Drift Detection**: Identify manual changes outside Terraform
5. **Reconciliation**: Apply Terraform configurations to restore desired state

## Cloud Run Service Health

1. **Service Status**: Use `gcloud run services describe` for service details
2. **Analyze Logs**: Check Cloud Run logs with `gcloud logging read` for errors
3. **Health Checks**: Verify liveness and readiness probes responding correctly
4. **Performance Metrics**: Monitor request latency and error rates
5. **Auto-Scaling**: Validate instance scaling behavior under load

## IAM Permission Validation

1. **Service Account Permissions**: Verify required roles assigned correctly
2. **Workload Identity Binding**: Validate GitHub Actions → GCP OIDC configuration
3. **Least Privilege Principle**: Grant minimum permissions needed for operations
4. **Audit IAM Changes**: Review IAM policy modifications regularly

## Containerization Patterns

### Backend (Spring Boot)
- Paketo buildpacks generate OCI-compliant images
- No Dockerfile required (`./gradlew bootBuildImage`)
- Java 21 runtime with automatic health checking
- Health endpoint: `/actuator/health`

### Frontend (Next.js)
- Multi-stage Dockerfile (deps → builder → runner)
- Next.js standalone output for minimal container size
- Node.js Alpine base image for security and size
- Build-time environment variable injection

## Deployment Speed Optimization

To minimize deployment lead time (<10 minutes):

1. **Parallel Workflows**: Service-specific workflows run concurrently
2. **Path-Based Triggering**: Only affected services deploy
3. **Docker Layer Caching**: Buildx caching for faster frontend builds
4. **Artifact Registry Caching**: Reuse cached container layers
5. **Optimized Build Steps**: Minimize unnecessary build operations

## Zero-Downtime Deployment

1. **Blue-Green Deployment**: Cloud Run manages traffic shifting automatically
2. **Health Check Validation**: Verify new revision healthy before traffic shift
3. **Gradual Traffic Migration**: Cloud Run gradually shifts traffic to new revision
4. **Automated Rollback**: Revert to previous revision if health checks fail
5. **Post-Deployment Validation**: Run health check script to confirm deployment success
