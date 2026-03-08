---
name: mapping-sites
description: Mapbox GL JS v3+ integration with React 19 for mobile-first cultural heritage maps on Brava Island. Use this skill for any map-related work on the Nos Ilha platform — creating map components, adding markers or popups, implementing geolocation, transforming directory data to GeoJSON, styling cultural site layers, or optimizing map performance. Trigger on "add map", "show locations", "display sites on map", "map component", "markers", "geolocation", "clustering", "GeoJSON", "Mapbox", "interactive map", or any geographic visualization need for the directory.
---

# Mapbox Integration Specialist

Implement interactive cultural heritage maps using Mapbox GL JS with React, optimized for mobile-first diaspora users exploring Brava Island. The primary audience includes diaspora community members accessing the platform from varied devices and connectivity conditions worldwide, so mobile performance and graceful degradation are essential.

## Geographic Constraints

All map views are bounded to Brava Island. This prevents users from accidentally panning away and losing context, which is especially important on mobile where accidental gestures are common.

| Parameter | Value |
|-----------|-------|
| Bounds | lat: 14.80-14.90, lng: -24.75 to -24.65 |
| Center | lat: 14.85, lng: -24.70 |
| MaxBounds | Enabled (prevent panning outside island) |
| Default Zoom | 12 |

## Performance Targets

These targets reflect real-world diaspora access patterns — many users connect from mobile devices with limited bandwidth.

| Metric | Target |
|--------|--------|
| Map load time | <3 seconds (limited connectivity) |
| Touch success rate | >95% on mobile |
| Tap target size | Min 44x44px |
| Memory usage | <50MB on mobile |
| Clustering threshold | Zoom <14, radius 50px |

## Workflows

### Map Component Development
1. Analyze cultural heritage requirements
2. Design mobile-first interface with touch controls
3. Implement Mapbox GL JS with React Hook patterns (see `references/REACT_PATTERNS.md`)
4. Add custom markers and popups with cultural context (see `references/CULTURAL_STYLING.md`)
5. Configure Brava Island bounds and constraints
6. Optimize mobile performance (see `references/PERFORMANCE.md`)
7. Test touch interactions and low-connectivity scenarios

### Geospatial Data Integration
1. Transform directory data to GeoJSON with heritage metadata
2. Implement geographic clustering for dense site collections
3. Add category-based styling per cultural type
4. Validate all coordinates within Brava Island bounds — coordinates outside these bounds indicate data errors
5. Optimize vector tile loading and caching

### Cultural Heritage UX
1. Design cultural discovery flows with significance filtering
2. Implement navigation (zoom, location search, geolocation)
3. Add community context popups with heritage information
4. Enable nearby site discovery via geolocation
5. Test diaspora access patterns (international users, varied devices)

## Critical Files

| File | Purpose |
|------|---------|
| `apps/web/src/components/ui/interactive-map.tsx` | Main map component |
| `apps/web/src/hooks/useMapbox.ts` | Custom Mapbox hook |
| `apps/web/src/types/mapbox.ts` | TypeScript interfaces |
| `apps/web/src/lib/mapbox-config.ts` | Map configuration |

## Documentation References

Read these on-demand for implementation details:
- [references/REACT_PATTERNS.md](references/REACT_PATTERNS.md) — Component patterns, hooks, GeoJSON transforms, TypeScript interfaces
- [references/CULTURAL_STYLING.md](references/CULTURAL_STYLING.md) — Brand color markers, popups, category-based layer styling
- [references/PERFORMANCE.md](references/PERFORMANCE.md) — Low-connectivity detection, memory management, lazy loading, error handling
- [EXAMPLES.md](EXAMPLES.md) — Complete implementation examples
