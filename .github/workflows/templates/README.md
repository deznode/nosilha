# Workflow Templates

This directory contains reusable GitHub Actions workflow templates that can be used across different services and projects.

## Available Templates

> **Note**: For security scanning, use the main reusable workflow at `/.github/workflows/reusable-security-scan.yml` instead of individual templates.

### docker-build.yml
Reusable workflow for building and pushing Docker images to Google Artifact Registry.

**Usage:**
```yaml
jobs:
  build:
    uses: ./.github/workflows/templates/docker-build.yml
    with:
      context-path: './frontend'
      dockerfile-path: './frontend/Dockerfile'
      image-name: 'nosilha-frontend'
      project-id: ${{ secrets.GCP_PROJECT_ID }}
      # OIDC authentication parameters (optional, defaults provided)
      workload-identity-provider: 'projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider'
      service-account: 'nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com'
```

## Best Practices

1. **Parameterization**: Make templates flexible with input parameters
2. **OIDC Authentication**: Use Workload Identity Federation instead of service account keys for enhanced security
3. **Output Values**: Provide useful outputs for downstream jobs
4. **Error Handling**: Include proper error handling and cleanup
5. **Documentation**: Document all inputs, outputs, and usage examples

## Creating New Templates

When creating new templates:

1. Use descriptive names and clear documentation
2. Follow the existing patterns for inputs/outputs
3. Include error handling and cleanup steps
4. Test templates thoroughly before using in production
5. Version templates if breaking changes are needed