# Project Status

**Last Updated:** 2026-03-01
**Branch:** main | **Commits:** ~710

---

## Module Maturity

### Backend (apps/api/ — 210+ Kotlin files, 31 Flyway migrations)

| Module | Files | Endpoints | Tests | Maturity |
|--------|-------|-----------|-------|----------|
| shared | 36 | — | — | Production Ready |
| places | 29 | 15 | 1 | Production Ready |
| gallery | 37 | 22 | 6 | Production Ready |
| ai | 27 | 15 | 5 | Production Ready |
| feedback | 23 | 12 | 2 | Tested |
| auth | 18 | 4 | 0 | API Ready |
| engagement | 15 | 6 | 0 | API Ready |
| stories | 24 | 10 | 0 | API Ready |
| config | 1 | — | — | Production Ready |

**Maturity scale:** Stub > Domain Started > Service Layer > API Ready > Tested > Production Ready

### Frontend (apps/web/ — 186+ components, 53 pages)

| Area | Count | Maturity |
|------|-------|----------|
| UI components | 55+ | Production Ready |
| Admin components | 35+ | Production Ready |
| Content components | 15 | Production Ready |
| Gallery components | 14 | Production Ready |
| Landing components | 10 | Production Ready |
| Map components | 8 | Production Ready |
| Zustand stores | 5 | Tested |
| E2E tests (Playwright) | 6 specs | Tested |
| Unit tests (Vitest) | 20+ files | Tested |
| MDX articles | 5 | Domain Started |

### Infrastructure

| Area | Status | Maturity |
|------|--------|----------|
| CI/CD | 9 GitHub Actions workflows | Production Ready |
| Docker | Compose (local) + multi-stage builds | Production Ready |
| Terraform | GCP Cloud Run IaC | Production Ready |
| Security scanning | Trivy + ktlint + ESLint + tfsec + OWASP remediation | Production Ready |

---

## Specification Pipeline

**Source:** `plan/arkhe/specs/` (27 specs)

### Complete (25)

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
| 022 | Gallery Phase 3 Discovery |
| 023 | BravaMap Migration |
| 024 | BravaMap Component Decomposition |
| 025 | Admin Queue Filter Fixes |
| 026 | Gallery Map View |

### In Progress (1)

| Spec | Title | Remaining Work |
|------|-------|----------------|
| 03 | Design System Compliance | ~40 files need token migration (down from 56-72); `bg-white` context review needed |

### Approved / Ready to Start (1)

| Spec | Title | Blocked By |
|------|-------|------------|
| 02 | Admin UI Standardization | Spec 03 |

---

## Dependency Chains

```
Design System:  04 done -> 03 in progress -> 02 approved
                           05 done + 06 done
Directory:      01 done -> 08 done
AI Pipeline:    010 done -> 009 done -> 011 done -> 001 done
Gallery:        012 done -> 020 done -> 021 done -> 022 done -> 026 done
Map:            023 done -> 024 done
```

No critical blockers. Design System chain (03 -> 02) is the longest active dependency.

---

## Coverage Gaps

### By Domain

| Domain | Coverage | Gap |
|--------|----------|-----|
| Gallery & Media | 90% | Phase 3 + map view done; further phases TBD |
| Directory & Listings | 100% | — |
| AI Pipeline | 90% | Dashboard complete; further enhancements TBD |
| Map | 90% | Migration + decomposition complete |
| Frontend & UI/UX | ~60% | Design system compliance sweep (Spec 03) |
| Content & Heritage | 10% | Platform ready; only 5 articles; 0 translations |
| Community & Social | 0% | No specs for search engine or community validation |
| Infrastructure | 25% | CI/CD testing improvements unspecced |

### Test Coverage

| Module | Gap |
|--------|-----|
| auth | 0 backend tests |
| engagement | 0 backend tests |
| stories | 0 backend tests |
| places core CRUD | Only RelatedContent tested; DirectoryEntry CRUD untested |
| shared kernel | ContentSanitizer, GlobalExceptionHandler untested |
| JaCoCo | Threshold at 5% (goal: 70%) |

---

## What's Working

- Full-stack platform operational: Spring Boot 4 + Next.js 16.1
- Gallery system mature: masonry layout, lightbox, video facade, AI analysis, credit attribution, timeline view, random discovery, gallery map view, R2 storage admin
- AI admin dashboard with domain-level feature toggles, review queue, batch analysis
- Admin dashboard redesigned with sidebar navigation and 8 moderation queues
- Interactive map of Brava Island with zones, trails, 3D terrain, marker clustering, decomposed component architecture
- MDX content platform with Velite processing, Pagefind search, multilingual support
- CI/CD pipeline with 9 workflows covering security, testing, deployment
- Event-driven backend with Spring Modulith enforced boundaries
- Security: OWASP remediation, HTML sanitizer, rate limiting (Bucket4j)

## What's Planned

- Spec 03: Design System Compliance — ~40 files remaining
- Spec 02: Admin UI standardization (blocked on Spec 03)
- API Roadmap: RBAC, i18n, enhanced validation, 80%+ test coverage target
- Content expansion: platform ready, 5 articles seeded, framework for scale
- Wire mock admin APIs: inquiries queue + directory submissions queue

## Recommended Next Actions

1. Complete Spec 03 (Design System Compliance) — unblocks Spec 02
2. Add backend tests for auth, engagement, stories modules
3. Wire admin inquiries queue to real backend (contact message endpoints exist)
4. Wire admin directory queue to real backend (submission endpoints exist)
5. Seed more MDX content — platform architecture ready, only 5 articles exist
6. Add PT/KEA translations for existing articles (translation infra is built)
