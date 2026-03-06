# Project Status

**Last Updated:** 2026-03-06
**Branch:** main | **Commits:** ~720

---

## Module Maturity

### Backend (apps/api/ — 210+ Kotlin files, 9 Flyway migrations)

| Module | Files | Endpoints | Tests | Maturity |
|--------|-------|-----------|-------|----------|
| shared | 36 | — | — | Production Ready |
| places | 29 | 15 | 1 | Production Ready |
| gallery | 37 | 22 | 7 | Production Ready |
| ai | 27 | 15 | 5 | Production Ready |
| feedback | 23 | 12 | 2 | Tested |
| auth | 18 | 4 | 0 | API Ready |
| engagement | 15 | 6 | 0 | API Ready |
| stories | 24 | 10 | 0 | API Ready |
| config | 1 | — | — | Production Ready |

**Maturity scale:** Stub > Domain Started > Service Layer > API Ready > Tested > Production Ready

### Frontend (apps/web/ — 182+ components, 53 pages)

| Area | Count | Maturity |
|------|-------|----------|
| UI components | 55+ | Production Ready |
| Admin components | 35+ | Production Ready |
| Content components | 15 | Production Ready |
| Gallery components | 14 | Production Ready |
| Landing components | 10 | Production Ready |
| Map components | 8 | Production Ready |
| Zustand stores | 6 | Tested |
| E2E tests (Playwright) | 6 specs | Tested |
| Unit tests (Vitest) | 22 files | Tested |
| MDX articles | 5 published + 2 draft | Domain Started |

### Infrastructure

| Area | Status | Maturity |
|------|--------|----------|
| CI/CD | 9 GitHub Actions workflows | Production Ready |
| Docker | Compose (local) + multi-stage builds | Production Ready |
| Terraform | GCP Cloud Run IaC | Production Ready |
| Security scanning | Trivy + ktlint + ESLint + tfsec + OWASP remediation | Production Ready |

---

## Specification Pipeline

**Source:** `plan/arkhe/specs/` (28 specs)

### Complete (27)

| Spec | Title |
|------|-------|
| 001 | AI Admin Dashboard |
| 002 | Admin UI Standardization |
| 01 | Directory Admin CRUD |
| 04 | Token Migration Phase 2 |
| 05 | Form Components |
| 06 | Button/Tab Consistency |
| 07 | EXIF Metadata Extraction |
| 08 | Directory Image Management |
| 009 | AI Image Analysis |
| 010 | Spring AI Refactor |
| 011 | AI Review Queue UI |
| 012 | R2 Admin Management |
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
| 027 | Frontend Performance Improvements |

### In Progress (1)

| Spec | Title | Remaining Work |
|------|-------|----------------|
| 03 | Design System Compliance | ~40 files need token migration (down from 56-72); `bg-white` context review needed |

---

## Dependency Chains

```
Design System:  04 done -> 03 in progress
                05 done + 06 done
Directory:      01 done -> 08 done
AI Pipeline:    010 done -> 009 done -> 011 done -> 001 done
                015 done -> 017 done -> 018 done
Gallery:        012 done -> 020 done -> 021 done -> 022 done -> 026 done
                016 done + 019 done + 025 done
Map:            023 done -> 024 done -> 026 done
```

No critical blockers. Spec 03 (Design System Compliance) is the only active dependency chain.

---

## Coverage Gaps

### By Domain

| Domain | Coverage | Gap |
|--------|----------|-----|
| Gallery & Media | 95% | All 3 phases + map view complete |
| Directory & Listings | 100% | — |
| AI Pipeline | 95% | Dashboard + review + moderation complete |
| Map | 95% | Migration + decomposition + gallery map complete |
| Frontend & UI/UX | ~60% | Design system compliance sweep (Spec 03) |
| Content & Heritage | 10% | Platform ready; 5 articles + 2 drafts; 0 translations |
| Multilingual | 0% | Framework built; zero PT/KEA/FR translations live |
| Community & Social | 20% | Suggestions + contact exist; no story submission flow or moderation dashboard |
| Infrastructure | 25% | CI/CD testing improvements unspecced |

### Test Coverage

| Module | Gap |
|--------|-----|
| auth | 0 backend tests — untested JWT/Supabase integration |
| engagement | 0 backend tests — untested reactions/bookmarks |
| stories | 0 backend tests — untested MDX publishing pipeline |
| places core CRUD | Only RelatedContent tested; DirectoryEntry CRUD untested |
| shared kernel | ContentSanitizer, GlobalExceptionHandler untested |
| JaCoCo | Threshold at 5% (goal: 70%) |

### Production Issues (Pending)

| Issue | Impact |
|-------|--------|
| R2 oversized images | Need compression in upload pipeline |

### Production Issues (Resolved)

| Issue | Resolution | Date |
|-------|-----------|------|
| Cloudflare Image Resizing not enabled | Enabled manually in Cloudflare dashboard | 2026-03 |

---

## What's Working

- Full-stack platform operational: Spring Boot 4 + Next.js 16.1
- Gallery system mature: masonry layout, lightbox, video facade, AI analysis, credit attribution, timeline view, random discovery, gallery map view, R2 storage admin
- AI admin dashboard with domain-level feature toggles, review queue, batch analysis
- Admin dashboard redesigned with sidebar navigation and 8 moderation queues
- Interactive map of Brava Island with zones, trails, 3D terrain, marker clustering, decomposed component architecture
- MDX content platform with Velite processing, Pagefind search, multilingual framework
- CI/CD pipeline with 9 workflows covering security, testing, deployment
- Event-driven backend with Spring Modulith enforced boundaries (12 event types)
- Security: OWASP remediation, HTML sanitizer, rate limiting (Bucket4j)
- Frontend performance optimized (Spec 027): ISR cache profiles, image optimization
- Production audit completed (March 2): CSP, hero image, hydration errors, media routes fixed
- Design review fixes merged (PR #92): responsive improvements, category-to-icon mapping consolidated into shared utility

## What's Planned

- Spec 03: Design System Compliance — ~40 files remaining
- P0 quick wins: fix content tooling bugs, publish 2 draft articles, admin role setup (~3 hrs)
- P1 high impact: language switcher UI, Portuguese translations, admin moderation dashboard, community story submission
- P2 medium impact: Kriolu content, history category articles, user profile enhancement
- API Roadmap: RBAC, i18n, enhanced validation, 80%+ test coverage target

## Recommended Next Actions

1. **Close P0 gaps** — Fix tooling bugs, publish draft articles, set up admin roles (~3 hrs)
2. **Complete Spec 03** (Design System Compliance) — only in-progress spec
3. **Add backend tests** for auth, engagement, stories modules (reduce critical risk)
4. **Build language switcher** — unblocks all multilingual content work
5. **Create PT translations** for existing 5 articles (AI-assisted, ~4-6 hrs)
6. **Wire admin queues** — inquiries + directory submissions to real backend endpoints
7. **Seed more MDX content** — history category (5 planned articles)
