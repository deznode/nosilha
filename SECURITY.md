# Security Policy

## Supported Versions

This project maintains security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Nos Ilha, please report it responsibly:

### How to Report

1. **DO NOT** open a public issue for security vulnerabilities
2. **Use** [GitHub's private vulnerability reporting](../../security/advisories/new) to report security issues
3. **Include** as much detail as possible about the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **24 hours**: Acknowledgment of your report
- **72 hours**: Initial assessment and severity classification
- **7 days**: Regular updates on investigation progress
- **30 days**: Target resolution timeframe

## Security Features

### Automated Security Scanning (Available Without Advanced Security)

- **Trivy Scanning**: Container and dependency vulnerability scanning
- **Static Code Analysis**: detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **Basic Dependency Review**: Automated dependency vulnerability checking
- **Build Security**: Secure build processes and container image scanning

### GitHub Advanced Security Features (Requires License for Private Repos)

- **CodeQL Analysis**: Automated semantic code analysis for TypeScript and Kotlin
- **Secret Scanning**: Detection of accidentally committed secrets and credentials
- **Advanced Dependency Features**: Enhanced vulnerability analysis with more detailed reporting
- **Security Advisories**: Proactive security notifications and automated remediation

**Note:** Advanced Security is free for public repositories but requires a paid license for private repositories. This repository implements comprehensive security scanning through Trivy and static analysis tools, with CodeQL analysis available when Advanced Security is enabled.

### Development Security

- **Branch Protection**: Required reviews and status checks
- **Signed Commits**: Encouraged for all contributors
- **Security Headers**: Implemented in production deployment
- **JWT Authentication**: Secure API access control

### Infrastructure Security

- **Least Privilege**: Minimal IAM permissions for Cloud Run services and CI/CD
- **Encrypted Secrets**: All sensitive data stored in Google Secret Manager
- **Network Security**: HTTPS-only communication with automatic SSL/TLS certificates
- **Container Security**: Minimal attack surface with optimized base images
- **Cloud Run Security**: Services run in Google's secure container runtime environment

## Security Best Practices

### For Contributors

1. Keep dependencies up to date
2. Use secure coding practices
3. Never commit secrets or credentials
4. Test security features thoroughly
5. Follow the principle of least privilege

### For Deployment

1. Use verified and scanned container images from Google Artifact Registry
2. Enable all security features in production Cloud Run environment
3. Regularly update base images and dependencies through automated workflows
4. Monitor security alerts through GitHub Security tab and act promptly
5. Implement comprehensive logging through Google Cloud Logging
6. Use Google Secret Manager for all sensitive configuration
7. Ensure minimal resource allocation and auto-scaling for cost and security optimization

## Contact

For security-related questions or concerns:

- **Security Issues**: Use [GitHub's private vulnerability reporting](../../security/advisories/new)
- **General Questions**: Create an issue in the repository with the `security` label
- **CI/CD Security**: Refer to the [CI/CD Pipeline Documentation](docs/ci-cd-pipeline.md) for deployment security details