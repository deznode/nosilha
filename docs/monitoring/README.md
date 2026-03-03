# GitHub Actions Cost Monitoring

This directory contains automated cost monitoring reports for the Nos Ilha GitHub Actions workflows.

## Overview

The GitHub Actions Cost Monitoring system provides:

- **Monthly Usage Reports**: Detailed breakdown of workflow usage, costs, and performance
- **Budget Alerts**: Automated notifications when approaching free tier limits
- **Performance Tracking**: Monitoring of workflow efficiency and success rates
- **Optimization Recommendations**: Data-driven suggestions for cost reduction

## Reports

### Latest Report
- [`latest-usage-report.md`](./latest-usage-report.md) - Most recent usage analysis

### Historical Reports
Historical monthly reports are stored with the naming pattern: `usage-report-YYYY-MM.md`

## Free Tier Limits (Private Repository)

| Plan | Storage | Minutes/Month |
|------|---------|---------------|
| GitHub Free | 500 MB | 2,000 |

**Current Project Status**: Private repository using GitHub Free plan

## Budget Thresholds

| Threshold | Action |
|-----------|--------|
| 50% (1,000 minutes) | ℹ️ Info notification |
| 75% (1,500 minutes) | ⚠️ Warning alert + GitHub Issue |
| 90% (1,800 minutes) | 🚨 Critical alert + Immediate review required |
| 100% (2,000+ minutes) | 💸 Overage charges begin ($0.008/minute) |

## Monitoring Workflow

The cost monitoring runs automatically:
- **Monthly**: 1st of each month at 9 AM UTC
- **Manual**: Can be triggered via `workflow_dispatch` for ad-hoc analysis

### Workflow Features

1. **Usage Analysis**: Tracks minutes used per workflow and overall project
2. **Cost Calculation**: Estimates overage costs if exceeding free tier
3. **Performance Metrics**: Success rates and average runtime per workflow
4. **Automated Alerts**: Creates GitHub Issues for high usage scenarios
5. **Historical Tracking**: Maintains monthly reports for trend analysis

## Understanding the Reports

### Usage Summary
- **Total Minutes Used**: Billable minutes consumed during the reporting period
- **Total Workflow Runs**: Number of workflow executions
- **Success Rate**: Percentage of successful vs. failed runs
- **Free Tier Usage**: Percentage of monthly allowance consumed

### Cost Analysis
- **Usage Percentage**: Current consumption vs. free tier limit
- **Remaining Minutes**: Available minutes before overage charges
- **Estimated Overage Cost**: Projected costs if exceeding free tier

### Workflow Breakdown
- **Per-Workflow Statistics**: Minutes, runs, and success rates by workflow
- **Efficiency Metrics**: Average minutes per run for each workflow
- **Optimization Opportunities**: Identification of high-consumption workflows

## Optimization Strategies

### Immediate Actions (High Usage)
1. **Review Failed Runs**: Failed workflows still consume minutes
2. **Optimize Build Times**: Use caching, parallel jobs, and efficient runners
3. **Smart Triggering**: Use path filters to avoid unnecessary runs
4. **Consolidate Jobs**: Combine small jobs to reduce startup overhead

### Long-term Strategies
1. **Public Repository**: Unlimited free minutes for public repositories
2. **Self-hosted Runners**: Reduce costs for high-volume workflows
3. **Workflow Optimization**: Implement advanced caching and parallelization
4. **Conditional Execution**: Skip unnecessary steps based on changes

## Current Optimizations (Phase 1 & 2.2 Completed)

✅ **Cost Optimizations Implemented:**
- OIDC authentication (faster setup)
- Consolidated security scanning (66% reduction in duplication)
- Smart path filtering (skip documentation changes)
- Enhanced caching strategies
- Budget-conscious matrix builds

✅ **Expected Impact:**
- 40-60% reduction in CI/CD minutes usage
- Enhanced security with proper SARIF integration
- Improved workflow reliability and maintainability

## Troubleshooting

### High Usage Alerts
1. **Check Failed Runs**: Review recent workflow failures
2. **Analyze Workflow Breakdown**: Identify high-consumption workflows
3. **Review Recent Changes**: Check if recent commits increased build times
4. **Implement Quick Fixes**: Add caching, optimize dependencies, use path filters

### Monitoring Issues
- **Missing Reports**: Check if the cost-monitoring workflow is enabled
- **Incorrect Usage**: Verify GitHub CLI permissions and API access
- **Alert Not Firing**: Review workflow triggers and scheduling

## Future Enhancements

When transitioning to public repository:
- Remove budget alerts (unlimited free minutes)
- Focus on performance optimization rather than cost
- Enhanced monitoring for contribution workflows
- Advanced analytics for community engagement

---

**Last Updated**: $(date)
**Monitoring Status**: Active
**Next Review**: Monthly on workflow execution