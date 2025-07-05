# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions of Nos Ilha:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Nos Ilha team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**For security vulnerabilities, please do NOT use GitHub issues.** Instead, please report security vulnerabilities through one of the following channels:

#### 1. GitHub Security Advisories (Preferred)
- Go to the [Security tab](https://github.com/bravdigital/nosilha/security) of this repository
- Click "Report a vulnerability"
- Fill out the vulnerability report form

#### 2. Email
- Send an email to: security@bravdigital.org
- Include "SECURITY VULNERABILITY" in the subject line
- Use PGP encryption if possible (key available on request)

### What to Include

When reporting a security vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Impact**: What an attacker could achieve by exploiting this vulnerability
- **Reproduction Steps**: Detailed steps to reproduce the vulnerability
- **Proof of Concept**: Code, screenshots, or other evidence (if available)
- **Suggested Fix**: Any ideas for how to fix the vulnerability (optional)
- **Environment**: 
  - Operating system and version
  - Browser version (for frontend vulnerabilities)
  - Java/Node.js version (for backend vulnerabilities)
  - Any other relevant environment details

### Response Timeline

We commit to the following response timeline:

- **Initial Response**: Within 48 hours of receiving the report
- **Vulnerability Assessment**: Within 7 days of initial response
- **Fix Development**: Timeline depends on severity (see below)
- **Public Disclosure**: Coordinated with reporter, typically 90 days after fix

### Severity Classification

We use the following severity levels based on CVSS 3.1:

#### Critical (CVSS 9.0-10.0)
- **Response Time**: Fix within 24-48 hours
- **Examples**: Remote code execution, authentication bypass
- **Disclosure**: Immediate after fix deployment

#### High (CVSS 7.0-8.9)
- **Response Time**: Fix within 7 days
- **Examples**: SQL injection, privilege escalation
- **Disclosure**: 30 days after fix deployment

#### Medium (CVSS 4.0-6.9)
- **Response Time**: Fix within 30 days
- **Examples**: XSS, information disclosure
- **Disclosure**: 60 days after fix deployment

#### Low (CVSS 0.1-3.9)
- **Response Time**: Fix within 90 days
- **Examples**: Minor information leaks, DoS
- **Disclosure**: 90 days after fix deployment

## Security Best Practices

### For Contributors

1. **Code Review**: All code must be reviewed by at least one other team member
2. **Dependency Updates**: Keep dependencies up to date using Dependabot
3. **Static Analysis**: Run security linters and scanners before submitting PRs
4. **Secrets Management**: Never commit secrets, API keys, or passwords
5. **Input Validation**: Always validate and sanitize user input
6. **Authentication**: Use secure authentication mechanisms (JWT with proper validation)
7. **HTTPS**: Always use HTTPS in production environments

### For Deployments

1. **Container Security**: Use minimal base images and scan for vulnerabilities
2. **Network Security**: Implement proper firewall rules and network segmentation
3. **Secrets**: Use Google Secret Manager for sensitive configuration
4. **Monitoring**: Enable security monitoring and alerting
5. **Updates**: Apply security updates promptly
6. **Backup**: Maintain secure, tested backups

## Security Features

### Current Security Measures

- **Authentication**: JWT-based authentication with Supabase
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Properly configured Cross-Origin Resource Sharing
- **HTTPS**: TLS encryption for all external communication
- **Security Headers**: Implemented security headers (CSP, HSTS, etc.)
- **Dependency Scanning**: Automated vulnerability scanning with Trivy
- **Code Analysis**: Static code analysis with CodeQL
- **Container Scanning**: Docker image vulnerability scanning

### Security Monitoring

- **CI/CD Security**: All builds include security scans
- **Dependency Monitoring**: Automated updates and vulnerability alerts
- **Log Monitoring**: Security event logging and monitoring
- **Health Checks**: Automated health and security validation

## Vulnerability Disclosure Process

1. **Report Received**: Security team acknowledges receipt
2. **Initial Triage**: Assess severity and impact
3. **Investigation**: Reproduce and analyze the vulnerability
4. **Fix Development**: Develop and test the security fix
5. **Testing**: Comprehensive testing of the fix
6. **Deployment**: Deploy fix to production
7. **Disclosure**: Coordinate public disclosure with reporter
8. **Post-Mortem**: Document lessons learned and improve processes

## Security Contact

- **Primary Contact**: security@bravdigital.org
- **PGP Key**: Available on request
- **Response Hours**: Monday-Friday, 9 AM - 5 PM UTC
- **Emergency Contact**: For critical vulnerabilities requiring immediate attention

## Recognition

We believe in recognizing security researchers who help improve our security:

- **Hall of Fame**: Security researchers will be listed in our security hall of fame
- **CVE Credits**: Proper attribution in CVE disclosures
- **Swag**: Nos Ilha branded merchandise for valid reports
- **Donation**: Consider donating to security research organizations

## Legal

- **Safe Harbor**: We will not pursue legal action against security researchers who follow this policy
- **Scope**: This policy applies to services hosted under the `*.bravdigital.org` domain and the Nos Ilha application
- **Exclusions**: Social engineering, physical attacks, and DoS attacks are outside the scope

## Updates to This Policy

This security policy may be updated from time to time. We will notify the security community of any significant changes.

Last updated: [Current Date]

---

Thank you for helping keep Nos Ilha and our community safe!