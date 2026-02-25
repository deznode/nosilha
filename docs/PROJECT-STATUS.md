# Project Status

**Last Updated:** 2026-02-25
**Branch:** main | **Commits:** 700

---

## Module Maturity

### Backend (apps/api/ — 208 Kotlin files, 29 Flyway migrations)

| Module | Files | Controllers | Tests | Maturity |
|--------|-------|-------------|-------|----------|
| shared | 35 | — | — | Production Ready |
| places | 29 | 4 | 1 | Production Ready |
| gallery | 36 | 2 | 5 | Production Ready |
| ai | 27 | 2 | 5 | Production Ready |
| feedback | 23 | 5 | 2 | Tested |
| auth | 18 | 2 | 0 | API Ready |
| engagement | 15 | 3 | 0 | API Ready |
| stories | 24 | 3 | 0 | API Ready |
| config | 1 | — | — | Production Ready |

**Maturity scale:** Stub > Domain Started > Service Layer > API Ready > Tested > Production Ready

### Frontend (apps/web/ — 186 components, 53 pages)

| Area | Count | Maturity |
|------|-------|----------|
| UI components | 56 | Production Ready |
| Admin components | 35 | Production Ready |
| Content components | 15 | Production Ready |
| Gallery components | 6 | Production Ready |
| Landing components | 14 | Production Ready |
| Zustand stores | 5 | Tested |
| E2E tests (Playwright) | 6 specs | Tested |
| Unit tests (Vitest) | 0 files | — |
| MDX articles | 5 | Domain Started |

### Infrastructure

| Area | Status | Maturity |
|------|--------|----------|
| CI/CD | 9 GitHub Actions workflows | Production Ready |
| Docker | Compose (local) + multi-stage builds | Production Ready |
| Terraform | GCP Cloud Run IaC | Production Ready |
| Security scanning | Trivy + ktlint + ESLint + tfsec | Production Ready |

---

## Specification Pipeline

**Source:** `plan/arkhe/specs/` (25 specs)

### Complete (23)

| Spec | Title |
|------|-------|
| 001 | AI Admin Dashboard |
| 01 | Directory Admin CRUD |
| 04 | Token Migration Phase 2 |
| 05 | Form Components |
| 06 | Button/Tab Consistency |
| 07 | EXIF Metadata Extraction |
| 08 | Directory Image Management |
| 009 | AI Image Analysis |
| 010 | Spring AI Refactor |
| 011 | AI Review Queue UI |
| 012 | Gallery Public Display |
| 013 | Admin Panel Redesign |
| 014 | Admin Queue Pages |
| 015 | Centralize Text AI |
| 016 | Gallery Media Edit |
| 017 | AI Module Refactoring |
| 018 | AI Review Separation |
| 019 | Smart Credit Attribution |
| 020 | Gallery Masonry Lightbox |
| 021 | Gallery Enhancements |
| 023 | BravaMap Migration |
| 024 | BravaMap Component Decomposition |
| 025 | Admin Queue Filter Fixes |

### In Progress (1)

| Spec | Title | Remaining Work |
|------|-------|----------------|
| 03 | Design System Compliance | ~40 files need token migration (down from 56-72); `bg-white` context review needed |

### Approved / Ready to Start (2)

| Spec | Title | Blocked By |
|------|-------|------------|
| 02 | Admin UI Standardization | Spec 03 |
| 022 | Gallery Phase 3 Discovery | None |

---

## Dependency Chains

```
Design System:  04 done -> 03 in progress -> 02 approved
                           05 done + 06 done
Directory:      01 done -> 08 done
AI Pipeline:    010 done -> 009 done -> 011 done -> 001 done
Gallery:        012 done -> 020 done -> 021 done -> 022 approved
Map:            023 done -> 024 done
```

No critical blockers. Design System chain (03 -> 02) is the longest active dependency.

---

## Coverage Gaps

### By Domain

| Domain | Coverage | Gap |
|--------|----------|-----|
| Gallery & Media | 80% | Phase 3 discovery (Spec 022) |
| Directory & Listings | 100% | — |
| Frontend & UI/UX | ~60% | Design system compliance sweep (Spec 03) |
| Content & Heritage | 0% | No specs for cultural verification workflow |
| Community & Social | 0% | No specs for search engine or community validation |
| Infrastructure | 25% | CI/CD testing improvements unspecced |

### Test Coverage

| Module | Gap |
|--------|-----|
| auth | 0 backend tests |
| engagement | 0 backend tests |
| stories | 0 backend tests |
| Core pages | No frontend unit tests for page components |

---

## What's Working

- Full-stack platform operational: Spring Boot 4 + Next.js 16.1
- Gallery system mature: masonry layout, lightbox, video facade, AI analysis, credit attribution
- AI admin dashboard with domain-level feature toggles
- Admin dashboard redesigned with sidebar navigation and moderation queues
- Interactive map of Brava Island with zones, trails, 3D terrain, decomposed into clean component architecture
- MDX content platform with Velite processing, Pagefind search, multilingual support
- CI/CD pipeline with 9 workflows covering security, testing, deployment
- Event-driven backend with Spring Modulith enforced boundaries

## What's Planned

- Spec 03: Design System Compliance — ~40 files remaining
- Spec 02: Admin UI standardization (blocked on Spec 03)
- Spec 022: Gallery Phase 3 — random photo discovery + crowdsourced metadata
- API Roadmap: RBAC, i18n, enhanced validation, 80%+ test coverage target
- Content expansion: platform ready, 5 articles seeded, framework for scale

## Recommended Next Actions

1. Complete Spec 03 (Design System Compliance) — unblocks Spec 02
2. Start Spec 022 (Gallery Phase 3) — approved, no blockers
3. Add backend tests for auth, engagement, stories modules
4. Investigate missing frontend unit tests (removed from codebase)
5. Seed more MDX content — platform architecture ready, only 5 articles exist
