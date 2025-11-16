# Storybook Expansion Plan

This document tracks the components we are documenting inside the `frontend` Storybook catalog.

## 1. Goals
- Capture culturally significant UI treatments with interactive documentation.
- Mirror production states (loading, error, empty) so Chromatic has visual coverage.
- Follow the `@storybook/nextjs-vite` CSF3 pattern that already exists in `src/stories/*`.

## 2. Implementation Notes
- Always colocate mock data inside each story file rather than importing from runtime hooks.
- Prefer semantic backgrounds/layout decorators that match how the component appears on real pages.
- Use local `/images/**` assets when rendering `next/image` so they respect the remote pattern in `next.config.ts`.

## 3. UI Component Priorities
| Priority | Component | Location | Storybook States |
|----------|-----------|----------|------------------|
| High     | Banner | `src/components/ui/banner.tsx` | Default, no link, persistent alert, tourism advisory |
| High     | ActionToast | `src/components/ui/action-toast.tsx` | Success, error, hidden |
| High     | BackToTopButton | `src/components/ui/back-to-top-button.tsx` | Default scroll helper |
| High     | ImageGallery | `src/components/ui/image-gallery.tsx` | Default grid, empty state, extended gallery |
| High     | NewsletterSignup | `src/components/ui/newsletter.tsx` | Full-width newsletter hero |

All high-priority components now have dedicated stories in `src/stories/` following the structure described above.
