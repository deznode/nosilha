# Infrastructure

Infrastructure configuration and deployment for the Nos Ilha cultural heritage platform.

## Directory Structure

### [`docker/`](docker/)
Local development environment using Docker Compose.

**Services:**
- PostgreSQL 16 (primary database for all data including media metadata)

**Quick Start:**
```bash
cd docker && docker-compose up -d
```

See [docker/README.md](docker/README.md) for detailed setup instructions.

### [`terraform/`](terraform/)
Google Cloud Platform infrastructure as code.

**Resources:**
- Cloud Run services (backend API, frontend)
- Artifact Registry (container images)
- Cloud Storage (media storage - production)
- IAM service accounts and permissions
- Secret Manager configuration
- Monitoring and alerting

**Quick Start:**
```bash
cd terraform && terraform init && terraform plan
```

See [terraform/README.md](terraform/README.md) for comprehensive infrastructure documentation including deployment workflows, security best practices, and troubleshooting.

## Quick Reference

### Local Development Setup
```bash
# Start all infrastructure services
cd docker && docker-compose up -d

# Stop services (keeps data)
cd docker && docker-compose down

# Reset everything (⚠️ removes data)
cd docker && docker-compose down -v
```

### Infrastructure Deployment
```bash
# Initialize Terraform
cd terraform && terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure changes
terraform apply
```

### Service Endpoints

**Local Development:**
- PostgreSQL: `localhost:5432` (database: `nosilha_db`, user/pass: `nosilha`)
- Media Storage: Local filesystem (`./uploads` directory)

**Production:**
- Backend API: `https://api.nosilha.com`
- Frontend: `https://nosilha.com`

## Documentation

- [Docker Setup Guide](docker/README.md) - Detailed local development environment setup
- [Terraform Infrastructure Guide](terraform/README.md) - Comprehensive GCP infrastructure documentation
- [CI/CD Pipeline](../docs/ci-cd-pipeline.md) - Deployment workflows and troubleshooting
- [Architecture](../docs/architecture.md) - System architecture and component overview
- [GCP Troubleshooting](../docs/gcloud-cloud-run-troubleshooting.md) - Cloud Run operational guide
