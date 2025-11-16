# Storybook Coverage Plan

This document inventories every component, primitive, and page in the Nos Ilha frontend that requires Storybook documentation. Existing stories are noted so we can focus on gaps. All work must align with the semantic tokens and motion guidance in `../docs/DESIGN_SYSTEM.md`, and follow the architecture described in `../docs/ARCHITECTURE.md`.

## 1. Catalyst UI Primitives

| Component | Story Exists? | Required States / Notes |
| --- | --- | --- |
| `catalyst-ui/button.tsx` | ✓ (`CatalystButton.stories.tsx`) | Add disabled, loading, destructive, ghost variants w/ focus rings. |
| `catalyst-ui/input.tsx`, `textarea.tsx` | ✗ | Default/error/disabled states, helper text, dark-mode sample. |
| `catalyst-ui/checkbox.tsx`, `radio.tsx`, `switch.tsx` | ✗ | Checked/unchecked, focus outlines, grouped field examples. |
| `catalyst-ui/fieldset.tsx`, `description-list.tsx` | ✗ | Show labeled control groups with validation messaging. |
| `catalyst-ui/dialog.tsx`, `dropdown.tsx`, `listbox.tsx`, `select.tsx` | ✗ | Open/closed states, keyboard navigation, mobile viewports. |
| `catalyst-ui/navbar.tsx`, `sidebar(-layout).tsx`, `stacked-layout.tsx` | ✗ | Layout templates at desktop/tablet breakpoints. |
| `catalyst-ui/alert.tsx`, `badge.tsx`, `pagination.tsx` | ✗ | All semantic colors from design system; include accessibility notes. |

## 2. Providers & Utilities

| Component | Story Exists? | Required States / Notes |
| --- | --- | --- |
| `components/providers/auth-provider.tsx` | ✗ | MDX documentation showing how to wrap stories with mock sessions (guest vs authenticated vs admin). |
| `components/providers/query-provider.tsx` | ✗ | MDX snippet showing integration with TanStack Query devtools disabled. |
| `components/ui/page-transition.tsx`, `animated-button.tsx` | ✗ | Motion demos, with reminder to respect `prefers-reduced-motion`. |

## 3. UI Components (High Priority)

| Component | Story Exists? | Required Scenarios |
| --- | --- | --- |
| `ui/header.tsx` | ✗ | Guest, logged-in user, admin (Add Entry button), mobile menu open/closed. |
| `ui/footer.tsx` | ✓ | Add dark-mode and translated copy variants. |
| `ui/banner.tsx` | ✓ | Add high-contrast accessibility story. |
| `ui/directory-card.tsx` | ✓ | Expand to show Restaurant, Hotel, Beach, Landmark variants; include skeleton counterpart. |
| `ui/directory-card-skeleton.tsx`, `directory-grid-skeleton.tsx` | ✗ | Loading states for light/dark themes. |
| `ui/interactive-map.tsx` | ✗ | Static screenshot story with mock data; separate error and empty states. |
| `ui/map-filter-control.tsx`, `photo-gallery-filter.tsx` | ✗ | Selected filters, keyboard navigation. |
| `ui/content-action-toolbar/*` | ✗ | Desktop vs mobile FAB, guest vs authenticated, reaction rate-limit banner, API error toast. |
| `ui/actions/*` (`reaction-buttons`, `share-button`, `copy-link-button`, `suggest-improvement-form`) | ✗ | Each component standalone with success/error handlers mocked. |
| `ui/culture-flyout-menu.tsx` | ✗ | Hover/focus states, keyboard traversal. |
| `ui/back-to-top-button.tsx`, `theme-toggle.tsx` | ✗ | Idle, focus, active states. |
| `ui/image-gallery.tsx`, `image-lightbox.tsx`, `gallery-image-grid.tsx` | ✗ | Multi-image sets, captions, empty fallback. |
| `ui/related-content.tsx` | ✗ | With recommendations vs fallback message. |
| `ui/contribute-photos-section.tsx`, `citation-section.tsx`, `print-page-wrapper.tsx` | ✗ | Include print-preview decorator example. |
| `ui/newsletter.tsx` | ✓ | Add submission success/error states. |
| `ui/social-media-links.tsx` | ✗ | Compact vs default layout, accessible labels. |
| `ui/video-hero-section.tsx`, `image-with-courtesy.tsx`, `category-marker-icon.tsx` | ✗ | Show different media aspect ratios. |

## 4. Auth & Admin Components

| Component | Story Exists? | Required Scenarios |
| --- | --- | --- |
| `auth/login-form.tsx` | ✗ | Idle state, validation errors, submitting, Supabase error toast. |
| `auth/signup-form.tsx` | ✗ | Same coverage as login, plus password mismatch handling. |
| `admin/add-entry-form.tsx` | ✗ | Valid submission, field-level validation errors, image upload failure. |

## 5. Page / Route Assemblies

| Route | Story Exists? | Required Scenarios |
| --- | --- | --- |
| `(main)/page.tsx` (Home) | ✗ | Default data, fallback when `getEntriesByCategory` returns empty, newsletter CTA focus. |
| `(main)/directory/[category]/page.tsx` | ✗ | Category results, empty-state message, loading skeleton. |
| `(main)/directory/entry/[slug]/page.tsx` | ✗ | Full data (gallery, related content, toolbar) vs minimal entry with no media. |
| `(main)/map/page.tsx` | ✗ | Dynamic import skeleton and map ready state. |
| `(main)/history`, `(main)/people`, `(main)/media/photos/[galleryId]` | ✗ | Content layout variants, citation blocks, action toolbar combos. |
| `(auth)/login`, `(auth)/signup` | ✗ | Page wrappers including `PageHeader`. |
| `(admin)/add-entry/page.tsx` | ✗ | Authenticated view vs redirect banner for unauthenticated visitors. |

## 6. Implementation Checklist

1. **Decorators:** Update `.storybook/preview.ts` to wrap stories with `AuthProvider`, `QueryProvider`, and a layout container. Provide knobs for switching user roles.
2. **Data Fixtures:** Reuse mock JSON from `src/lib/__test_mocks__` and Storybook controls to vary entries/towns without API calls.
3. **Accessibility:** Enable `@storybook/addon-a11y` in test mode and fix violations before promoting to CI failure mode.
4. **CI / Chromatic:** Once coverage improves, run `npm run build-storybook` and upload to Chromatic (or similar) per release.
5. **Tracking:** As stories land, mark entries above as complete so the plan stays accurate for new contributors.
