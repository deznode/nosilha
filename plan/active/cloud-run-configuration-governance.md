# Cloud Run Configuration Governance Plan

## Overview

This document outlines the process improvements needed to prevent Cloud Run configuration drift between Terraform Infrastructure as Code and GitHub Actions CI/CD deployments.

## Current State ✅ COMPLETED

**Problem Resolved**: CI/CD workflows were overriding Terraform's cost-optimized resource configurations:
- Frontend: 512Mi → 256Mi memory, 5 → 2 max instances
- Backend: 1Gi → 256Mi memory, 5 → 3 max instances

**Solution Implemented**: Aligned CI/CD configurations with Terraform cost-optimized settings.

## Phase 2: Process Improvements (Next 1-2 Weeks)

### Priority: Medium | Effort: 4-6 hours

#### 2.1 Configuration Validation ⏳ PENDING
**Objective**: Prevent resource limit drift in CI/CD pipelines

**Implementation**:
- Add validation script to check CI/CD resource limits against Terraform
- Include in GitHub Actions PR validation workflow
- Fail deployment if configuration doesn't match Terraform

**Files to Create**:
- `scripts/validate-cloudrun-config.sh`
- Update `.github/workflows/pr-validation.yml`

#### 2.2 Drift Detection Monitoring ⏳ PENDING
**Objective**: Alert on Terraform vs deployed configuration differences

**Implementation**:
- Create weekly scheduled workflow to check actual vs expected configuration
- Use `gcloud run services describe` to get deployed configuration
- Compare with Terraform state and alert on differences
- Create GitHub issue automatically if drift is detected

**Files to Create**:
- `.github/workflows/infrastructure-drift-detection.yml`
- `scripts/check-cloudrun-drift.sh`

#### 2.3 Change Governance ⏳ PENDING
**Objective**: Establish approval process for infrastructure resource changes

**Implementation**:
- Create GitHub issue template for infrastructure changes
- Require infrastructure team review for resource limit modifications
- Add CODEOWNERS file for infrastructure directory
- Document change approval process

**Files to Create**:
- `.github/ISSUE_TEMPLATE/infrastructure-change.md`
- `CODEOWNERS` (add infrastructure team)
- `docs/INFRASTRUCTURE_CHANGE_PROCESS.md`

#### 2.4 Documentation Enhancement ⏳ PENDING
**Objective**: Update deployment runbooks with configuration standards

**Implementation**:
- Update CI/CD documentation with resource limit rationale
- Create troubleshooting guide for configuration issues
- Document cost optimization strategy and free tier compliance
- Add configuration standard reference

**Files to Update**:
- `docs/CI_CD_PIPELINE.md`
- `CLAUDE.md` (infrastructure section)
- Create `docs/CLOUD_RUN_RESOURCE_STANDARDS.md`

## Phase 3: Architecture Enhancement (Future Sprint)

### Priority: Low | Effort: 8-12 hours

#### 3.1 GitOps Implementation ⏳ FUTURE
**Objective**: Remove resource configuration from CI/CD entirely

**Current Approach**:
```bash
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE \
  --memory=256Mi \          # Remove this
  --max-instances=3 \       # Remove this
  --timeout=300             # Remove this
```

**Target Approach**:
```bash
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE
  # Resource limits managed entirely by Terraform
```

#### 3.2 Terraform-Only Resource Management ⏳ FUTURE
**Objective**: Let Terraform manage ALL service configuration

**Implementation**:
- Remove all resource configuration flags from CI/CD
- Use Terraform to deploy complete service configuration
- CI/CD only updates container image
- Implement proper Terraform apply workflow

#### 3.3 CI/CD Image-Only Deployment ⏳ FUTURE
**Objective**: Restrict workflows to image updates only

**Benefits**:
- Single source of truth for resource configuration
- Eliminates possibility of configuration drift
- Better separation of concerns (Infrastructure vs Application deployment)

#### 3.4 Automated Drift Remediation ⏳ FUTURE
**Objective**: Auto-correct configuration drift when detected

**Implementation**:
- Automated terraform apply when drift is detected
- Slack/email notifications for drift corrections
- Audit trail for all automatic changes

## Success Metrics

### Phase 2 Success Criteria:
- [ ] Zero configuration drift incidents in 30 days
- [ ] All infrastructure changes require approval
- [ ] Automated weekly drift detection operational
- [ ] Complete configuration documentation

### Phase 3 Success Criteria:
- [ ] CI/CD contains zero resource configuration
- [ ] Terraform manages 100% of Cloud Run configuration
- [ ] Automated drift remediation operational
- [ ] Configuration changes only via Infrastructure PR workflow

## Risk Mitigation

### Configuration Change Risks:
- **Memory/CPU limits too low**: May cause application crashes
- **Instance limits too low**: May cause performance issues during traffic spikes
- **Timeout too low**: May cause request timeouts

### Mitigation Strategies:
- Gradual rollout of configuration changes
- Monitor application performance after changes
- Maintain rollback procedures for emergency restoration
- Set up alerting for application errors and performance degradation

## Implementation Timeline

### Week 1:
- Configuration validation script
- Update PR validation workflow
- Create drift detection workflow

### Week 2:
- Implement change governance process
- Update documentation
- Test automated drift detection

### Future Sprint:
- Design GitOps architecture
- Implement Terraform-only resource management
- Build automated drift remediation

---

**Document Status**: ✅ Active Implementation Plan
**Next Review**: Weekly during Phase 2 implementation
**Owner**: DevOps Team
**Stakeholders**: Development Team, Infrastructure Team