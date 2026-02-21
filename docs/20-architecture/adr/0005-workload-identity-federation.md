# Workload Identity Federation for CI/CD Authentication

- **Status**: Accepted
- **Date**: 2026-01-29
- **Decision-makers**: Jocee Costa

## Context and Problem Statement

Our CI/CD pipeline (GitHub Actions) needs to authenticate with Google Cloud Platform to deploy containers to Cloud Run and push images to Artifact Registry. How should we securely authenticate GitHub Actions workflows with GCP?

## Decision Drivers

- **Security**: Minimize credential exposure and attack surface
- **Maintenance**: Reduce operational overhead for credential management
- **Auditability**: Enable clear tracking of CI/CD actions
- **Zero Trust**: Follow modern security principles with short-lived credentials

## Considered Options

1. Service Account Keys (JSON key files)
2. Workload Identity Federation (OIDC tokens)

## Decision Outcome

**Chosen option**: "Workload Identity Federation (OIDC tokens)", because it eliminates long-lived credentials, provides automatic rotation, and follows zero-trust principles.

### Consequences

**Positive**:
- No credential management overhead—OIDC tokens expire in 10 minutes and rotate automatically
- Reduced attack surface—no JSON key files to secure or accidentally commit
- Clear audit trail—all actions tied to specific GitHub workflow runs
- Zero trust—each deployment authenticates fresh with short-lived tokens

**Negative**:
- More complex initial setup (requires Workload Identity Pool configuration)
- GitHub Actions dependency (must use GitHub; other CI/CD systems require reconfiguration)

## Pros and Cons of the Options

### Service Account Keys

Traditional approach using downloaded JSON key files stored as secrets.

- Good, because simple to set up initially
- Good, because works with any CI/CD platform
- Bad, because keys are long-lived (must be manually rotated)
- Bad, because keys can be accidentally committed to version control
- Bad, because compromised keys grant access until manually revoked

### Workload Identity Federation

OIDC-based authentication where GitHub Actions exchanges a short-lived token for GCP access.

- Good, because tokens automatically expire (10-minute lifetime)
- Good, because no secrets to store or rotate
- Good, because audit logs show exact workflow run
- Good, because aligns with Google Cloud security best practices
- Bad, because more complex initial configuration
- Bad, because tightly couples CI/CD to GitHub Actions

## Implementation Details

### Authentication Flow

```
GitHub Actions → OIDC Token → Workload Identity Pool → Service Account Impersonation → GCP Resources
```

### Configuration Reference

- Workload Identity Pool: `iam.tf:219-267`
- GitHub Actions usage:
  ```yaml
  - uses: google-github-actions/auth@v2
    with:
      workload_identity_provider: 'projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider'
      service_account: 'nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com'
  ```

### Service Account Permissions

The CI/CD service account (`nosilha-cicd-deployer`) follows least privilege:

| Permission | Purpose |
|------------|---------|
| `artifactregistry.writer` | Push container images |
| `run.developer` | Deploy Cloud Run services |
| `iam.serviceAccountUser` | Impersonate runtime service accounts |

**Note**: `roles/editor` must be granted manually for domain mapping capabilities (GCP limitation).

## More Information

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC with GCP](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform)
