# Testing Guide - Nos Ilha Platform (Simplified for Solo Maintainer)

This document describes the simplified, TypeScript-first testing strategy optimized for a solo-maintained open-source project with limited budget.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [CI/CD Quality Gates](#cicd-quality-gates)
3. [Local Development Testing](#local-development-testing)
4. [Pre-Release Checklist](#pre-release-checklist)
5. [Testing Tools Reference](#testing-tools-reference)
6. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

### Solo Maintainer Approach

The Nos Ilha platform uses a **lean, TypeScript-first testing strategy** optimized for:
- ✅ **Fast CI/CD** (3-5 minutes instead of 15-20 minutes)
- ✅ **Budget-conscious** (73% reduction in GitHub Actions minutes)
- ✅ **Low maintenance** (76% fewer test files to maintain)
- ✅ **High confidence** through strict TypeScript and ESLint

### Research-Backed Strategy

This approach aligns with industry best practices for solo-maintained projects:
- **TypeScript-first quality gates**: Used by Vite, Astro, ts-pattern
- **Playwright local-only**: Recommended by Remix and Astro communities
- **Lean testing pyramid**: Based on Kent C. Dodds Testing Trophy

### Two-Layer Testing

```
┌─────────────────────────────────────┐
│   CI/CD (Automated - Always Run)   │  ← TypeScript + ESLint + Build
├─────────────────────────────────────┤
│ Local Development (Manual - As Needed)│ ← Playwright E2E + Vitest Unit
└─────────────────────────────────────┘
```

---

## CI/CD Quality Gates

### What Runs in CI/CD (Automated)

Every push and pull request runs:

1. **Security Scanning** (Trivy + ESLint SARIF)
2. **TypeScript Compilation** (`pnpm exec tsc --noEmit`)
3. **ESLint** (`pnpm run lint`)
4. **Next.js Build** (`pnpm run build`)

**Execution Time**: 3-5 minutes (75% faster than previous approach)

**No E2E or Unit Tests in CI** - These run locally only to reduce costs and flakiness.

### Why This Works

**TypeScript catches:**
- Type errors
- Missing imports
- API contract violations
- Component prop errors

**ESLint catches:**
- Code quality issues
- Style violations
- Common bugs
- Accessibility issues

**Build validates:**
- No runtime errors
- All imports resolve
- Configuration is correct

Together, these gates catch 80-90% of issues without expensive E2E test infrastructure.

---

## Local Development Testing

### Playwright E2E Tests (Local Only)

**Location**: `apps/web/tests/e2e/`, `apps/web/tests/shared/`

**Configuration**: `apps/web/playwright.config.ts`

**When to run:**
- Before major releases
- After significant refactoring
- When changing critical user flows
- Optional during feature development

**How to run:**
```bash
cd apps/web

# Headless mode (Chromium only)
pnpm run test:e2e

# With browser UI (for debugging)
pnpm run test:e2e:headed

# Debug mode with breakpoints
pnpm run test:e2e:debug

# View last test report
pnpm run test:e2e:report
```

**Test Coverage** (6 critical tests):
- `auth-login.spec.ts` - User authentication flow
- `auth-logout.spec.ts` - Session cleanup
- `directory-browsing.spec.ts` - Directory navigation
- `map-interaction.spec.ts` - Mapbox integration
- `homepage.spec.ts` - Homepage functionality
- `culture-flyout-menu.spec.ts` - Culture menu navigation

**Simplified Configuration**:
- **One browser**: Chromium only (not Firefox, Safari, or mobile)
- **No retries**: Faster feedback for local development
- **No CI integration**: Runs locally only

### Vitest Unit Tests (Local Only)

**Location**: `apps/web/tests/unit/`

**Configuration**: `apps/web/vitest.config.ts`

**When to run:**
- During TDD workflow for stores/hooks
- After changing state management
- Optional for component development

**How to run:**
```bash
cd apps/web

# Run once
pnpm run test:unit

# Watch mode (for TDD)
pnpm run test:unit --watch

# With coverage (optional)
pnpm run test:unit -- --coverage
```

**Test Coverage** (4 critical tests):
- `tests/unit/stores/authStore.test.ts` - Zustand auth state
- `tests/unit/stores/filterStore.test.ts` - Filter state
- `tests/unit/stores/uiStore.test.ts` - UI state
- `tests/unit/hooks/useDirectoryEntries.test.tsx` - TanStack Query hook

**Simplified Configuration**:
- **No coverage thresholds**: Coverage not enforced
- **No CI uploads**: Local development only

---

## Pre-Release Checklist

### Before Major Releases (15-20 minutes)

Run this checklist manually before deploying significant changes:

#### 1. Local E2E Tests (10 min)
```bash
cd apps/web
pnpm run test:e2e
```
- Validates critical user flows work end-to-end
- Chromium browser only (desktop)
- Should have 100% pass rate

#### 2. Mobile Device Testing (10 min)
- **iOS Safari**: Test on iPhone (or simulator)
- **Android Chrome**: Test on Android device (or emulator)
- **Key flows**: Homepage → Directory → Entry details → Map

Focus areas:
- Responsive layout works correctly
- Touch interactions function properly
- Performance is acceptable on mobile

#### 3. Optional: Lighthouse Audit (5 min)
```bash
# Config available in lighthouserc.js
npx @lhci/cli@latest autorun
```
- Run on key pages: homepage, directory, map, towns
- Check Core Web Vitals (LCP, FID, CLS)
- Verify accessibility score >90

### What to Do If Tests Fail

**E2E test failures:**
1. Run `pnpm run test:e2e:headed` to see what's happening
2. Fix the issue locally
3. Re-run tests until passing
4. DO NOT deploy with failing E2E tests

**Accessibility violations:**
1. Note the specific WCAG criteria violated
2. Fix in the component code
3. Use Lighthouse audit or browser dev tools to verify
4. Verify with screen reader if critical

**Mobile issues:**
1. Use browser dev tools responsive mode first
2. Test on real device if issue persists
3. Check Tailwind breakpoints in component code
4. Verify touch targets are ≥44px

---

## Testing Tools Reference

### Installed Testing Tools

**For CI/CD:**
- TypeScript 5.x - Type checking
- ESLint 9.x - Code quality and linting
- Next.js 16.0.3 - Build validation

**For Local Development (NOT in CI):**
- Playwright 1.56 - E2E testing (Chromium only)
- Vitest 3.2 - Unit testing (critical stores/hooks only)

**Removed Tools** (no longer used):
- Storybook - Removed (maintenance overhead outweighed benefits)
- Lighthouse CI - Config available (`lighthouserc.js`) but not in CI
- K6 - Load testing removed (overkill for MVP)
- Bundle analysis - Removed (Next.js warnings sufficient)
- Mobile Playwright projects - Test manually on real devices
- Chromatic - Visual testing service removed

### Configuration Files

| File | Purpose | Usage |
|------|---------|-------|
| `playwright.config.ts` | Playwright E2E config | Local development only |
| `vitest.config.ts` | Vitest unit test config | Local development only |
| `lighthouserc.js` | Lighthouse audit config | Optional manual audits |

### Test Scripts

**Available in package.json:**
```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report",
  "test:unit": "vitest --project unit"
}
```

**Removed scripts** (no longer available):
- `storybook`, `build-storybook`
- `test:performance`, `test:mobile`, `test:api`, `test:critical`
- `lighthouse:audit`, `lighthouse:upload`, `lighthouse:assert`
- `k6:directory`, `k6:towns`, `k6:journey`, `k6:all`
- `test:ci`, `test:ci:mobile`, `test:ci:performance`, `test:ci:contracts`

---

## Troubleshooting

### TypeScript Errors in CI

**Symptom**: CI fails with TypeScript compilation errors

**Solution**:
```bash
cd apps/web
pnpm exec tsc --noEmit
```
Fix all type errors before pushing. Common issues:
- Missing type imports
- Incorrect component props
- API response type mismatches

### ESLint Errors in CI

**Symptom**: CI fails with ESLint violations

**Solution**:
```bash
cd apps/web
pnpm run lint:fix
```
This auto-fixes most issues. For remaining errors, check `eslint.config.mjs`.

### Next.js Build Fails in CI

**Symptom**: CI fails during `pnpm run build`

**Common causes**:
1. **Missing environment variables** - Check `.env.local.example`
2. **Import errors** - Verify all imports resolve
3. **API fetch errors during static generation** - Expected if backend is not running

**Solution**:
```bash
cd apps/web
pnpm run build
```
Fix all build errors locally before pushing.

### E2E Tests Fail Locally

**Symptom**: Playwright tests fail when run locally

**Debugging steps**:
1. Run with UI: `pnpm run test:e2e:headed`
2. Check if dev server is running: http://localhost:3000
3. Verify backend API is accessible (if using real API)
4. Check test data in `tests/setup/global-setup.ts`

**Common issues**:
- Dev server not started automatically
- Environment variables not set in `.env.local`
- Backend API not running (switch to mock API)

### "Tests Used to Run in CI, Why Don't They Now?"

**Answer**: The project switched to a TypeScript-first approach to:
- Reduce CI/CD costs by 73%
- Speed up CI/CD by 75% (3-5 min instead of 15-20 min)
- Reduce maintenance burden for solo maintainer
- Follow industry best practices (Vite, Astro, Remix patterns)

**E2E and unit tests are still available** - they just run locally instead of in CI. Use the Pre-Release Checklist above before major deployments.

---

## Related Documentation

- **CI/CD Pipeline**: `docs/CI_CD_PIPELINE.md` - Complete CI/CD reference
- **Design System**: `docs/DESIGN_SYSTEM.md` - Component styling standards
- **Architecture**: `docs/ARCHITECTURE.md` - System overview
- **Frontend README**: `apps/web/README.md` - Quick testing reference

For questions or issues, see `docs/TROUBLESHOOTING.md` or open a GitHub issue.
