# Security Policy

## Supported Versions

This project maintains security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Nos Ilha, please report it responsibly:

### How to Report

1. **DO NOT** open a public issue for security vulnerabilities
2. **Email** security issues to the repository maintainers
3. **Use** GitHub's private vulnerability reporting feature if available
4. **Include** as much detail as possible about the vulnerability

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

This repository implements several security measures:

### Automated Security Scanning

- **CodeQL Analysis**: Automated code security analysis
- **Trivy Scanning**: Container and dependency vulnerability scanning
- **Dependency Review**: Automated dependency vulnerability checking
- **Secret Scanning**: Detection of accidentally committed secrets

### Development Security

- **Branch Protection**: Required reviews and status checks
- **Signed Commits**: Encouraged for all contributors
- **Security Headers**: Implemented in production deployment
- **JWT Authentication**: Secure API access control

### Infrastructure Security

- **Least Privilege**: Minimal IAM permissions for services
- **Encrypted Secrets**: All sensitive data encrypted at rest
- **Network Security**: HTTPS-only communication
- **Container Security**: Minimal attack surface with distroless images

## Security Best Practices

### For Contributors

1. Keep dependencies up to date
2. Use secure coding practices
3. Never commit secrets or credentials
4. Test security features thoroughly
5. Follow the principle of least privilege

### For Deployment

1. Use official container images
2. Enable all security features in production
3. Regularly update base images
4. Monitor security alerts and act promptly
5. Implement proper logging and monitoring

## Contact

For security-related questions or concerns, please contact the repository maintainers through appropriate channels.