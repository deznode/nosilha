# Mobile Space Audit — Nos Ilha

> **Date**: 2026-03-16
> **Scope**: All user-facing pages, mobile viewport optimization
> **Viewport reference**: iPhone 14 (390x844), iPhone SE (390x667)

## Fixed Chrome Budget (all pages)

| Element | Height | Notes |
|---------|--------|-------|
| StickyNav | 64px | `fixed top-0 z-50` |
| MobileBottomNav | 56px + safe area (~14px) | `fixed bottom-0`, hidden on detail pages |
| Main layout `pt-16 pb-16` | Compensating padding | Correct for fixed nav |
| **Total reserved** | **~134px** | On 844px viewport: **710px usable** |

## Current State — Space Before Content

| Page | Space consumed | Viewport % (844px) | Viewport % (667px) |
|------|---------------|---------------------|---------------------|
| Directory | ~658px | 78% | 99% (zero content visible) |
| History | ~770px | 91% | 115% (below fold) |
| Gallery | ~524px | 62% | 79% |
| Contribute | ~440px | 52% | 66% |
| Stories | ~430px | 51% | 64% |
| About | ~370px | 44% | 55% |
| People | ~310px | 37% | 46% |

**Industry benchmark**: Leading apps (Airbnb, Yelp, Google Maps) show first content within 120-180px of top chrome on mobile.

---

## All Issues Found

### A. Shared / Global (affects multiple pages)

| # | Issue | File | Current | Impact |
|---|-------|------|---------|--------|
| A1 | `PageHeader` has `mb-12` (48px) on all viewports | `page-header.tsx:54` | `mb-12` | ~32px wasted on mobile (affects 7+ pages) |
| A2 | `PageHeader` defaults `centered={true}` — causes multi-line reflow on mobile for long subtitles | `page-header.tsx:46` | `centered = true` | Subtitles wrap to 3-4 lines vs 2 left-aligned |
| A3 | Content `Section` component uses `mt-16` (64px) unconditionally | `section.tsx:11-14` | All variants have `mt-16` | Generous spacing between sections on mobile |
| A4 | `py-16` container padding used on 6+ pages (People, About, Contribute, Settings, History, Contact) | various | `py-16` = 128px total | 64px+ could be reclaimed per page |
| A5 | Main layout `pb-16` overestimates bottom nav height by ~6px | `(main)/layout.tsx:33` | `pb-16` (64px) vs actual 56px + safe area | Minor, ~6px |

### B. Directory Page (`/directory`, `/directory/[category]`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| B1 | Header wrapper `py-8` | `directory-category-page-content.tsx:194` | `py-8` (64px total) | 32px saveable |
| B2 | PageHeader `mb-12` inside header + wrapping gap | inherited from PageHeader | 48px bottom margin | Covered by A1 |
| B3 | "Add Location" button full-width on mobile header | `:197-203` | Full row with text + icon | ~44px row |
| B4 | Subtitle text always visible | `:183-186` | Always shown | ~48-60px (3+ lines mobile) |
| B5 | FilterToolbar — search row + filters wrap to 2+ rows | `filter-toolbar.tsx:59-143` | `flex-wrap` causes stacking | ~228px total |
| B6 | FilterToolbar — secondary "Showing X / View on Map" row | `:129-141` | Separate `border-t mt-4 pt-3` row | ~36px |
| B7 | FilterToolbar `py-4` generous vertical padding | `:60` | `py-4` (32px total) | ~16px saveable |

**Total before first card: ~658px** (78% of viewport)

### C. Gallery Page (`/gallery`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| C1 | Dark header `py-8` on mobile | `gallery-content.tsx:360` | `py-8 sm:py-16` | 32px saveable on mobile |
| C2 | Description paragraph always visible | `:366-369` | Always shown | ~54px (3 lines) |
| C3 | Contributor count line always visible | `:370-378` | Always shown | ~20px |
| C4 | Button row takes full width | `:380-399` | Two buttons side by side | ~44px |
| C5 | Tabs bar + view toggle generous height | `:406-481` | `py-4` padding | ~75px total |
| C6 | Search bar below tabs, not in sticky zone | `:484-506` | Separate `mb-6` block | ~48px, not sticky |
| C7 | Featured Photo Card before actual grid | `:543-548` | Always shown when available | ~200px+ |
| C8 | Weekly Discovery section before grid | `:551-553` | Always shown when 3+ photos | ~150px+ |
| C9 | Era + Category filter bar before grid | `:556-598` | Inline dropdowns | ~48px |

**Total before first photo: ~524px+** (62%+ of viewport)

### D. Stories Page (`/stories`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| D1 | Header wrapper `py-12` | `stories/page.tsx:54` | `py-12` (96px total) | 48px saveable |
| D2 | Title `mb-4` plus `text-3xl` generous | `:57-59` | `mb-4`, `text-3xl` | Okay individually |
| D3 | Description paragraph `text-lg` | `:60-64` | Always visible, `text-lg` | ~54px |
| D4 | "Share Your Story" CTA in header | `:66-72` | Full button row | ~44px |
| D5 | Content area `py-12` top padding | `:78` | `py-12` (48px top) | 24px saveable |

**Total before first card: ~430px** (51% of viewport)

### E. People Page (`/people`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| E1 | Container `py-16` | `people/page.tsx:19` | `py-16` (128px total) | 64px saveable |
| E2 | PageHeader mb-12 | inherited | Covered by A1 | |

**Total before first person card: ~310px** (37%)

### F. About Page (`/about`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| F1 | Container `py-16` | `about-page-content.tsx:14` | `py-16` (128px total) | 64px saveable |
| F2 | PageHeader centered long subtitle | `:15-17` | Long subtitle wraps heavily | ~80px |
| F3 | Hero card section `mt-16 p-8` | `:26` | 64px gap + 32px padding | 48px saveable on mobile |

**Total before hero card: ~370px** (44%)

### G. Contribute Page (`/contribute`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| G1 | Container `py-16` | `contribute-page-content.tsx:27` | `py-16` (128px total) | 64px saveable |
| G2 | PageHeader centered long subtitle | `:28-30` | Long subtitle | ~80px |
| G3 | Heart icon hero `mt-16 p-8` | `:34-52` | 64px gap + 32px padding + icon | ~200px |

**Total before contribution cards: ~440px** (52%)

### H. Contribute/Media Page (`/contribute/media`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| H1 | Container `py-20` (80px top) | `contribute/media/page.tsx:255` | `py-20` | 40px saveable |
| H2 | Pink header `px-10 py-10` | `:266` | `py-10` (80px total) | 40px saveable |
| H3 | Form `p-10` inner padding | `:273` | `p-10` (40px all sides) | 16px saveable per side |

### I. Settings Page (`/settings`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| I1 | Container `py-16` | `settings/page.tsx:149` | `py-16` | 64px saveable |
| I2 | `mt-12` gap before settings card | `:155` | `mt-12` | 24px saveable |

### J. History Page (`/history`)

| # | Issue | File:Line | Current | Mobile Space Cost |
|---|-------|-----------|---------|-------------------|
| J1 | ImageHeroSection `h-[65vh]` = ~549px on 844px | `history/page.tsx:131-134` | `h-[65vh]` | ~549px — entire viewport |
| J2 | Content below hero `py-16` | `:139` | `py-16` | 64px top padding |
| J3 | PageHeader below hero + mb-12 | `:140-143` | Title + subtitle + accent | ~160px |

**Total before prose content: ~770px+** (91% of viewport)

### K. Directory Entry Detail (`/directory/[category]/[slug]`)

| # | Issue | File | Current | Mobile Space Cost |
|---|-------|------|---------|-------------------|
| K1 | Parallax hero `h-[60vh]` | `directory-entry-detail-page-content.tsx` | `h-[60vh] min-h-[400px]` | ~506px |
| K2 | Content area `py-10` | same | `px-4 py-10` | 40px top |

**Total before content: ~546px** (65%)

---

## Categorized Improvements

### Quick Wins (Tailwind class changes, <5 lines each) — DONE 2026-03-16

All quick wins implemented and verified via Playwright on iPhone SE (390x667) viewport.

| # | Change | Files | Space Saved | Status |
|---|--------|-------|-------------|--------|
| QW1 | `PageHeader` `mb-12` → `mb-4 sm:mb-12` | `page-header.tsx` | 32px on 7+ pages | Done |
| QW2 | Stories header: `py-12` → `py-5 sm:py-12` | `stories/page.tsx` | 56px | Done |
| QW3 | Stories content: `py-12` → `py-6 sm:py-12` | `stories/page.tsx` | 24px | Done |
| QW4 | Directory header: `py-8` → `py-4 sm:py-8` | `directory-category-page-content.tsx` | 32px | Done |
| QW5 | Gallery header: `py-8` → `py-4 sm:py-8` | `gallery-content.tsx` | 32px | Already done |
| QW6 | Gallery: hide description on mobile `hidden sm:block` | `gallery-content.tsx` | 54px | Done |
| QW7 | Gallery: hide contributor count on mobile `hidden sm:block` | `gallery-content.tsx` | 20px | Done |
| QW8 | People: `py-16` → `py-8 sm:py-16` | `people/page.tsx` | 64px | Done |
| QW9 | About: `py-16` → `py-8 sm:py-16` | `about-page-content.tsx` | 64px | Done |
| QW10 | Contribute: `py-16` → `py-8 sm:py-16` | `contribute-page-content.tsx` | 64px | Done |
| QW11 | Settings: `py-16` → `py-8 sm:py-16` (3 occurrences) | `settings/page.tsx` | 64px | Done |
| QW12 | Settings: `mt-12` → `mt-6 sm:mt-12` | `settings/page.tsx` | 24px | Done |
| QW13 | History content: `py-16` → `py-8 sm:py-16` | `history/page.tsx` | 64px | Done |
| QW14 | Directory: hide subtitle on mobile via `subtitleClassName` | `directory-category-page-content.tsx`, `page-header.tsx` | ~60px | Done |
| QW15 | FilterToolbar: `py-4` → `py-2 sm:py-4` | `filter-toolbar.tsx` | 16px | Done |
| QW16 | Contribute/media: `py-20` → `py-10 sm:py-20` | `contribute/media/page.tsx` | 40px | Done |
| QW17 | Contribute/media header: `py-10` → `py-6 sm:py-10` | `contribute/media/page.tsx` | 32px | Done |
| QW18 | Contribute/media form: `p-10` → `p-6 sm:p-10` | `contribute/media/page.tsx` | 32px | Done |
| QW19 | Section component: `mt-16` → `mt-8 sm:mt-16` | `section.tsx` | 32px per section | Done |
| QW20 | About/Contribute hero cards: `mt-16` → `mt-8 sm:mt-16` | `about-page-content.tsx`, `contribute-page-content.tsx` | 32px each | Done |
| QW21 | Stories: `text-center sm:text-left` → `text-left` (prevent text reflow) | `stories/page.tsx` | ~24px | Done |

**Combined: ~400-500px reclaimed across pages with ~25 lines of Tailwind changes.**

**Note**: QW14 added a `subtitleClassName` prop to `PageHeader` (instead of a raw 1-line change) to keep the component API clean for future per-page subtitle overrides. This also partially addresses M8.

### Medium Improvements (component-level refactoring) — M1, M2, M4, M6, M7 DONE 2026-03-16

| # | Change | Files | Space Saved | Status |
|---|--------|-------|-------------|--------|
| M1 | Directory "Add Location" → icon-only on mobile (`hidden sm:inline`) | `directory-category-page-content.tsx` | 44px | Done |
| M2 | Gallery "Add to Archive" → icon-only on mobile (matches "Surprise Me" pattern) | `gallery-content.tsx` | ~20px | Done |
| M3 | Gallery: integrate search into sticky tabs bar | `gallery-content.tsx` | ~48px (removes separate block) | Open |
| M4 | Gallery: suppress FeaturedPhoto + WeeklyDiscovery when filters active | `gallery-content.tsx` | ~350px when filtering | Done |
| M5 | FilterToolbar: merge "Showing X / View on Map" into search row | `filter-toolbar.tsx` | 36px | Open |
| M6 | History: reduce hero to `h-[45vh] sm:h-[65vh]` on mobile | `history/page.tsx` | ~130px | Done |
| M7 | Directory detail: reduce parallax hero to `h-[45vh] sm:h-[60vh]` on mobile | `directory-entry-detail-page-content.tsx` | ~130px | Done |
| M8 | `PageHeader` accept `className` prop for responsive `mb-*` override per-page | `page-header.tsx` | Flexibility | Partially done (subtitleClassName added in QW14) |

### Larger Improvements (new patterns/components)

| # | Change | Files | Impact | Effort |
|---|--------|-------|--------|--------|
| L1 | FilterToolbar redesign: single-row chip bar + "Filters" bottom sheet on mobile | `filter-toolbar.tsx` + new bottom sheet component | ~130px saved | New component |
| L2 | Hide-on-scroll-down header pattern (`useScrollDirection` hook) for Directory/Gallery | New hook + header wrapper | Headers fully hidden after scroll | Medium (new hook) |
| L3 | Collapsing hero pattern: hero shrinks to compact bar on scroll (title + back button) | New component pattern | Detail pages content visible faster | Medium-large |
| L4 | Gallery: move filters into sticky tab bar as horizontal scrollable chips | `gallery-content.tsx` | ~48px + better UX | Medium refactor |
| L5 | Responsive `PageHeader` variant: compact mode for mobile (smaller text, no accent bar, tighter spacing) | `page-header.tsx` | ~60px per page | Small-medium |

---

## Research References

- **Baymard Institute**: 78% of users fail to find search when below fold on mobile
- **NN/g (Nielsen Norman Group)**: Best mobile headers are bidirectional — hide on scroll-down, reappear on scroll-up
- **Pencil & Paper UX**: Multi-row inline filter toolbars are "the pattern most likely to be abandoned by users"
- **Industry benchmarks**: Airbnb shows first listing at ~120px from top; Yelp uses 44px chip row; Google Maps uses no page header

## Priority Order

1. ~~**Quick wins QW1-QW21** — ~25 lines, ~400-500px total improvement, zero risk~~ **DONE 2026-03-16**
2. ~~**M4** (suppress gallery editorial content when filtering) — 4 lines, massive impact~~ **DONE 2026-03-16**
3. ~~**M1/M2** (icon-only CTAs on mobile) — small changes, good space savings~~ **DONE 2026-03-16**
4. ~~**M6/M7** (reduce hero heights on mobile) — big visual impact~~ **DONE 2026-03-16**
5. **L1** (FilterToolbar bottom sheet) — biggest single improvement for Directory UX
6. **L2** (hide-on-scroll headers) — universal improvement across browsing pages
