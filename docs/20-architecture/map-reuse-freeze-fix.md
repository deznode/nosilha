# Bug Report: Map Page Freeze on Re-navigation

**Date**: 2026-03-11
**Severity**: Critical (browser freeze — full UI lockup)
**Status**: Resolved
**Affected Route**: `/map`

---

## Symptoms

Navigating **Home → Map → Home → Map** caused the browser tab to become completely unresponsive. The main thread was blocked in an infinite synchronous loop, requiring a force-kill of the tab. First visit to `/map` always worked correctly; the freeze occurred only on return navigation.

---

## Root Cause

An incompatibility between **react-map-gl's `reuseMaps` option** and **Next.js `cacheComponents: true`** (the React `<Activity>` component).

### How `reuseMaps` Works

When `reuseMaps` is enabled on the `<Map>` component, react-map-gl maintains a pool of recycled Mapbox GL instances (`Mapbox.savedMaps`). On unmount, instead of destroying the map, the library calls `mapbox.recycle()` to push the instance into the pool. On remount, `Mapbox.reuse()` retrieves a pooled instance and reparents its DOM nodes into the new container element:

```ts
// react-map-gl/src/mapbox-legacy/mapbox/mapbox.ts:246-250
const oldContainer = map.getContainer();       // divA
container.className = oldContainer.className;
while (oldContainer.childNodes.length > 0) {   // INFINITE when same element
  container.appendChild(oldContainer.childNodes[0]);
}
```

### How Activity Preserves the DOM

`cacheComponents: true` wraps routes in React's `<Activity>` component. When navigating away from `/map`, Activity **does not unmount** the component tree — it hides the route via `display: none` while preserving the full DOM subtree. When navigating back, Activity shows the route again and **re-runs all effects** (both setup and cleanup phases).

### The Collision

1. **First visit**: `Mapbox.savedMaps` is empty → `Mapbox.reuse()` returns `null` → a fresh `new Mapbox()` is created. Works fine.

2. **Navigate away**: Activity hides the route. The map's `useEffect` cleanup runs → `mapbox.recycle()` pushes the instance to `savedMaps`. The DOM is preserved (hidden with `display: none`).

3. **Navigate back**: Activity shows the route. The map's `useEffect` setup runs → `Mapbox.reuse(props, containerRef.current)` retrieves the pooled instance. **Critically, the container ref still points to the same DOM element** because Activity preserved it. So `oldContainer === container` — they are the **same element**.

4. **Infinite loop**: The `while (oldContainer.childNodes.length > 0)` loop calls `container.appendChild(oldContainer.childNodes[0])`. Since `oldContainer` and `container` are the same element, `appendChild` moves a child node to the end of its own parent. `childNodes` is a **live NodeList**, so its `.length` never reaches 0. The main thread is blocked forever.

### Lifecycle Diagram

```
First Visit:
  Activity mount → useEffect setup → Mapbox.reuse() returns null → new Mapbox() ✅

Navigate Away:
  Activity hide → useEffect cleanup → mapbox.recycle() → savedMaps.push(instance)
  DOM preserved (display: none), containerRef.current unchanged

Navigate Back:
  Activity show → useEffect setup → Mapbox.reuse(props, containerRef.current)
    → oldContainer = map.getContainer()     // same DOM element
    → container = containerRef.current      // same DOM element
    → while(oldContainer.childNodes.length) // INFINITE LOOP ❌
```

---

## Fix

### 1. Removed `reuseMaps` from BaseMap

**File**: `apps/web/src/features/map/shared/base-map.tsx`

Deleted the `reuseMaps` prop from the `<Map>` component. Without `reuseMaps`:
- Cleanup calls `mapbox.destroy()` → `map.remove()` (full teardown)
- Setup creates `new Mapbox(...)` (fresh instance)
- No reuse pool, no DOM reparenting, no infinite loop

**Trade-off**: Slightly slower map initialization on return visits (a fresh Mapbox GL instance is created each time). This is acceptable — the map loads in under 2 seconds and the loading overlay provides visual feedback.

### 2. Added State Reset on Activity Restore

**File**: `apps/web/src/features/map/components/map-canvas.tsx`

Without `reuseMaps`, the map is destroyed on Activity hide and recreated on show. But Activity preserves `useState` values — so `isMapLoaded` would remain `true` from the first visit, causing the loading overlay to be skipped even though the new map instance hasn't loaded yet.

Added a state-reset `useEffect` (declared before other effects to run first during Activity restore):

```tsx
useEffect(() => {
  const alreadyPlayed = useMapStore.getState().introCompleted;
  setIsMapLoaded(false);
  setMapError(null);
  setIsIntroPlaying(!alreadyPlayed);
  setIsIntroComplete(alreadyPlayed);
}, []);
```

This resets lifecycle state on every mount/Activity restore, while consulting the Zustand store to determine whether to replay the cinematic intro.

### 3. Added `introCompleted` to Zustand Store

**File**: `apps/web/src/stores/mapStore.ts`

Added `introCompleted: boolean` and `setIntroCompleted` action. The Zustand store is a global singleton that survives navigation (unlike `useState` which is component-scoped). This allows the cinematic intro to play once per session — first visit gets the full flyover, return visits skip straight to the interactive map.

The flag is set both when the intro completes naturally and when the user cancels it (ESC key or "Skip Intro" button).

### 4. Removed Terrain Cleanup useLayoutEffect

**File**: `apps/web/src/features/map/components/map-canvas.tsx`

Removed the `useLayoutEffect` that called `map.setTerrain(null)` before Source cleanup. This was a workaround for a `reuseMaps`-specific issue where terrain referenced a DEM source that `<Source>` cleanup tried to remove. Without `reuseMaps`, `map.remove()` handles full teardown — the workaround is no longer needed.

---

## Files Modified

| File | Change |
|------|--------|
| `apps/web/src/features/map/shared/base-map.tsx` | Removed `reuseMaps` prop |
| `apps/web/src/features/map/components/map-canvas.tsx` | Added state-reset effect, removed `useLayoutEffect` terrain hack, set `introCompleted` in store |
| `apps/web/src/stores/mapStore.ts` | Added `introCompleted` / `setIntroCompleted` state and selector |

---

## Verification

- TypeScript compiles cleanly (`pnpm exec tsc --noEmit`)
- Home → Map → Home → Map navigation works without freeze
- Cinematic intro plays on first visit, skips on return
- Map markers, zones, and view mode toggle work after re-navigation
- Direct cold navigation to `/map` works correctly

---

## Key Takeaway

**`reuseMaps` and `cacheComponents: true` (Activity) are fundamentally incompatible.** Both attempt to optimize by preserving state across navigations, but they operate at different levels — react-map-gl recycles at the JS instance level while Activity preserves at the DOM level. When both are active, the recycled instance's container reference points to the same DOM element that Activity preserved, causing the reparenting loop to operate on itself indefinitely.

The general principle: **any library that pools and reparents DOM nodes will conflict with Activity's DOM preservation**. When using `cacheComponents: true`, disable library-level DOM reuse and rely on Activity's own preservation mechanism instead.
