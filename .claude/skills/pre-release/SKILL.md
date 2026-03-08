---
name: pre-release
description: Run the full pre-release verification checklist before deploying to production
disable-model-invocation: true
---

# Pre-release Verification

Run the complete pre-release checklist for the Nos Ilha project. This orchestrates all quality gates before deploying to production.

## Execution Plan

### Phase 1: Parallel Lint & Test (Frontend + Backend)

Run these two groups **in parallel** using separate Bash tool calls:

**Frontend group** (sequential within group):
1. `cd apps/web && npx tsc --noEmit` — TypeScript type checking
2. `cd apps/web && pnpm run lint` — ESLint
3. `cd apps/web && pnpm run format:check` — Prettier formatting
4. `cd apps/web && pnpm run validate:content` — MDX content validation (frontmatter, links, cross-refs)
5. `cd apps/web && pnpm run test:unit` — Vitest unit tests (stores, hooks, utils)

**Backend group** (sequential within group):
1. `cd apps/api && ./gradlew ktlintCheck` — Kotlin style
2. `cd apps/api && ./gradlew test` — Integration tests (requires Docker for Testcontainers)

**Fail-fast**: If ANY step in Phase 1 fails, STOP and report the failure. Do not proceed to Phase 2.

### Phase 2: Production Build

Run sequentially after Phase 1 passes:

1. `cd apps/web && pnpm run build` — Next.js production build (Velite content processing + Pagefind search index)

**Fail-fast**: If build fails, STOP. Do not proceed to Phase 3.

### Phase 3: E2E Tests

Run after successful build:

1. `cd apps/web && pnpm run test:e2e` — Playwright E2E tests (6 specs: auth login/logout, directory browsing, map interaction, homepage, culture flyout)

Note: Playwright config auto-starts the dev server via `webServer` config — no manual server start needed.

### Phase 4: Visual Spot-check (Optional)

After E2E tests pass, use the `playwright:playwright-cli` skill to visually verify key pages:

1. Invoke the `playwright:playwright-cli` skill first
2. Open and screenshot these pages:
   - Homepage (`http://localhost:3000`)
   - Directory listing (`http://localhost:3000/directory`)
   - A category page (`http://localhost:3000/directory/restaurant`)
   - Map view (`http://localhost:3000/explore`)
3. Present screenshots to the user for visual confirmation

### Summary Report

After all phases complete, output a summary table:

```
Pre-release Verification Results
================================
Phase 1 — Lint & Test
  TypeScript ............. PASS/FAIL
  ESLint ................. PASS/FAIL
  Prettier ............... PASS/FAIL
  Content validation ..... PASS/FAIL
  Unit tests ............. PASS/FAIL
  Kotlin lint ............ PASS/FAIL
  Backend tests .......... PASS/FAIL

Phase 2 — Build
  Next.js build .......... PASS/FAIL

Phase 3 — E2E
  Playwright tests ....... PASS/FAIL

Phase 4 — Visual
  Screenshots ............ REVIEWED/SKIPPED

Overall: READY / NOT READY for release
```

## Prerequisites

- Docker running (required for backend Testcontainers)
- Environment files configured (`task setup` completed)
- All dependencies installed (`pnpm install` in apps/web, Gradle wrapper in apps/api)

## Notes

- Total expected time: 10-15 minutes depending on machine
- Phase 4 (visual spot-check) can be skipped if the user is satisfied with automated results
- If only frontend or backend changes were made, the user can ask to skip the unaffected group
