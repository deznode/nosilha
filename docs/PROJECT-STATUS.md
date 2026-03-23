# Project Status

**Last Updated:** 2026-03-21
**Branch:** develop | **Commits:** 128 (repo re-initialized 2026-03-02 with squashed history)

---

## Module Maturity

### Backend (apps/api/ — 223 Kotlin files, 13 Flyway migrations, 105 endpoints)

| Module | Files | Endpoints | Tests | Maturity |
|--------|-------|-----------|-------|----------|
| shared | 36 | — | 0 | Production Ready |
| places | 29 | 19 | 1 | Production Ready |
| gallery | 49 | 36 | 11 | Production Ready |
| ai | 27 | 16 | 5 | Production Ready |
| feedback | 23 | 13 | 2 | Tested |
| auth | 18 | 4 | 0 | API Ready |
| engagement | 15 | 6 | 0 | API Ready |
| stories | 24 | 11 | 0 | API Ready |
| config | 1 | — | 1 | Production Ready |

**Maturity scale:** Stub > Domain Started > Service Layer > API Ready > Tested > Production Ready

### Frontend (apps/web/ — ~198 components, 55 pages)

| Area | Count | Maturity |
|------|-------|----------|
| UI components | 61 | Production Ready |
| Admin components | 38 | Production Ready |
| Content components | 15 | Production Ready |
| Gallery components | 17 | Production Ready |
| Landing components | 17 | Production Ready |
| Map components | 9 | Production Ready |
| Zustand stores | 5 | Tested |
| E2E tests (Playwright) | 6 specs | Tested |
| Unit tests (Vitest) | 25 files | Tested |
| MDX articles | 5 published | Production Ready |

### Infrastructure

| Area | Status | Maturity |
|------|--------|----------|
| CI/CD | 10 GitHub Actions workflows (incl. release) | Production Ready |
| Docker | Compose (local) + multi-stage builds | Production Ready |
| Terraform | GCP Cloud Run IaC | Production Ready |
| Security scanning | Trivy + ktlint + ESLint + tfsec + OWASP remediation | Production Ready |
| Git hooks | Lefthook (replaced Husky) | Production Ready |
| Dependabot | Grouped PRs per ecosystem, CI-gated (no auto-merge) | Production Ready |
| Community health | CODEOWNERS, issue templates, PR template | Production Ready |
| Secrets | SOPS + age encryption for .env sharing across machines | Production Ready |

---

## Specification Pipeline

**Source:** `plan/arkhe/specs/` (33 spec directories)

### Complete (31)

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
| 031 | Gallery Video Redesign |
| 032 | Promoted Video Player |

### Complete (no spec directory — implemented via PR)

| Spec | Title | PR |
|------|-------|----|
| — | Design Review Fixes | #92 |

### In Progress (1)

| Spec | Title | Remaining Work |
|------|-------|----------------|
| 03 | Design System Compliance | 38 files use raw color classes (30 excluding catalyst-ui); `bg-white` context review needed |

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
Video:          031 done -> 032 done
```

No critical blockers. Spec 03 (Design System Compliance) is the only active dependency chain.

---

## Coverage Gaps

### By Domain

| Domain | Coverage | Gap |
|--------|----------|-----|
| Gallery & Media | 100% | YouTube sync, video redesign, promoted player all complete; Cloudflare Image Resizing handles delivery |
| Directory & Listings | 100% | — |
| AI Pipeline | 95% | Dashboard + review + moderation complete |
| Map | 95% | Migration + decomposition + gallery map complete; Activity restore stability improved |
| Frontend & UI/UX | ~75% | Mobile optimization (Waves 1-4) complete; Design system compliance sweep (Spec 03) — 38 files remaining |
| Content & Heritage | 20% | 5 published articles (music, people, traditions); history/ and places/ categories empty |
| Multilingual | 0% | Framework built; zero PT/KEA/FR translations live |
| Community & Social | 30% | Suggestions + contact exist; OG images + Instagram feed live; YouTube sync live; no story submission flow |
| Infrastructure | 60% | Dependabot + community health; cold start Phase 1 complete (PR #128); SOPS encryption added |

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

No pending production issues.

### Production Issues (Resolved)

| Issue | Resolution | Date |
|-------|-----------|------|
| Cloudflare Image Resizing not enabled | Enabled manually in Cloudflare dashboard | 2026-03 |
| CSP headers blocking inline scripts | CSP policy tightened, nonce-based exemptions added | 2026-03-10 |
| React hydration mismatches | Fixed client/server rendering inconsistencies | 2026-03-10 |
| Chart rendering failures | Fixed chart component initialization on client | 2026-03-10 |
| YouTube CDN domain not in CSP | Added YouTube CDN to allowed origins | 2026-03-10 |
| Map page freeze on re-navigation | Error boundary + Activity restore crash recovery | 2026-03-12 |

---

## Deployment & Performance

**Reference:** `plan/infrastructure/active/deployment-performance.md`

| Phase | Focus | Status | Key Items |
|-------|-------|--------|-----------|
| 1 | Backend Cold Start Quick Wins | **Complete** | ✅ AppCDS, ✅ Startup CPU Boost, ✅ lazy init, ✅ Terraform fix (PR #128, ADR-0014) |
| 2 | Frontend Performance | Partial | ✅ PPR/cache components, ✅ React Compiler, ✅ mobile space optimization (PR #130); Pending: MapLibre evaluation, static map preview |
| 3 | Edge Distribution | Partial | ✅ Cloudflare CDN + R2, ✅ static asset cache headers; Pending: content page cache headers, Workers evaluation |
| 4 | Backend Migration | Future | Evaluate GraalVM native image or Fly.io Machine Suspend |

**Current pain points:** No edge caching for content pages, 250 kB Mapbox bundle on critical path.
**Resolved:** Backend cold starts reduced from 10–20s to 2–4s (Phase 1 complete).
**Target:** Sub-100ms TTFB on cached pages (Phase 2+3).

---

## What's Working

- Full-stack platform operational: Spring Boot 4 + Next.js 16.1
- Gallery system mature: masonry layout, improved lightbox, cinematic video redesign with promoted player, AI analysis, credit attribution, timeline view, random discovery, gallery map view, R2 storage admin
- YouTube channel sync: multi-playlist persistence with one-click sync; DB-backed runtime enable/disable toggle; batch deduplication; 10 integration tests; admin UI panel at `/admin/youtube-sync`
- AI admin dashboard with domain-level feature toggles, review queue, batch analysis
- Admin dashboard redesigned with sidebar navigation and 8 moderation queues + YouTube sync page
- Interactive map of Brava Island with zones, trails, 3D terrain, marker clustering, decomposed component architecture, Activity restore error boundary
- MDX content platform with Velite processing, Pagefind search, multilingual framework, 5 published articles
- Dynamic OG images via Next.js ImageResponse/Satori (`/api/og` route, 4 template variants, SVG logo, dev-tools preview page)
- Featured heritage landing section on homepage
- Instagram feed section on homepage (bento-grid layout, graceful degradation when token absent)
- CI/CD pipeline with 10 workflows covering security, testing, deployment; Dependabot with grouped PRs and CI gating
- Community health: CODEOWNERS, issue templates (bug report, feature request), PR template
- Event-driven backend with Spring Modulith enforced boundaries (12 event types)
- Security: OWASP remediation, HTML sanitizer, rate limiting (Bucket4j), CSP headers tightened
- Frontend performance optimized (Spec 027): ISR cache profiles, image optimization
- Git hooks migrated from Husky to Lefthook
- Design review fixes merged (PR #92): responsive improvements, category-to-icon mapping consolidated
- Content skills consolidated into unified pipeline
- Mobile space optimization (PR #130): collapsible hero, filter bottom sheet, scroll-aware nav hiding, 4 new UI components + 3 hooks
- Backend cold start reduced from 10–20s to 2–4s (PR #128): AppCDS, Startup CPU Boost, lazy init
- Gallery video redesign (Specs 031+032): cinematic featured hero, compact 3-column grid, promote-to-hero pattern with URL state
- SOPS + age encryption for secure .env sharing across machines
- Photo detail page moved to immersive route group for full-screen experience

## What's Planned

- Spec 03: Design System Compliance — 38 files remaining (30 excluding catalyst-ui)
- Social media integrations — remaining items from roadmap (newsletters, other platforms)
- P0 quick wins: fix content tooling bugs, admin role setup (~3 hrs)
- P1 high impact: language switcher UI, Portuguese translations, admin moderation dashboard, community story submission
- P2 medium impact: Kriolu content, history category articles, user profile enhancement
- Deployment & performance optimization — Phase 2 MapLibre evaluation, Phase 3 edge caching
- API Roadmap: RBAC, i18n, enhanced validation, 80%+ test coverage target

## Recommended Next Actions

1. **Complete Spec 03** (Design System Compliance) — only remaining in-progress spec
2. **Add backend tests** for auth, engagement, stories modules (reduce critical risk; JaCoCo at 5%)
3. **Implement RBAC** — `@EnableMethodSecurity` + `@PreAuthorize` on admin controllers (security gap)
4. **Build language switcher** — unblocks all multilingual content work
5. **Create PT translations** for existing 5 articles (AI-assisted, ~4-6 hrs)
6. **Seed more MDX content** — history category (5 planned articles)
7. **Resolve Issue #86** — tag-based revalidation for FrontendRevalidationService
8. **Evaluate MapLibre** — replace Mapbox to remove licensing cost + 250 kB from critical path
