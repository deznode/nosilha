# Project Status

**Last Updated:** 2026-03-10
**Branch:** main | **Commits:** 52 (repo re-initialized 2026-03-02 with squashed history)

---

## Module Maturity

### Backend (apps/api/ — 243 Kotlin files, 11 Flyway migrations, 99 endpoints)

| Module | Files | Endpoints | Tests | Maturity |
|--------|-------|-----------|-------|----------|
| shared | 36 | — | 0 | Production Ready |
| places | 29 | 19 | 1 | Production Ready |
| gallery | 47 | 30 | 9 | Production Ready |
| ai | 27 | 16 | 5 | Production Ready |
| feedback | 23 | 13 | 2 | Tested |
| auth | 18 | 4 | 0 | API Ready |
| engagement | 15 | 6 | 0 | API Ready |
| stories | 24 | 11 | 0 | API Ready |
| config | 1 | — | 1 | Production Ready |

**Maturity scale:** Stub > Domain Started > Service Layer > API Ready > Tested > Production Ready

### Frontend (apps/web/ — ~196 components, 55 pages)

| Area | Count | Maturity |
|------|-------|----------|
| UI components | 55 | Production Ready |
| Admin components | 38 | Production Ready |
| Content components | 15 | Production Ready |
| Gallery components | 14 | Production Ready |
| Landing components | 15 | Production Ready |
| Map components | 10 | Production Ready |
| Zustand stores | 5 | Tested |
| E2E tests (Playwright) | 6 specs | Tested |
| Unit tests (Vitest) | 22 files | Tested |
| MDX articles | 5 published | Production Ready |

### Infrastructure

| Area | Status | Maturity |
|------|--------|----------|
| CI/CD | 10 GitHub Actions workflows | Production Ready |
| Docker | Compose (local) + multi-stage builds | Production Ready |
| Terraform | GCP Cloud Run IaC | Production Ready |
| Security scanning | Trivy + ktlint + ESLint + tfsec + OWASP remediation | Production Ready |
| Git hooks | Lefthook (replaced Husky) | Production Ready |

---

## Specification Pipeline

**Source:** `plan/arkhe/specs/` (30 spec directories)

### Complete (29)

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
| 028 | Social Media Integration |
| 029 | YouTube Channel Sync |

### Complete (no spec directory — implemented via PR)

| Spec | Title | PR |
|------|-------|----|
| — | Design Review Fixes | #92 |

### In Progress (1)

| Spec | Title | Remaining Work |
|------|-------|----------------|
| 03 | Design System Compliance | 56 files use raw color classes (48 excluding catalyst-ui); `bg-white` context review needed |

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
Social Media:   028 done -> 029 done
```

No critical blockers. Spec 03 (Design System Compliance) is the only active dependency chain.

---

## Coverage Gaps

### By Domain

| Domain | Coverage | Gap |
|--------|----------|-----|
| Gallery & Media | 98% | YouTube sync complete; R2 image compression pending |
| Directory & Listings | 100% | — |
| AI Pipeline | 95% | Dashboard + review + moderation complete |
| Map | 95% | Migration + decomposition + gallery map complete |
| Frontend & UI/UX | ~60% | Design system compliance sweep (Spec 03) |
| Content & Heritage | 20% | 5 published articles (music, people, traditions); history/ and places/ categories empty |
| Multilingual | 0% | Framework built; zero PT/KEA/FR translations live |
| Community & Social | 30% | Suggestions + contact exist; OG images + Instagram feed live; YouTube sync live; no story submission flow |
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

### Open GitHub Issues

| Issue | Title | Date |
|-------|-------|------|
| #86 | feat(api): add tag-based revalidation to FrontendRevalidationService | 2026-03-02 |

### Production Issues (Pending)

| Issue | Impact |
|-------|--------|
| R2 oversized images | Need compression in upload pipeline |

### Production Issues (Resolved)

| Issue | Resolution | Date |
|-------|-----------|------|
| Cloudflare Image Resizing not enabled | Enabled manually in Cloudflare dashboard | 2026-03 |
| CSP headers blocking inline scripts | CSP policy tightened, nonce-based exemptions added | 2026-03-10 |
| React hydration mismatches | Fixed client/server rendering inconsistencies | 2026-03-10 |
| Chart rendering failures | Fixed chart component initialization on client | 2026-03-10 |
| YouTube CDN domain not in CSP | Added YouTube CDN to allowed origins | 2026-03-10 |

---

## What's Working

- Full-stack platform operational: Spring Boot 4 + Next.js 16.1
- Gallery system mature: masonry layout, lightbox, video facade, AI analysis, credit attribution, timeline view, random discovery, gallery map view, R2 storage admin
- YouTube channel sync: admin-triggered sync of @nosilha channel videos into gallery; DB-backed runtime enable/disable toggle; batch deduplication; 8 integration tests; admin UI panel at `/admin/youtube-sync`
- AI admin dashboard with domain-level feature toggles, review queue, batch analysis
- Admin dashboard redesigned with sidebar navigation and 8 moderation queues + YouTube sync page
- Interactive map of Brava Island with zones, trails, 3D terrain, marker clustering, decomposed component architecture
- MDX content platform with Velite processing, Pagefind search, multilingual framework, 5 published articles
- Dynamic OG images via Next.js ImageResponse/Satori (`/api/og` route, 4 template variants)
- Instagram feed section on homepage (bento-grid layout, graceful degradation when token absent)
- CI/CD pipeline with 10 workflows covering security, testing, deployment
- Event-driven backend with Spring Modulith enforced boundaries (12 event types)
- Security: OWASP remediation, HTML sanitizer, rate limiting (Bucket4j), CSP headers tightened
- Frontend performance optimized (Spec 027): ISR cache profiles, image optimization
- Git hooks migrated from Husky to Lefthook
- Design review fixes merged (PR #92): responsive improvements, category-to-icon mapping consolidated
- Content skills consolidated into unified pipeline

## What's Planned

- Spec 03: Design System Compliance — 56 files remaining (48 excluding catalyst-ui)
- Social media integrations — remaining items from roadmap (newsletters, other platforms)
- P0 quick wins: fix content tooling bugs, admin role setup (~3 hrs)
- P1 high impact: language switcher UI, Portuguese translations, admin moderation dashboard, community story submission
- P2 medium impact: Kriolu content, history category articles, user profile enhancement
- API Roadmap: RBAC, i18n, enhanced validation, 80%+ test coverage target

## Recommended Next Actions

1. **Complete Spec 03** (Design System Compliance) — only remaining in-progress spec
2. **Add backend tests** for auth, engagement, stories modules (reduce critical risk; JaCoCo at 5%)
3. **Build language switcher** — unblocks all multilingual content work
4. **Create PT translations** for existing 5 articles (AI-assisted, ~4-6 hrs)
5. **Seed more MDX content** — history category (5 planned articles)
6. **Resolve Issue #86** — tag-based revalidation for FrontendRevalidationService
7. **R2 image compression** — only remaining production issue (oversized uploads)
