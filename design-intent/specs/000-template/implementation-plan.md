# Implementation Plan Template

---
plan-id: XXX
spec-ref: [Link to approved spec]
title: [Feature Title] Implementation
status: draft | in-progress | completed
author: Joaquim Costa
created: YYYY-MM-DD
estimated-effort: XS | S | M | L | XL
---

## Overview

[Brief summary referencing the approved spec]

## Prerequisites

- [ ] [Dependency 1] — [Status]
- [ ] [Dependency 2] — [Status]

## Implementation Phases

### Phase 1: [Foundation/Setup]

**Goal**: [What this phase achieves]

#### Tasks

1. [ ] **[Task 1.1]**
   - File: `apps/web/src/components/[path].tsx`
   - Changes: [Description]

2. [ ] **[Task 1.2]**
   - File: `apps/web/src/app/[path]/page.tsx`
   - Changes: [Description]

#### Verification

```bash
cd apps/web && npx tsc --noEmit  # Type check
pnpm run lint                     # Lint
```

---

### Phase 2: [Core Implementation]

**Goal**: [What this phase achieves]

#### Tasks

1. [ ] **[Task 2.1]**
   - File: `apps/web/src/components/[path].tsx`
   - Changes: [Description]

#### Verification

```bash
pnpm run dev  # Visual check at http://localhost:3000
```

playwright-cli verification:
- [ ] Navigate to page, take screenshot
- [ ] Verify responsive at 375px, 768px, 1280px
- [ ] Check dark mode toggle

---

### Phase 3: [Polish/Integration]

**Goal**: [What this phase achieves]

#### Tasks

1. [ ] **[Task 3.1]**
   - File: `apps/web/src/components/[path].tsx`
   - Changes: [Description]

#### Verification

- [ ] playwright-cli: Full page screenshot (light + dark)
- [ ] Keyboard navigation test
- [ ] Screen reader check (ARIA labels, roles)

## File Changes Summary

### New Files

| Path | Purpose |
|------|---------|
| `apps/web/src/components/[path].tsx` | [Description] |

### Modified Files

| Path | Changes |
|------|---------|
| `apps/web/src/app/[path]/page.tsx` | [What changes] |

## Caching & ISR

| Page/Route | Strategy | Revalidate |
|------------|----------|------------|
| [Route] | ISR / Static / Dynamic | [Duration] |

## Testing Strategy

### Type Check & Lint

```bash
cd apps/web && npx tsc --noEmit && pnpm run lint
```

### E2E Tests (Playwright)

- [ ] [User journey]: [Steps to automate]

### playwright-cli Visual Verification

- [ ] [Page/state]: Navigate → screenshot → verify layout
- [ ] [Responsive]: Resize → screenshot at 375px, 768px, 1280px
- [ ] [Dark mode]: Toggle theme → screenshot

### Manual Testing

- [ ] [Scenario]: [Steps to verify]

## Build Verification

```bash
pnpm run build  # Full production build (includes Velite content processing)
```

## Definition of Done

- [ ] All tasks completed
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Production build succeeds
- [ ] playwright-cli screenshots reviewed (light + dark, mobile + desktop)
- [ ] Accessibility verified (keyboard nav, ARIA, contrast)

## Notes

[Decisions made during implementation, lessons learned]

---

## Progress Log

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| YYYY-MM-DD | 1 | Started | [Notes] |
