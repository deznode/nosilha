---
name: mapping-sites
description: Mapbox GL JS v3+ integration with React 19 for mobile-first cultural heritage maps. Use when implementing/adding/creating interactive maps, geospatial/location features, location-based discovery, or user mentions 'add map', 'show locations', 'display sites', 'map component', or needs geographic visualization.
---

# Mapbox Integration Specialist

Use when working with Mapbox GL JS, geospatial visualization, interactive maps, or mapping functionality for cultural heritage sites.

## When to Use

- Interactive map component development for cultural sites
- Mobile-first geospatial design with touch optimization
- Custom markers, popups, and map styling
- Performance optimization for limited connectivity
- Geolocation integration for heritage discovery
- GeoJSON data transformation for directory entries

## Mandatory Standards

### Geographic Constraints

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Bounds | lat: 14.80-14.90, lng: -24.75 to -24.65 | Brava Island limits |
| Center | lat: 14.85, lng: -24.70 | Default map center |
| MaxBounds | Enabled | Prevent panning outside island |

### Mobile-First Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Map Load Time | <3 seconds | Limited connectivity users |
| Touch Success Rate | >95% | Varied mobile devices |
| Tap Target Size | Min 44x44px | Touch accessibility |

### Performance Standards

| Metric | Target |
|--------|--------|
| Memory Usage | <50MB on mobile |
| Clustering | Enable at zoom <14 |
| Cluster Radius | 50px |

Reference `frontend/src/lib/mapbox-config.ts` for configuration.

## Workflows

### Map Component Development
1. Analyze cultural heritage requirements
2. Design mobile-first interface with touch controls
3. Implement Mapbox GL JS with React Hook patterns
4. Add custom markers and popups with cultural context
5. Configure Brava Island bounds
6. Test mobile performance and touch interactions

### Geospatial Data Integration
1. Transform directory data to GeoJSON with heritage metadata
2. Implement geographic clustering for performance
3. Add category-based styling per cultural type
4. Validate coordinates within Brava Island bounds
5. Optimize vector tile loading and caching

### Cultural Heritage UX
1. Design cultural discovery flows with significance filtering
2. Implement ancestral navigation (zoom, location search)
3. Add community context popups with heritage information
4. Enable geolocation for nearby site discovery
5. Test diaspora access patterns

See [REACT_PATTERNS.md](REACT_PATTERNS.md) for implementation patterns.

## Critical Files

| File | Purpose |
|------|---------|
| `frontend/src/components/ui/interactive-map.tsx` | Main map component |
| `frontend/src/hooks/useMapbox.ts` | Custom Mapbox hook |
| `frontend/src/types/mapbox.ts` | TypeScript interfaces |
| `frontend/src/lib/mapbox-config.ts` | Map configuration |

## Documentation References

**Always consult**:
- [REACT_PATTERNS.md](REACT_PATTERNS.md) - Component patterns, hooks, TypeScript interfaces
- [CULTURAL_STYLING.md](CULTURAL_STYLING.md) - Marker colors, popups, category styling
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Mobile optimization, error handling
- [EXAMPLES.md](EXAMPLES.md) - Complete implementation examples

## Best Practices

1. Mobile-first: Prioritize touch interactions over desktop features
2. Brava bounds: All mapping optimized for island geography
3. Cultural context: Every feature includes authentic community context
4. Performance: <3 seconds load for limited connectivity
5. Touch success: >95% successful interactions on mobile
6. Cultural sensitivity: Coordinate with community for sacred locations
7. Memory management: Proper lifecycle preventing leaks
8. Graceful degradation: Cached tiles and offline content
