# Analytics Deployment Guide

This guide explains how to deploy Google Analytics 4 and Microsoft Clarity analytics tracking to the Nos Ilha platform in production.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Environment Variable Strategy](#environment-variable-strategy)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## Architecture Overview

### Build-Time vs Runtime Configuration

Analytics configuration for the Nos Ilha frontend uses **build-time environment variables** following Next.js best practices:

```
GitHub Actions → Docker build-args → Dockerfile ARG/ENV →
npm run build → JavaScript bundle (static) → Docker image → Cloud Run
```

**Key Principle:** `NEXT_PUBLIC_*` environment variables are **inlined into the JavaScript bundle** during the build process. This means:

✅ **Build-Time Evaluation:** Variables are replaced with their actual values when `npm run build` runs
❌ **Runtime Changes Ignored:** Once built, the app will NOT respond to environment variable changes

### Why Not Terraform?

The project uses **different patterns** for frontend vs backend environment variables:

| Component | Variables | Pattern | Why |
|-----------|-----------|---------|-----|
| **Backend** | Database credentials, JWT secrets | Terraform `env {}` + Secret Manager | Runtime injection, hot-swappable |
| **Frontend** | API URLs, analytics IDs | GitHub Secrets + Docker build-args | Build-time compilation, baked into JS |

**Frontend analytics variables are NOT in Terraform** because:
- Terraform's `env {}` blocks inject at **container runtime** (too late - JS already compiled)
- `NEXT_PUBLIC_*` variables must be available during `npm run build`
- Cloud Run env vars would have **no effect** on already-built JavaScript bundles

### Official Documentation Support

From [Next.js Environment Variables documentation](https://nextjs.org/docs/pages/guides/environment-variables):

> "Variables prefixed with `NEXT_PUBLIC_` are inlined into the JavaScript sent to the browser during build... After being built, your app will no longer respond to changes to these environment variables."

From [Cloud Run Environment Variables documentation](https://cloud.google.com/run/docs/configuring/services/environment-variables):

> Runtime environment variables configure running services. For build-time configuration, use build environment variables during the container construction process.

## Environment Variable Strategy

### Analytics Variables

| Variable | Type | Description | Where to Get |
|----------|------|-------------|--------------|
| `NEXT_PUBLIC_GA_ID` | Build-time | Google Analytics 4 Measurement ID | [analytics.google.com](https://analytics.google.com) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Build-time | Microsoft Clarity Project ID | [clarity.microsoft.com](https://clarity.microsoft.com) |

### Why GitHub Secrets (Not Google Secret Manager)?

**Decision:** Store analytics IDs in GitHub Secrets, not Google Secret Manager

**Rationale:**
1. **Public Nature:** `NEXT_PUBLIC_*` variables are **intentionally public** (visible in browser JavaScript)
2. **Cost Optimization:** Zero GCP costs vs Secret Manager access operations
3. **Appropriate Security:** GitHub Secrets protects from repository exposure, not end users
4. **Build-Time Injection:** Variables needed during GitHub Actions build, not Cloud Run runtime
5. **Consistency:** Matches existing pattern for `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, etc.

## Local Development Setup

### 1. Copy Environment Template

```bash
cd apps/web
cp .env.local.example .env.local
```

### 2. Configure Analytics Variables

Edit `.env.local` and add your analytics IDs:

```bash
# Analytics Integration (optional for local development)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcd1234
```

**Note:** Analytics variables are **optional** for local development. If not set, the analytics integration will gracefully skip initialization.

### 3. Get Your Analytics IDs

**Google Analytics 4:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a GA4 property for your local testing domain (if needed)
3. Navigate to: Admin → Property → Data Streams → Web
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

**Microsoft Clarity:**
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Create a new project
3. Navigate to: Settings → Setup
4. Copy the **Project ID** from the tracking code (format: `abcd1234`)

### 4. Restart Development Server

```bash
npm run dev
```

Changes to `.env.local` require a server restart to take effect.

## Production Deployment

### Prerequisites

Before deploying, you need:
- ✅ Google Analytics 4 property created for `nosilha.com`
- ✅ Microsoft Clarity project created for `nosilha.com`
- ✅ Repository admin access to configure GitHub Actions secrets

### Step 1: Add GitHub Actions Secrets

1. **Navigate to Repository Settings:**
   ```
   GitHub Repository → Settings → Secrets and variables → Actions
   ```

2. **Add Secrets:**

   Click **New repository secret** and add:

   **Secret 1:**
   - Name: `NEXT_PUBLIC_GA_ID`
   - Value: Your GA4 Measurement ID (e.g., `G-1234567890`)

   **Secret 2:**
   - Name: `NEXT_PUBLIC_CLARITY_PROJECT_ID`
   - Value: Your Clarity Project ID (e.g., `abcd1234`)

### Step 2: Verify CI/CD Configuration

The following files are already configured (no changes needed):

**✅ `frontend/Dockerfile`** (lines 24-25, 32-33):
```dockerfile
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID

ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID
```

**✅ `.github/workflows/frontend-ci.yml`** (3 locations):
```yaml
# Build step (~line 117)
NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
NEXT_PUBLIC_CLARITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_CLARITY_PROJECT_ID }}

# Bundle analysis step (~line 186)
NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
NEXT_PUBLIC_CLARITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_CLARITY_PROJECT_ID }}

# Docker build args (~line 266)
NEXT_PUBLIC_GA_ID=${{ secrets.NEXT_PUBLIC_GA_ID }}
NEXT_PUBLIC_CLARITY_PROJECT_ID=${{ secrets.NEXT_PUBLIC_CLARITY_PROJECT_ID }}
```

### Step 3: Deploy to Production

Once GitHub Secrets are configured:

1. **Push to Main Branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions Will:**
   - Run linting and type checks with analytics variables
   - Build Next.js application with analytics IDs baked in
   - Create Docker image with analytics tracking enabled
   - Deploy to Cloud Run with analytics integrated

3. **Monitor Deployment:**
   ```
   GitHub Repository → Actions → Frontend CI/CD workflow
   ```

### Step 4: Verify Analytics in Production

**Google Analytics 4:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Navigate to: Reports → Realtime
3. Visit your production site: `https://nosilha.com`
4. Verify you see active users in the Realtime report

**Microsoft Clarity:**
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Navigate to your project dashboard
3. Wait 2-3 minutes for data processing
4. Check: Dashboard → Recordings (should see session recordings)

**Browser Verification:**
1. Open production site in browser
2. Open browser DevTools (F12)
3. Check Console for analytics initialization messages
4. View Page Source - analytics IDs should be visible in `<script>` tags

## Troubleshooting

### Analytics Not Working in Production

**Symptom:** No data appearing in GA4 or Clarity dashboards

**Check 1: GitHub Secrets Configured**
```bash
# Navigate to: GitHub Repository → Settings → Secrets and variables → Actions
# Verify both secrets exist:
# - NEXT_PUBLIC_GA_ID
# - NEXT_PUBLIC_CLARITY_PROJECT_ID
```

**Check 2: Workflow Build Logs**
```bash
# GitHub Actions → Latest workflow run → Build & Package job
# Look for: "ARG NEXT_PUBLIC_GA_ID" in Docker build output
# Should NOT show empty values
```

**Check 3: Deployed Container Image**
```bash
# Check Cloud Run service environment (should be empty for NEXT_PUBLIC_* vars)
gcloud run services describe nosilha-frontend --region=us-east1 --format=yaml

# Correct: No NEXT_PUBLIC_* in env (they're baked into the image)
```

**Check 4: Browser Console**
```javascript
// Open DevTools Console on production site
console.log(process.env.NEXT_PUBLIC_GA_ID)
console.log(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID)

// Should show actual values, NOT 'undefined'
```

### Variables Show as 'undefined' in Browser

**Cause:** GitHub Secrets not configured or workflow didn't use them

**Solution:**
1. Add secrets to GitHub (Step 1 above)
2. Trigger new deployment: push a commit or manually re-run workflow
3. Wait for build to complete (~5-10 minutes)
4. Clear browser cache and reload

### Analytics IDs Visible in Page Source - Is This Secure?

**Answer:** Yes, this is expected and secure.

`NEXT_PUBLIC_*` variables are **intentionally public** - they're designed to be exposed in browser JavaScript. This is normal for:
- Google Analytics Measurement IDs
- Microsoft Clarity Project IDs
- Mapbox Access Tokens (public tier)
- Supabase Anonymous Keys

GitHub Secrets protect these from being **committed to git**, not from being **visible to end users**.

### Need to Change Analytics IDs

**Process:**
1. Update GitHub Secrets with new values
2. Push any commit to trigger rebuild (or manually re-run workflow)
3. GitHub Actions will rebuild with new IDs baked in
4. Deployment completes automatically

**Note:** Unlike backend secrets (database, JWT), you **cannot** hot-swap frontend analytics IDs without rebuilding.

### Local Development - Analytics Not Initializing

**Cause:** `.env.local` not configured

**Solution:**
1. Copy `.env.local.example` to `.env.local`
2. Add your local/test analytics IDs
3. Restart development server: `npm run dev`

**Note:** If you want to develop without analytics, simply leave the variables unset - the app will work fine.

## References

### Official Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)
- [Cloud Run Environment Variables](https://cloud.google.com/run/docs/configuring/services/environment-variables)
- [Google Analytics 4 Setup](https://analytics.google.com)
- [Microsoft Clarity Setup](https://clarity.microsoft.com)

### Project Documentation

- [Analytics Implementation Guide](../plan/research/analytics-stack-implement-guide.md) - Complete analytics stack setup
- [CI/CD Pipeline Guide](./CI_CD_PIPELINE.md) - GitHub Actions workflow details
- [Secret Management Guide](./SECRET_MANAGEMENT.md) - Backend secrets (Terraform + Secret Manager)
- [CLAUDE.md](../CLAUDE.md) - Project configuration reference

### Community Resources

- [Next.js + Docker Environment Variables Discussion](https://github.com/vercel/next.js/discussions/17641)
- [Docker Build Args Best Practices](https://docs.docker.com/build/building/variables/)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)

## Summary

**Key Takeaways:**

1. ✅ Analytics uses **GitHub Secrets + Docker build-args** (NOT Terraform)
2. ✅ Variables are **baked into JavaScript** at build time
3. ✅ Changing IDs requires **full rebuild and redeploy**
4. ✅ IDs being **public in browser** is expected and secure
5. ✅ Pattern matches **existing NEXT_PUBLIC_\*** variables

For implementation details, see [Analytics Implementation Guide](../plan/research/analytics-stack-implement-guide.md).
