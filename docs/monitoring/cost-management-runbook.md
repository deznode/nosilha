# GitHub Actions Cost Management Runbook

## Overview

This runbook provides step-by-step procedures for managing GitHub Actions costs for the Nos Ilha project. It covers monitoring, alerting, optimization, and emergency procedures for cost control.

## Quick Reference

| Alert Level | Usage | Action Required |
|-------------|-------|-----------------|
| 🟢 Normal | 0-50% | Monitor monthly |
| 🟡 Warning | 50-75% | Review optimization opportunities |
| 🔴 Critical | 75-90% | Immediate optimization required |
| 🚨 Emergency | 90%+ | Emergency cost reduction measures |

## Monitoring Overview

### Automated Systems

**Cost Monitoring Workflow** (`cost-monitoring.yml`)
- **Schedule**: Monthly on 1st at 9 AM UTC
- **Function**: Tracks usage, generates reports, creates alerts
- **Outputs**: Usage reports, GitHub Issues for high usage

**Performance Analytics** (`performance-analytics.yml`)
- **Schedule**: Weekly on Monday at 10 AM UTC
- **Function**: Analyzes workflow performance and efficiency
- **Outputs**: Performance reports, optimization recommendations

**Budget Setup** (`setup-budget-alerts.yml`)
- **Purpose**: One-time setup for budget configuration
- **Function**: Creates configuration and setup instructions

### Manual Monitoring

**GitHub Billing Page**: [https://github.com/settings/billing](https://github.com/settings/billing)
- View current usage and costs
- Access detailed usage CSV reports
- Monitor storage and compute consumption

## Cost Management Procedures

### 1. Normal Operations (0-50% Usage)

**Monthly Review Process:**
1. Review automated usage reports in `docs/monitoring/`
2. Check workflow performance metrics
3. Look for optimization opportunities
4. Update team on usage trends

**Actions:**
- ✅ Continue current practices
- 📊 Monitor trends for unusual spikes
- 🔄 Implement minor optimizations as identified

### 2. Warning Level (50-75% Usage)

**Immediate Actions (Within 24 hours):**
1. **Review Usage Report**: Check `docs/monitoring/latest-usage-report.md`
2. **Identify High-Usage Workflows**: Focus on workflows consuming >20% of total minutes
3. **Check Recent Changes**: Review recent PRs that might have increased build times
4. **Quick Wins Implementation**: Apply immediate optimizations

**Quick Optimization Checklist:**
- [ ] Enable caching for dependencies (npm, Gradle, Docker)
- [ ] Add path filters to skip documentation-only changes
- [ ] Review failed workflows (they still consume minutes)
- [ ] Optimize Docker builds with multi-stage builds
- [ ] Add concurrency controls to cancel outdated runs

**Documentation:**
- Create warning-level incident report
- Document optimization actions taken
- Set up increased monitoring

### 3. Critical Level (75-90% Usage)

**Emergency Response (Within 4 hours):**

1. **Stop Non-Essential Workflows**:
   ```bash
   # Disable non-critical workflows temporarily
   gh workflow disable "workflow-name"
   ```

2. **Implement Aggressive Optimization**:
   - Reduce matrix build combinations
   - Skip non-essential testing for urgent fixes
   - Optimize Docker builds aggressively
   - Cache everything possible

3. **Manual Review Process**:
   ```bash
   # Run cost monitoring manually
   gh workflow run cost-monitoring.yml

   # Check recent high-usage runs
   gh run list --limit 20
   ```

**Critical Optimization Actions:**
- [ ] **Immediate**: Disable non-essential workflows
- [ ] **Workflow Matrix**: Reduce test matrix to essential combinations only
- [ ] **Build Optimization**: Implement aggressive caching and build optimizations
- [ ] **Path Filtering**: Add strict path filters to all workflows
- [ ] **Manual Testing**: Switch to manual approval for non-urgent deployments

### 4. Emergency Level (90%+ Usage)

**Immediate Emergency Response (Within 1 hour):**

1. **Halt All Non-Essential Workflows**:
   ```bash
   # Emergency disable script
   gh workflow disable "integration-ci.yml"
   gh workflow disable "performance-analytics.yml"
   # Keep only critical workflows: backend-ci, frontend-ci
   ```

2. **Emergency Cost Reduction**:
   - Switch to manual deployment approvals
   - Disable matrix builds completely
   - Skip all non-essential testing
   - Implement emergency path filtering

3. **Emergency Communication**:
   - Notify all team members immediately
   - Document emergency measures taken
   - Schedule emergency optimization review

**Emergency Procedures:**

```bash
# Emergency workflow disable script
echo "🚨 EMERGENCY: Disabling non-essential workflows"

# Disable all non-critical workflows
gh workflow disable "integration-ci.yml"
gh workflow disable "performance-analytics.yml"
gh workflow disable "cost-monitoring.yml"

# Keep essential workflows only
echo "✅ Keeping essential workflows: backend-ci, frontend-ci, pr-validation"

# Add emergency path filters (edit workflows to be very restrictive)
echo "⚠️ Add emergency path filters to remaining workflows"
```

## Optimization Strategies

### Immediate Optimizations (0-2 hours)

1. **Caching Implementation**:
   ```yaml
   - name: Cache dependencies
     uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Path Filtering**:
   ```yaml
   on:
     push:
       paths-ignore:
         - '**/*.md'
         - '**/*.txt'
         - 'docs/**'
   ```

3. **Concurrency Controls**:
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

### Medium-term Optimizations (2-8 hours)

1. **Docker Build Optimization**:
   - Multi-stage builds
   - .dockerignore files
   - Docker layer caching

2. **Workflow Consolidation**:
   - Combine small jobs
   - Reduce matrix builds
   - Smart conditional execution

3. **Dependency Optimization**:
   - Remove unnecessary dependencies
   - Use lighter base images
   - Optimize install processes

### Long-term Strategies (1-3 days)

1. **Public Repository Migration**:
   - Unlimited free minutes for public repositories
   - Enhanced community features
   - Better discoverability

2. **Self-hosted Runners** (if remaining private):
   - Cost analysis for self-hosted vs. GitHub-hosted
   - Infrastructure setup and maintenance
   - Security considerations

## Alert Response Procedures

### GitHub Issue Alerts

**When Cost Monitoring Creates Issues:**

1. **Immediate Response** (within 2 hours):
   - Review the issue details and usage breakdown
   - Check the linked usage report
   - Identify top consuming workflows

2. **Analysis** (within 4 hours):
   - Compare current usage to historical trends
   - Identify recent changes causing usage spikes
   - Determine optimization priority

3. **Action Plan** (within 8 hours):
   - Implement quick wins from optimization checklist
   - Create detailed optimization plan
   - Set up enhanced monitoring

### Email Alerts (Manual Setup)

**GitHub Billing Alerts** (manual setup required):

1. **50% Alert**: Review and plan optimizations
2. **75% Alert**: Implement immediate optimizations
3. **90% Alert**: Emergency response procedures
4. **100% Alert**: Full cost control measures

## Cost Recovery Procedures

### After Emergency Response

1. **Gradual Re-enabling**:
   - Re-enable workflows one by one
   - Monitor usage impact of each workflow
   - Implement optimizations before re-enabling

2. **Usage Analysis**:
   - Conduct thorough usage analysis
   - Identify root causes of usage spike
   - Implement preventive measures

3. **Process Improvement**:
   - Review and update monitoring thresholds
   - Enhance automated optimization
   - Update team procedures

## Preventive Measures

### Daily Practices

- ✅ Review workflow failures immediately (failed runs waste minutes)
- ✅ Optimize workflows when making changes
- ✅ Use path filters for new workflows
- ✅ Monitor PR sizes and complexity

### Weekly Reviews

- 📊 Check performance analytics reports
- 🔍 Review usage trends
- 🛠️ Implement incremental optimizations
- 📋 Update optimization roadmap

### Monthly Assessments

- 📈 Analyze monthly usage reports
- 🎯 Review and adjust budget thresholds
- 🔄 Update optimization strategies
- 📚 Update documentation and procedures

## Tool References

### GitHub CLI Commands

```bash
# Check workflow usage
gh api repos/{owner}/{repo}/actions/runs --paginate

# Check current billing
gh api /user/settings/billing/actions

# Workflow management
gh workflow list
gh workflow disable {workflow}
gh workflow enable {workflow}

# Manual workflow triggers
gh workflow run cost-monitoring.yml
gh workflow run performance-analytics.yml
```

### Monitoring Scripts

```bash
# Quick usage check
gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions/runs --paginate --jq '.workflow_runs[] | select(.created_at >= "'$(date -d '7 days ago' -Iseconds)'") | .name' | sort | uniq -c | sort -nr

# Recent failures check
gh run list --status failure --limit 10
```

## Emergency Contacts

**Project Contacts:**
- DevOps Lead: [Contact Information]
- Project Owner: [Contact Information]
- Technical Lead: [Contact Information]

**Escalation Path:**
1. Technical Lead (immediate optimization)
2. Project Owner (budget approval/strategy changes)
3. DevOps Lead (infrastructure changes)

## Documentation Updates

**This runbook should be updated:**
- After any emergency response
- When new optimization strategies are discovered
- When GitHub Actions features change
- Monthly during regular reviews

**Version History:**
- v1.0: Initial implementation with Phase 3.1
- Future versions: Track improvements and lessons learned

---

**Last Updated**: $(date)
**Document Owner**: DevOps Team
**Review Frequency**: Monthly
**Emergency Contact**: See Emergency Contacts section