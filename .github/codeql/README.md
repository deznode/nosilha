# CodeQL Configuration

This directory contains configuration for GitHub's CodeQL security analysis.

## Requirements

**⚠️ GitHub Advanced Security Required**

CodeQL analysis requires GitHub Advanced Security to be enabled:

- **Public repositories**: Advanced Security is available for free
- **Private repositories**: Requires a paid Advanced Security license

## Current Status

If the CodeQL workflow fails with 403 errors, it means Advanced Security is not enabled for this repository.

## Enabling Advanced Security

To enable Advanced Security:

1. Go to repository **Settings**
2. Navigate to **Security and analysis**
3. Enable **GitHub Advanced Security** (if available)

For organization-owned repositories, this may require organization owner permissions.

## Alternative Security Scanning

Even without Advanced Security, this repository maintains comprehensive security scanning through:

- **Trivy**: Container and dependency vulnerability scanning
- **Static Analysis**: detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **Dependency Review**: Basic vulnerability checking for dependencies

These tools provide significant security coverage and are enabled in the CI/CD pipeline.