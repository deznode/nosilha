# GitHub Actions Cost Monitoring - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### 1. Run Setup Workflow
```bash
# Trigger the one-time setup
gh workflow run setup-budget-alerts.yml -f budget_limit=1500
```

### 2. Complete Manual Budget Setup
1. Visit [GitHub Billing Settings](https://github.com/settings/billing)
2. Navigate to "Usage & quotas" > "GitHub Actions"
3. Set up spending alerts at:
   - **75% (1,125 minutes)**: Warning
   - **90% (1,350 minutes)**: Critical

### 3. Test Monitoring
```bash
# Run cost monitoring manually to test
gh workflow run cost-monitoring.yml
```

## 📊 What You Get

### Automated Monitoring
- **Monthly Reports**: Detailed usage analysis on 1st of each month
- **GitHub Issues**: Automatic alerts when usage hits 75%+ of free tier
- **Performance Analytics**: Weekly workflow efficiency reports
- **Emergency Procedures**: Step-by-step cost reduction measures

### Zero-Cost Solution
- ✅ Uses only GitHub's FREE features
- ✅ No third-party services required
- ✅ Works for private repositories
- ✅ Ready for public repository transition

## 📁 Key Files

| File | Purpose |
|------|---------|
| **Workflows** | |
| `.github/workflows/cost-monitoring.yml` | Monthly usage analysis |
| `.github/workflows/performance-analytics.yml` | Weekly performance reports |
| `.github/workflows/setup-budget-alerts.yml` | One-time setup |
| **Documentation** | |
| `docs/monitoring/README.md` | Complete system overview |
| `docs/monitoring/cost-management-runbook.md` | Emergency procedures |
| **Generated Reports** | |
| `docs/monitoring/latest-usage-report.md` | Current usage analysis |
| `docs/monitoring/latest-performance-report.md` | Performance metrics |

## ⚠️ Alert Levels

| Usage | Status | Action |
|-------|--------|--------|
| 0-50% | 🟢 Normal | Monitor monthly |
| 50-75% | 🟡 Warning | Review optimizations |
| 75-90% | 🔴 Critical | Immediate action required |
| 90%+ | 🚨 Emergency | Emergency procedures |

## 🛠️ Quick Actions

### Check Current Usage
```bash
# View latest report
cat docs/monitoring/latest-usage-report.md

# Manual monitoring run
gh workflow run cost-monitoring.yml
```

### Emergency Cost Reduction
```bash
# Disable non-essential workflows
gh workflow disable "integration-ci.yml"
gh workflow disable "performance-analytics.yml"

# Keep only: backend-ci, frontend-ci, pr-validation
```

### Re-enable After Emergency
```bash
# Gradually re-enable workflows
gh workflow enable "performance-analytics.yml"
gh workflow enable "integration-ci.yml"
```

## 📈 Understanding Reports

### Usage Report Key Metrics
- **Total Minutes**: Billable minutes used
- **Free Tier Usage**: Percentage of 2,000 monthly limit
- **Workflow Breakdown**: Minutes per workflow
- **Cost Analysis**: Overage costs (if any)

### Performance Report Key Metrics
- **Average Duration**: Workflow execution time
- **Queue Time**: Wait time before execution
- **Success Rate**: Percentage of successful runs
- **Performance Status**: ✅ Good, ⚠️ Slow, ❌ Issues

## 🎯 Optimization Quick Wins

### Immediate (< 1 hour)
- ✅ Add caching to workflows
- ✅ Enable path filters for docs changes
- ✅ Fix failing workflows (they waste minutes)
- ✅ Add concurrency controls

### Short-term (1-4 hours)
- ✅ Optimize Docker builds
- ✅ Consolidate small jobs
- ✅ Reduce test matrix size
- ✅ Improve build speeds

## 🆘 Need Help?

### Quick Reference
- **Current Usage**: Check `docs/monitoring/latest-usage-report.md`
- **Performance Issues**: Check `docs/monitoring/latest-performance-report.md`
- **Emergency Procedures**: See `docs/monitoring/cost-management-runbook.md`
- **Complete Guide**: Read `docs/monitoring/README.md`

### Common Issues

**Q: No usage reports generated?**
A: Check if `cost-monitoring.yml` workflow is enabled and has proper permissions.

**Q: High usage alert but can't find cause?**
A: Review the workflow breakdown in latest usage report for top consumers.

**Q: Budget alerts not working?**
A: Manual setup required in GitHub billing settings (see setup instructions).

**Q: Want to transition to public repository?**
A: All monitoring works the same, but you get unlimited free minutes!

## ✅ Success Checklist

After setup, verify:
- [ ] Setup workflow completed successfully
- [ ] Manual budget alerts configured in GitHub settings
- [ ] Cost monitoring workflow generates reports
- [ ] Performance analytics workflow runs weekly
- [ ] Team understands alert procedures
- [ ] Emergency procedures documented and accessible

---

**🎉 You're all set!** The monitoring system will now automatically track usage and alert you to optimization opportunities.

**Next**: Review the first monthly report and establish your optimization routine.