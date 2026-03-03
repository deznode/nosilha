# GCP Cost Optimization

Reference guide for maintaining volunteer budget sustainability (<$50/month).

## Always Free Tier Optimization

### Cloud Run
- Scale-to-zero configuration (minInstances: 0)
- CPU allocation only during request processing
- Automatic instance shutdown when idle
- Within Always Free tier limits (2 million requests/month)

### Artifact Registry
- Limited image storage within free tier
- Delete old/unused images regularly
- Use image tagging strategy to track active images

### Secret Manager
- Minimal secret count and versions
- Within free tier limits (6 active secret versions)

## Resource Right-Sizing

| Service | CPU | Memory | Concurrency | Timeout |
|---------|-----|--------|-------------|---------|
| Backend (Spring Boot) | 1 | 1Gi | 1000 req/instance | 300s |
| Frontend (Next.js) | 1 | 512Mi | 500 req/instance | 300s |

## Budget Monitoring

1. **Manual GCP Console Review**: Weekly billing reports check
2. **Cost Breakdown Analysis**: Identify highest-cost services
3. **Usage Trend Tracking**: Monitor month-over-month cost changes
4. **Optimization Opportunities**: Identify services exceeding free tier
5. **Volunteer Budget Adherence**: Maintain <$50/month target
