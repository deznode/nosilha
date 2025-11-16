# Storybook Review Fix Plan

This document captures each issue discovered in the `codex/create-storybook-for-high-priority-components` branch and the concrete steps we need to take to resolve them. Follow the numbered sub-tasks in order so we can land fixes with full context.

## 1. Supabase stub still fails in production Storybook builds
- **Problem**: `frontend/src/lib/supabase-client.ts:21-35` now falls back to a stub only when `NODE_ENV !== "production"`. Chromatic and `npm run build-storybook` both run with `NODE_ENV=production`, so builds without `NEXT_PUBLIC_SUPABASE_*` still throw before Storybook can render (contradicts the Storybook availability goal described in `frontend/storybook_plan.md`).
- **Steps**:
  1. Introduce an explicit guard (e.g., check `process.env.STORYBOOK` or `process.env.NEXT_PUBLIC_SUPABASE_STUB === "true"`) that allows the stub in production Storybook/Chromatic builds.
  2. Document the new env flag in `docs/TROUBLESHOOTING.md` and `.storybook` README so contributors know how to run Storybook without Supabase secrets.
  3. Add a minimal Vitest smoke test around `getClient()` that simulates `process.env.NODE_ENV="production"` with the stub flag enabled to prevent regressions.

## 2. Banner high-contrast mode breaks WCAG contrast rules
- **Problem**: `frontend/src/components/ui/banner.tsx:51-114` now accepts `tone="high-contrast"`, but the dismiss icon (`XMarkIcon`) and anchor hover state still use the default gray tokens (`text-gray-900` / `hover:text-gray-600`). On a black background this drops contrast well below the AA ratios required in `docs/DESIGN_SYSTEM.md#dark-mode-best-practices`.
- **Steps**:
  1. Update the dismiss button and anchor classes to switch to semantic high-contrast tokens (e.g., `text-white` / `hover:text-valley-green`) when `tone === "high-contrast"`.
  2. Add Storybook controls (argTypes) for `tone` so we can visually verify the accessible states via Chromatic.
  3. Run Storybook’s a11y addon on the Banner stories to confirm contrast warnings disappear.

## 3. MapFilterControl stories leak Zustand state between stories
- **Problem**: `frontend/src/stories/MapFilterControl.stories.tsx:7-65` mutates the global `useFilterStore` in a decorator without resetting it. Because Zustand stores are singletons (see `docs/STATE_MANAGEMENT.md`, “Zustand: Client State Management”), any interaction or story that sets `selectedCategories` will persist into the next story/Chromatic snapshot, leading to flaky visual baselines.
- **Steps**:
  1. Extend `FilterStateProvider` with a cleanup function that restores the store’s default `selectedCategories` whenever a story unmounts (and also handles the “no overrides” case).
  2. Add an explicit `Default` story arg (`__selectedCategories: ["Restaurant","Hotel","Beach","Landmark"]`) so Chromatic renders are deterministic even if cleanup is skipped.
  3. Write a small Storybook interaction test (in the `KeyboardNavigation` story’s `play` function or a dedicated Vitest) that asserts state resets when stories change.

## 4. Header stories render without a mocked Next.js router
- **Problem**: `frontend/src/stories/Header.stories.tsx` renders `<Header />` directly, but the component depends on `useRouter` / `usePathname` from `next/navigation` (`frontend/src/components/ui/header.tsx:16-73`). Outside the App Router these hooks throw the same invariant described in `docs/TESTING.md` (“Mock Next.js Router”), so Storybook/Chromatic cannot render the Header stories yet.
- **Steps**:
  1. Add a Storybook-level mock/decorator for `next/navigation` (similar to the Vitest setup) so `useRouter` / `usePathname` return predictable values during stories.
  2. Verify that navigation highlighting (active tab) respects the mocked pathname across each story variant.
  3. Capture a Chromatic run to ensure the Header stories now render without throwing runtime errors.
