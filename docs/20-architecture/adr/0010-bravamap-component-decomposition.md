# ADR 0010: BravaMap Component Decomposition and State Management

- **Status**: Proposed
- **Date**: 2026-02-23
- **Decision-makers**: @jcosta

## Prerequisites

The legacy `InteractiveMap.tsx` component and its dependencies (`MapFilterControl.tsx`, `CategoryMarkerIcon.tsx`, `features/map/types/index.ts`) were removed prior to this work. The map-specific state in `filterStore.ts` (`selectedCategories`, `toggleCategory`, `setSelectedCategories`) was also removed since it was only consumed by InteractiveMap.

## Context and Problem Statement

`BravaMap.tsx` is a 1,454-line client component containing 17 `useState` hooks, 12 `useCallback` handlers, 5 `useEffect` hooks, 4 `useMemo` computations, and 7 distinct JSX sections rendered in one function. All state lives in a single scope, making individual sections impossible to test in isolation, making render performance analysis opaque, and making the file increasingly difficult to navigate as new map features land.

The component was ported as a monolith during the BravaMap migration (spec 023) to keep the initial PR focused on integration correctness. Three code-quality deviations from project convention were also deferred: the component bypasses the validated `env.ts` module by reading `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!` directly, it uses bare `<img>` elements where the project convention requires `next/image`, and `map/page.tsx` carries an unnecessary `"use client"` directive.

How should the state and rendering responsibilities of `BravaMap` be reorganised to enable isolated testing and future iteration?

## Decision Drivers

- **Testability**: state clusters and individual UI sections must be unit-testable without mounting the entire Mapbox canvas
- **Maintainability**: a contributor should be able to find and change orbit animation logic without scrolling past the sidebar and the controls overlay
- **Convention adherence**: the solution should follow existing store, component, and image patterns so there is no special case to explain
- **Incremental delivery**: the refactor can land as a single focused PR without requiring simultaneous backend changes
- **Low ceremony**: the project is solo-maintained; solutions that add layers (slice managers, immer middleware) without tangible benefit are not warranted

## Considered Options

1. Zustand store for shared state plus component extraction into `features/map/components/`
2. Custom hooks encapsulating each state cluster plus component extraction (feature-local, no global store)
3. Zustand store with slices pattern plus component extraction (hybrid)

## Decision Outcome

**Chosen option**: Option 1 — Zustand store (`src/stores/mapStore.ts`) for cross-component shared state, with local `useState` retained for component-lifecycle state, and each of the seven JSX sections extracted to its own file under `features/map/components/`.

This option fits because every other feature in the project uses a centralised Zustand store in `src/stores/` with the `create<T>()(devtools(...))` pattern and individual selector exports. Adopting the same structure for map state keeps a single canonical place to look for application state regardless of which feature owns it. It also makes cross-cutting handlers like `handleFlyTo` — which touches selection, orbit, and pulse state simultaneously — trivial to express as store setters called together from a single callback.

### Proposed Component Structure

```
features/map/components/
├── BravaMap.tsx            — root orchestrator, composes all sections
├── MapHeader.tsx           — logo bar + mobile sidebar toggle button
├── MapSidebar.tsx          — search input, CategoryPill row, LocationCard list
├── MapCanvas.tsx           — <Map> with Sources, Layers, NavigationControl, GeolocateControl
│                             (error overlay, loading overlay, skip-intro button live here)
├── MapControls.tsx         — right-side control column (random fly-to, view mode, layers, orbit, 3D, reset)
├── LocationBottomSheet.tsx — mobile slide-up sheet for selected location
├── LocationDetailCard.tsx  — desktop detail card for selected location
├── CategoryPill.tsx        — (promoted from inline sub-component)
└── LocationCard.tsx        — (promoted from inline sub-component)
```

### State Distribution

The new `mapStore.ts` (in `src/stores/`) owns state that flows between two or more extracted components:

| State | Type | Rationale |
|---|---|---|
| `locations` | `Location[]` | Read by MapSidebar and MapCanvas |
| `selectedLocation` | `Location \| null` | Read by MapSidebar, MapCanvas, MapControls, LocationBottomSheet, LocationDetailCard |
| `activeCategory` | `CategoryType` | Read by MapSidebar (pills) and MapCanvas (filtered markers) |
| `searchQuery` | `string` | Read by MapSidebar (input) and MapCanvas (filtered markers) |
| `layerVisibility` | `LayerVisibility` | Read by MapCanvas and MapControls |
| `viewMode` | `ViewMode` | Read by MapCanvas and MapControls |
| `is3D` | `boolean` | Read by MapCanvas and MapControls |
| `isOrbiting` | `boolean` | Read by MapCanvas and MapControls |
| `showSidebar` | `boolean` | Read by MapHeader, MapSidebar, MapCanvas (offset calculation) |
| `isPulsing` | `boolean` | Read by MapCanvas marker rendering |

State that belongs to the lifecycle of a single component stays local:

| State | Owner | Rationale |
|---|---|---|
| `isMapLoaded` | MapCanvas | Only MapCanvas reads and writes it |
| `mapError` | MapCanvas | Only MapCanvas reads and writes it |
| `isIntroPlaying` / `isIntroComplete` | MapCanvas | Cinematic intro is an internal MapCanvas concern |
| `zoom` / `bounds` | MapCanvas | Supercluster inputs, never consumed outside canvas |
| `cursor` | MapCanvas | CSS cursor, purely canvas-internal |

Cross-cutting handlers become store actions (`setSelectedLocation`, `setActiveCategory`, etc.). Handlers that require the imperative Mapbox `MapRef` (e.g., `handleFlyTo`, orbit animation) remain as local callbacks in `MapCanvas` since the map instance is not serialisable into a store.

### Code Quality Fixes Bundled in This Work

- Replace `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!` with `env.mapboxAccessToken` from `@/lib/env` in `MapCanvas.tsx`
- Replace `<img>` in `LocationCard.tsx`, `LocationBottomSheet.tsx`, and `LocationDetailCard.tsx` with `next/image` using `fill` + `sizes` per component-patterns convention
- Remove `"use client"` from `apps/web/src/app/(main)/map/page.tsx` — the page uses `dynamic(..., { ssr: false })` which handles the client boundary correctly
- Add TODO comments for `ENABLE_ILLUSTRATION_MODE = false` and `namePortuguese: entry.name` referencing future work

### Consequences

**Positive**:
- `BravaMap.tsx` reduces to an orchestrator that composes extracted components and provides the `mapRef`; no business logic lives there
- Individual sections (e.g., `MapControls.tsx`, `LocationDetailCard.tsx`) can be tested with shallow renders against mock store state
- `mapStore.ts` devtools name appears in Redux DevTools alongside the other four stores, giving full visibility into map state transitions
- Code-quality deviations (`<img>`, `env.*`, `"use client"`) are corrected during extraction

**Negative**:
- `mapStore.ts` is a comparatively large store (10+ state fields) relative to the other four stores; this is acceptable given the nature of an interactive map
- Handlers that require `MapRef` cannot move into the store and must remain as callbacks in `MapCanvas`; child components receive them via props, which re-introduces a small amount of prop passing
- The migration touches many files simultaneously, increasing review surface

### Out of Scope

- Converting `getEntriesForMap()` to a TanStack Query hook — separate, low-priority improvement
- E2E test updates — revisited in a follow-up PR once the component structure is stable
- Permissions-Policy geolocation header fix — separate infrastructure task

## Pros and Cons of the Options

### Option 1: Zustand store + component extraction (centralized)

- Good, because matches the `create<T>()(devtools(...))` pattern used by all four existing stores
- Good, because `src/stores/` is the canonical location for shared state
- Good, because cross-cutting actions like `handleFlyTo` touching selection + orbit + pulse can be expressed as store setters called from a single callback
- Good, because selector exports (`useSelectedLocation`, `useActiveCategory`, etc.) prevent unnecessary re-renders, matching `filterStore.ts` and `uiStore.ts`
- Bad, because a single store file will be longer than the other four; acceptable given feature complexity

### Option 2: Custom hooks + component extraction (feature-local)

- Good, because state is co-located with the features that own it
- Good, because hooks like `useCinematicIntro()` have clear, testable interfaces
- Bad, because cross-cutting handlers (e.g., `handleFlyTo` writes to selection, orbit, and pulse) become awkward — they cannot live in any single hook without importing from several others
- Bad, because the project has no precedent for feature-local hooks that manage state shared across sibling components
- Bad, because state is not visible in DevTools without additional tooling

### Option 3: Zustand store with slices (hybrid)

- Good, because logical slices (filter, camera, UI) map cleanly to state clusters
- Good, because slices are a well-established Zustand pattern
- Bad, because slices are not used anywhere else in the project; introducing them for a single store creates a two-tier convention
- Bad, because the convention divergence cost is not justified when Option 1 already achieves the goal through clear type and action naming

## More Information

### Proposed store shape

```typescript
// src/stores/mapStore.ts
interface MapState {
  // Data
  locations: Location[];
  isLoadingLocations: boolean;
  // Filter/Search
  activeCategory: CategoryType;
  searchQuery: string;
  layerVisibility: LayerVisibility;
  // Selection
  selectedLocation: Location | null;
  isPulsing: boolean;
  // Camera/View
  is3D: boolean;
  viewMode: ViewMode;
  isOrbiting: boolean;
  // UI Layout
  showSidebar: boolean;
  // Actions
  setLocations: (locations: Location[]) => void;
  setLoadingLocations: (loading: boolean) => void;
  setActiveCategory: (category: CategoryType) => void;
  setSearchQuery: (query: string) => void;
  setLayerVisibility: (visibility: LayerVisibility) => void;
  setSelectedLocation: (location: Location | null) => void;
  setIsPulsing: (pulsing: boolean) => void;
  setIs3D: (is3D: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsOrbiting: (orbiting: boolean) => void;
  toggleSidebar: () => void;
  clearSelection: () => void;
}
```

No `persist` wrapper — map state is fully ephemeral.

### Files to create or modify

| File | Change |
|------|--------|
| `apps/web/src/stores/mapStore.ts` | New — centralized map state |
| `apps/web/src/stores/index.ts` | Add `mapStore` export |
| `apps/web/src/features/map/components/BravaMap.tsx` | Reduce to orchestrator shell |
| `apps/web/src/features/map/components/MapHeader.tsx` | New — from BravaMap lines 857-877 |
| `apps/web/src/features/map/components/MapSidebar.tsx` | New — from BravaMap lines 880-956 |
| `apps/web/src/features/map/components/MapCanvas.tsx` | New — from BravaMap lines 958-1187 |
| `apps/web/src/features/map/components/MapControls.tsx` | New — from BravaMap lines 1190-1340 |
| `apps/web/src/features/map/components/LocationBottomSheet.tsx` | New — from BravaMap lines 1343-1400 |
| `apps/web/src/features/map/components/LocationDetailCard.tsx` | New — from BravaMap lines 1403-1451 |
| `apps/web/src/features/map/components/CategoryPill.tsx` | New — promoted from BravaMap lines 142-165 |
| `apps/web/src/features/map/components/LocationCard.tsx` | New — promoted from BravaMap lines 167-231 |
| `apps/web/src/app/(main)/map/page.tsx` | Remove `"use client"` directive |
| `apps/web/src/features/map/index.ts` | Update exports |

### Related artifacts

- Spec: `plan/arkhe/specs/023-brava-map-migration/`
- Subsequent work: [ADR-0011](0011-native-10-category-directory-system.md) (native 10-category directory system)
- Deferred: Permissions-Policy geolocation header (infrastructure task)
- Deferred: TanStack Query hook for `getEntriesForMap` (API-client improvement)
