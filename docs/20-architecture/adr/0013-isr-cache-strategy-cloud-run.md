# ISR Cache Strategy for Runtime-Only Secrets on Cloud Run

- **Status**: Accepted
- **Date**: 2026-03-08
- **Decision-makers**: Joaquim Costa

## Context and Problem Statement

After deploying the Instagram feed section (spec 028), the component was invisible on production despite the code being correct. The root cause was a chain of three issues in how Next.js ISR interacts with Cloud Run's scale-to-zero and Docker multi-stage builds:

1. `INSTAGRAM_ACCESS_TOKEN` is a runtime-only secret injected via Cloud Run env vars — it is not available during `docker build`
2. The Dockerfile did not copy `.next/cache` from the builder to the runner stage, so build-time ISR cache entries were lost
3. No post-deploy cache warm-up existed, so the homepage was cached without Instagram data on the first cold-start request
4. Cloud Run's scale-to-zero periodically wiped any runtime ISR improvements

A secondary issue was that Next.js Image optimization proxied Instagram CDN URLs through Cloudflare's `/cdn-cgi/image/` endpoint, which Instagram blocks with 403 errors.

## Decision Drivers

- **Security**: Secrets must never be passed as Docker build args (visible in `docker history` and image layers)
- **Cost**: Solo-maintained project on free/low-cost tier; `min-instances=1` adds ongoing cost
- **Reliability**: The homepage must consistently render all sections after every deployment
- **Graceful degradation**: Instagram feed should silently disappear if the API is unavailable, not break the page

## Considered Options

1. Pass `INSTAGRAM_ACCESS_TOKEN` as a Docker build arg
2. Post-deploy revalidation via CI pipeline
3. Set Cloud Run `min-instances=1` to prevent cache loss

## Decision Outcome

**Chosen option**: "Post-deploy revalidation via CI pipeline" (Option 2), combined with copying `.next/cache` in the Dockerfile, because it keeps secrets secure, costs nothing extra, and guarantees a warm cache after every deployment.

### Consequences

**Positive**:
- No secrets in Docker image layers or build history
- Homepage is guaranteed to have fresh Instagram data after every deploy
- Zero additional infrastructure cost
- Existing `/api/revalidate` endpoint is reused (no new code for the mechanism)
- Pattern is extensible to other runtime-dependent sections

**Negative**:
- Adds ~2 seconds to CI deploy pipeline (one extra `curl` call)
- If revalidation fails, homepage renders without Instagram section until next ISR cycle (graceful degradation)
- Revalidation endpoint path validation had to be fixed to accept root path `"/"`

## Pros and Cons of the Options

### Option 1: Pass secret as Docker build arg

```dockerfile
ARG INSTAGRAM_ACCESS_TOKEN
ENV INSTAGRAM_ACCESS_TOKEN=$INSTAGRAM_ACCESS_TOKEN
```

- Good, because the page pre-renders with Instagram data at build time
- Bad, because secrets are visible in `docker history` and image layers (OWASP, Docker official docs, Microsoft ISE all advise against this)
- Bad, because BuildKit `--mount=type=secret` adds complexity and is unnecessary since `"use cache"` runs at runtime, not during `next build`

### Option 2: Post-deploy revalidation (chosen)

```yaml
# CI step after health check
curl -sf -X POST "$SERVICE_URL/api/revalidate" \
  -H "X-Revalidate-Secret: ${{ secrets.REVALIDATE_SECRET }}" \
  -d '{"path": "/"}'
```

- Good, because secrets stay in Cloud Run env vars (Secret Manager), never in Docker images
- Good, because it uses the existing `/api/revalidate` endpoint
- Good, because it's a single CI step addition with zero infrastructure cost
- Bad, because it adds a dependency on the revalidation endpoint being functional post-deploy

### Option 3: Set `min-instances=1`

```bash
gcloud run deploy --min-instances=1
```

- Good, because the ISR cache persists across requests (no cold starts)
- Bad, because it adds ongoing cost (~$7-15/month for an always-running instance)
- Bad, because it doesn't solve the initial cache-miss problem after a fresh deploy

## More Information

### Fixes Applied

| Fix | File | Purpose |
|-----|------|---------|
| Copy `.next/cache` to runner | `apps/web/Dockerfile` | Preserve build-time ISR cache entries |
| Add "Warm ISR Cache" CI step | `.github/workflows/frontend-ci.yml` | Trigger revalidation after deploy |
| Fix path validation regex | `apps/web/src/app/api/revalidate/route.ts` | Allow root path `"/"` in revalidation |
| Add `unoptimized` to Image | `apps/web/src/components/landing/instagram-feed-section.tsx` | Bypass Cloudflare proxy for Instagram CDN |

### How It Works

```
CI Deploy → Health Check → curl POST /api/revalidate {"path": "/"}
                                    ↓
                          Next.js re-renders homepage
                                    ↓
                          fetchInstagramPosts() runs with
                          INSTAGRAM_ACCESS_TOKEN from Cloud Run env
                                    ↓
                          ISR cache now contains Instagram data
                                    ↓
                          Subsequent requests serve cached page
```

### Debugging Commands

```bash
# Check if warm-up step ran in CI
gh run view <run-id> --log | grep -A5 "Warm ISR"

# Check Cloud Run logs for revalidation
gcloud logging read 'resource.labels.service_name="nosilha-frontend" AND textPayload=~"Revalidated"' \
  --project=nosilha --limit=5 --freshness=1h

# Verify with Playwright
playwright-cli open https://www.nosilha.com/
playwright-cli snapshot  # search for "Our Island, Our Story"
```

### References

- [Next.js ISR on Cloud Run](https://github.com/vercel/next.js/discussions/90648) — `.next/cache` not copied in standalone output
- [Docker security: build args](https://docs.docker.com/build/building/secrets/) — never use ARG for secrets
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html) — secret management best practices
