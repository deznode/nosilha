---
name: mapping-sites
description: MapLibre GL + react-map-gl map work on the Nos Ilha platform — the /map explorer, the gallery map view, and the mini maps on place and settlement pages. Use for any map change: new map surfaces, markers or popups, basemap styles, terrain, clustering, label placement, camera behaviour, or map performance. Trigger on "add map", "show locations", "map component", "markers", "pins", "clustering", "GeoJSON", "MapLibre", "basemap", "terrain", "interactive map", or any geographic visualization of Brava Island.
---

# Mapping Sites (MapLibre)

Every map in the app runs on **MapLibre GL JS v5** through **`react-map-gl/maplibre`**, over open tile sources that need no API key. There is no Mapbox anywhere in the stack. Read the code named below before changing anything; this file only records the shape of it and the traps.

## Stack

| Piece | Source |
|-------|--------|
| Renderer | `maplibre-gl` ^5 (do **not** bump to v6, see Pitfalls) |
| React binding | `react-map-gl` ^8, always imported from `react-map-gl/maplibre` |
| Basemaps | CARTO Voyager / Positron / Dark Matter style URLs (`MAP_STYLES`) |
| Satellite | Esri World Imagery raster style (`SATELLITE_STYLE`) |
| Terrain | AWS Terrarium DEM tiles (`TERRAIN_DEM`), `raster-dem` source |
| Glyphs | Served by CARTO (`tiles.basemaps.cartocdn.com/fonts/`), straight from the style. `fonts.openmaptiles.org` shut down in 2026; don't route glyphs there |
| Clustering | `use-supercluster` wrapped by `useMapClustering` (gallery map only) |

## Where things live

| Path | Role |
|------|------|
| `apps/web/src/features/map/shared/base-map.tsx` | `BaseMap`: the one `<Map>` wrapper (defaults, CSS import, ref forwarding). New map surfaces build on it. |
| `apps/web/src/features/map/data/constants.ts` | `MAP_STYLES`, `SATELLITE_STYLE`, `TERRAIN_DEM`, `MAP_CONFIG`, `EXPLORER_VIEW` |
| `apps/web/src/features/map/components/brava-map.tsx` → `map-canvas.tsx` | The `/map` explorer (route `app/(archive-fill)/map/page.tsx`, loaded with `dynamic(..., { ssr: false })`) |
| `apps/web/src/features/map/data/locations-adapter.ts` | Turns towns, records and photos into `MapItem`s (`settlementItems`, `recordItems`, `photoItems`) |
| `apps/web/src/features/map/hooks/` | URL state sync, label declutter, filtered and selected items |
| `apps/web/src/stores/mapStore.ts` | Explorer state (mode, filters, selection) |
| `apps/web/src/features/map/components/mini-map.tsx` | Mini map on `components/place-record/` and `components/settlements/settlement-detail/` |
| `apps/web/src/components/gallery/gallery-map-canvas.tsx` | Gallery map view; the only user of `useMapClustering` |

Import through the feature's public API (`@/features/map`) where an export exists.

## Rules

- **Build on `BaseMap`**, don't render a bare `<Map>`: it carries the defaults every surface needs.
- **Client-only**: map components are `"use client"` and the route loads them with `next/dynamic` and `ssr: false`.
- **CSP**: any new tile, style, glyph or imagery host must be added to the CSP in `apps/web/next.config.ts` (`connect-src`, and `style-src` for style JSON). A missing host fails silently as blank tiles or missing labels.
- **Stable style objects**: inline styles (like `SATELLITE_STYLE`) are module-level constants, so the map never restyles on re-render.
- **Brava framing**: default center and zoom come from `MAP_CONFIG` / `EXPLORER_VIEW`. The maps do not set `maxBounds`; don't document or rely on one.
- **Design tokens**: pins, popups and panels use the semantic tokens from the design-system rule, never raw colors.

## Pitfalls (each one shipped as a real bug)

1. **maplibre-gl v6 never starts a worker under Turbopack.** It derives the worker URL from `import.meta.url`, which Turbopack doesn't emit as http(s), so no tiles load and `load` never fires. The failure is silent, and `tsc`, lint and `next build` all pass. Stay on v5; any maplibre or react-map-gl bump needs a manual `/map` smoke test.
2. **Never use `reuseMaps`.** With `cacheComponents` (React Activity), react-map-gl's reuse path reparents a container into itself and freezes the tab on re-navigation. Maps must destroy on hide and recreate on show.
3. **Activity restore can crash Marker/control effects** against the destroyed map. `map-canvas.tsx` wraps the map in `MapRecoveryBoundary`, which remounts with a fresh key. Keep it, and copy the pattern for any new map with markers or controls. State that must reset on restore goes in a mount effect.
4. **Marker clicks reach the map first.** Marker children are portaled into the map container, so a click fires the map `click` handler (which clears the selection) before React sees it, and React `stopPropagation` is too late. Guard the map handler with `target.closest(".maplibregl-marker")`, as `handleMapClick` in `map-canvas.tsx` does.
5. **Clustering needs bounds before the first move.** `use-supercluster` returns nothing while `bounds` is unset. Seed bounds in the map's `onLoad` (`handleMapLoad` → `syncBounds` in `gallery-map-canvas.tsx`), not only in `onMove`, or pins stay hidden until the user drags.

## Verifying a map change

CI does not run the map. After any map change, invoke the `playwright:playwright-cli` skill and check with no interaction first:

1. `/map` loads, tiles and labels render, pins appear without dragging.
2. Navigate away and back: no freeze, pins and selection behave.
3. Click a pin with a real mouse (mousedown/mouseup, not `element.click()`): the selection opens and isn't immediately cleared.
4. Gallery map view clusters on load; a place record's mini map renders.
5. Light and dark themes, at 390px and desktop widths.
