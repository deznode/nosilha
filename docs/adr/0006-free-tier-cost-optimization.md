# Free Tier Cost Optimization Strategy

- **Status**: Accepted
- **Date**: 2026-01-29
- **Decision-makers**: Jocee Costa

## Context and Problem Statement

Nos Ilha is a volunteer-supported community project with minimal budget. How should we architect our GCP infrastructure to minimize costs while maintaining acceptable performance for our expected user base (~10,000 monthly active users)?

## Decision Drivers

- **Sustainability**: Keep infrastructure costs at $0-5/month for long-term viability
- **Predictability**: Avoid surprise billing from usage spikes
- **Scalability**: Support growth without major architectural changes
- **Performance**: Maintain acceptable response times for users

## Considered Options

1. Always-on instances with reserved capacity
2. Auto-scaling with `cpu_idle = false` (CPU always allocated)
3. Auto-scaling with `cpu_idle = true` (CPU only during requests)

## Decision Outcome

**Chosen option**: "Auto-scaling with `cpu_idle = true`", because it maximizes free tier utilization while allowing scale-to-zero, keeping costs at $0 for typical community project traffic.

### Consequences

**Positive**:
- Stays within free tier for expected traffic (~500K requests/month)
- Services scale to zero when idle (zero CPU charges)
- Predictable costs with budget alerting
- Scales gracefully within free tier limits

**Negative**:
- Slightly slower cold starts (~200-500ms additional latency)
- Not suitable for background processing or long-running tasks
- Requires monitoring to avoid surprise bills if traffic spikes
- May need scaling strategy if usage exceeds 10K MAU

## Pros and Cons of the Options

### Always-on Instances

Reserved minimum instances that never scale to zero.

- Good, because eliminates cold start latency
- Good, because predictable performance
- Bad, because ~$20-40/month minimum cost
- Bad, because wasteful for low-traffic periods

### Auto-scaling with cpu_idle = false

Instances scale down but CPU remains allocated while container is running.

- Good, because faster response during warm periods
- Good, because supports background tasks
- Bad, because CPU charges accumulate during idle time
- Bad, because can exceed free tier with low traffic

### Auto-scaling with cpu_idle = true

CPU only allocated during active request handling.

- Good, because scale-to-zero = $0 when idle
- Good, because maximizes free tier allowance
- Good, because aligns with community project budget
- Bad, because cold start latency (~200-500ms)
- Bad, because no background processing capability

## Implementation Details

### Free Tier Limits and Configuration

| Service | Free Tier | Our Configuration | Expected Usage |
|---------|-----------|-------------------|----------------|
| **Cloud Run** | 2M requests/month, 360K vCPU-seconds, 180K GiB-seconds | `min_instances = 0`, `cpu_idle = true` | ~500K requests, ~5K CPU-seconds |
| **Cloud Storage** | 5 GB storage, 5K Class A ops | 1 bucket, public read | ~2 GB media |
| **Artifact Registry** | 0.5 GB storage | 2 repositories | ~300 MB |
| **Secret Manager** | 10K access ops | 5 secrets, pinned versions | ~2K accesses/month |
| **Firestore** | 1 GB storage, 50K reads/day | Default database | ~100 MB, ~5K reads/day |
| **Monitoring** | 50 uptime checks | 2 checks only | Well under limit |

### Cost Impact Example

- **Without cpu_idle**: 24/7 idle backend = ~2.6M CPU-seconds/month = $20-40/month
- **With cpu_idle**: Same backend with 10K requests = ~5K CPU-seconds = **$0/month**

### Configuration Reference

- Backend Cloud Run: `cloudrun.tf:54-63` (1 vCPU, 1Gi memory, cpu_idle = true)
- Frontend Cloud Run: `cloudrun.tf:185-257` (1 vCPU, 256Mi memory, cpu_idle = true)
- Budget alert: `monitoring.tf:7-63` ($5 threshold)
- Audit logging: `monitoring.tf:143-147` (DATA_READ disabled to prevent quota exhaustion)

### Key Optimizations

1. **Pinned secret versions** (not "latest")—predictable Secret Manager costs
2. **DATA_READ audit logging disabled**—prevents quota exhaustion
3. **Max instances limited**—backend max 3, frontend max 2 (prevents runaway scaling)
4. **Budget alert at $5**—early warning before free tier breach
5. **No monitoring dashboard**—uses free alerting instead of paid dashboards

## More Information

- [Cloud Run Free Tier Details](https://cloud.google.com/run/pricing#tables)
- [Cloud Run CPU Allocation](https://cloud.google.com/run/docs/configuring/cpu-allocation)
