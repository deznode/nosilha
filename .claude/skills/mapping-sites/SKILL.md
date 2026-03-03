---
name: mapping-sites
description: Mapbox GL JS v3+ integration with React 19 for mobile-first cultural heritage maps. Use when implementing/adding/creating interactive maps, geospatial/location features, location-based discovery, or user mentions 'add map', 'show locations', 'display sites', 'map component', or needs geographic visualization.
---

# Mapbox Integration Specialist

This skill should be used when working with Mapbox GL JS integration, geospatial visualization, interactive maps, location-based features, or any mapping functionality for the Nos Ilha cultural heritage platform that connects Brava Island locals to the global Cape Verdean diaspora through location-based cultural discovery.

## When to Use This Skill

- Interactive map component development needed for cultural heritage point-of-interest visualization
- Mobile-first geospatial design required with touch-optimized interactions
- Cultural site visualization needed with custom markers, popups, and styling
- Performance optimization required for users with limited connectivity
- Geolocation integration needed for ancestral territory exploration
- Cultural data mapping required transforming heritage directory data into geospatial visualizations

## Core Capabilities

This skill specializes in:

- **Interactive Map Development**: Create React components with Mapbox GL JS integration for cultural heritage visualization
- **Mobile-First Geospatial Design**: Implement touch-optimized map interactions and responsive controls for diaspora mobile access
- **Cultural Site Visualization**: Design custom markers, popups, and map styling showcasing community stories and heritage significance
- **Performance Optimization**: Optimize map loading, clustering, and memory management for limited connectivity
- **Geolocation Integration**: Implement location services and proximity detection for ancestral territory exploration
- **Cultural Data Mapping**: Transform heritage directory data into interactive geospatial visualizations with community context

## Mandatory Architecture Standards

### Brava Island Geographic Bounds

To optimize all mapping features:

1. **Geographic Constraints**: All mapping functionality optimized for Brava Island coordinates (lat: 14.80-14.90, lng: -24.75 to -24.65)
2. **Center Point**: Default map center at Brava Island center (lat: 14.85, lng: -24.70)
3. **Bounds Enforcement**: MaxBounds configuration prevents panning outside Brava Island geography
4. **Coordinate Validation**: All cultural site coordinates validated within Brava Island bounds

### Mobile-First Design Mandatory

To prioritize diaspora mobile access:

1. **Touch Interactions**: Large tap targets, gesture support, responsive controls
2. **Mobile Performance**: Target <3 seconds map load time for limited connectivity
3. **Touch Success Rate**: >95% successful touch interactions on varied mobile devices
4. **Responsive Design**: Seamless experience across mobile devices (90%+ platform access via mobile)

### Cultural Heritage Context Integration

To ensure authentic community representation:

1. **Community Stories**: All map features include authentic community context and heritage significance
2. **Cultural Sensitivity**: Appropriate access controls for sacred or private cultural locations
3. **Community Authority**: Coordinate with local experts for cultural site accuracy
4. **Educational Value**: Provide meaningful cultural context and historical information

### Performance-First Implementation

To support limited connectivity conditions:

1. **Load Time Target**: <3 seconds map load for mobile users with limited connectivity
2. **Vector Tile Optimization**: Efficient rendering with clustering and level-of-detail management
3. **Memory Management**: Proper map instance lifecycle preventing memory leaks
4. **Graceful Degradation**: Cached map tiles and offline cultural content access

Reference frontend map component files for implementation patterns.

## Interactive Map Component Development

Follow this process for map component creation:

1. **Analyze Cultural Heritage Requirements**: Understand heritage significance and community context of mapping functionality
2. **Design Mobile-First Map Interface**: Create touch-optimized interactions and responsive controls for diaspora access
3. **Implement Mapbox GL JS Integration**: Follow React Hook patterns with proper lifecycle management and memory cleanup
4. **Add Cultural Site Visualization**: Custom markers, popups, and styling showcasing community stories
5. **Optimize for Brava Island Bounds**: Configure geographic constraints and location-specific optimizations
6. **Test Mobile Performance**: Validate loading times, touch interactions, and cultural engagement metrics

See [REACT_PATTERNS.md](REACT_PATTERNS.md) for detailed component implementation patterns.

## Geospatial Data Integration

Follow this process for cultural heritage data mapping:

1. **Transform Heritage Directory Data**: Convert cultural site data to GeoJSON with community context and heritage metadata
2. **Implement Geographic Clustering**: Optimize performance for dense cultural site collections with meaningful groupings
3. **Add Cultural Category Styling**: Distinguish heritage types (restaurants, hotels, landmarks, beaches) with culturally appropriate design
4. **Validate Geographic Accuracy**: Ensure cultural site coordinates fall within Brava Island bounds with community verification
5. **Optimize Data Loading**: Implement efficient vector tile loading and caching for limited connectivity

See [REACT_PATTERNS.md](REACT_PATTERNS.md) for GeoJSON transformation examples.

## Cultural Heritage User Experience

Follow this process for diaspora-focused map interactions:

1. **Design Cultural Discovery Flows**: Enable intuitive exploration of heritage sites with cultural significance filtering
2. **Implement Ancestral Navigation**: Zoom controls and location search optimized for diaspora homeland exploration
3. **Add Community Context Popups**: Heritage information, community stories, and cultural significance in map interactions
4. **Enable Geolocation Features**: User location detection with nearby cultural site discovery
5. **Test Diaspora Access Patterns**: Validate experience for global Cape Verdean community access conditions and devices

See [CULTURAL_STYLING.md](CULTURAL_STYLING.md) for heritage-specific map styling patterns.

## Map Styling and Customization

Follow this process for cultural heritage map styling:

### Cultural Category Markers

To distinguish heritage site types:

1. **Restaurant Markers**: Bougainvillea Pink (#D90368) - traditional cuisine focus
2. **Hotel Markers**: Ocean Blue (#005A8D) - community hospitality
3. **Landmark Markers**: Valley Green (#3E7D5A) - historical significance (larger markers)
4. **Beach Markers**: Sunny Yellow (#F7B801) - traditional activities

### Cultural Clustering Configuration

To optimize dense heritage site collections:

1. **Cluster Activation**: Enable clustering at zoom levels <14 for performance
2. **Cluster Radius**: 50px radius for meaningful heritage site groupings
3. **Cluster Styling**: Color-coded by point count with cultural brand colors
4. **Cluster Interaction**: Click to zoom and expand cultural site clusters

See [CULTURAL_STYLING.md](CULTURAL_STYLING.md) for complete styling configuration.

## Mobile Performance Optimization

Follow this process for diaspora mobile access optimization:

### Low Connectivity Detection

To optimize for limited connectivity:

1. **Connection Speed Detection**: Use Navigator Connection API to detect 2G/slow-2G conditions
2. **Reduced Quality Mode**: Disable antialiasing and reduce tile resolution for low connectivity
3. **Optimized Tile Loading**: Use 256px tiles instead of 512px for limited bandwidth
4. **Fade Duration Reduction**: Set to 0 for low connectivity, 300ms for normal conditions

### Cultural Site Proximity Detection

To enable ancestral territory exploration:

1. **User Location Detection**: Use Geolocation API with permission handling
2. **Distance Calculation**: Calculate distance from user location to all cultural sites
3. **Nearby Heritage Filter**: Show sites within 5km for meaningful heritage exploration
4. **Proximity Sorting**: Sort nearby sites by distance for intuitive discovery

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for detailed optimization strategies.

## Error Handling and Fallbacks

Follow this process for graceful degradation:

### Map Loading Failures

To handle connectivity and service issues:

1. **Initialization Error Detection**: Catch Mapbox initialization failures
2. **Static Heritage Site List**: Fallback to non-interactive site directory with location information
3. **Cached Cultural Content**: Offline cultural heritage content access for limited connectivity
4. **Service Unavailability**: Escalate if Mapbox service unavailable >5 minutes

### Geolocation Issues

To handle user location unavailability:

1. **Permission Denied Handling**: Fallback to manual location selection
2. **GPS Unavailability**: Provide cultural site browsing without proximity features
3. **Accuracy Issues**: Use approximate location with clear accuracy indicators
4. **Browser Compatibility**: Detect geolocation API support and provide alternatives

See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for complete error handling strategies.

## File Structure and References

### Critical Files (Always Reference)

- `frontend/src/components/ui/interactive-map.tsx` - Main heritage map component with cultural site visualization
- `frontend/src/hooks/useMapbox.ts` - Custom Mapbox hook for state management and lifecycle handling
- `frontend/src/types/mapbox.ts` - TypeScript interfaces for geospatial data and cultural heritage properties
- `frontend/src/lib/mapbox-config.ts` - Map styling configuration and Brava Island optimization settings

### Related Files (Context)

- `frontend/src/types/directory.ts` - Cultural heritage site data structures and category definitions
- `frontend/src/lib/constants.ts` - Brava Island geographic bounds and cultural heritage constants
- `frontend/public/mapbox-icons/` - Custom marker icons for cultural categories and heritage significance
- `frontend/.env.local` - NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN configuration

## Coordination with Other Skills

### Receive Requirements From

- **frontend-engineer**: UI component integration needs, map display requirements
- **backend-engineer**: Geospatial API data format, heritage directory location data
- **content-creator**: Cultural site information, community storytelling requirements
- **database-engineer**: Geospatial query optimization, location data structure

### Handoff Results To

- **frontend-engineer**: Map components complete and integrated with React component specifications, props interfaces, styling requirements
- **backend-engineer**: Geospatial data requirements defined with API data structure needs, query optimization requirements
- **integration-specialist**: Map functionality ready for testing with complete integration specifications, performance benchmarks

## Supporting Documentation

Always consult these references:

- [REACT_PATTERNS.md](REACT_PATTERNS.md) - React component patterns, hooks, state management, TypeScript interfaces
- [CULTURAL_STYLING.md](CULTURAL_STYLING.md) - Heritage map styling, marker design, cultural category colors
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Mobile optimization, connectivity detection, memory management
- [EXAMPLES.md](EXAMPLES.md) - Complete map component examples and implementation patterns

## Best Practices

Remember these principles:

1. **Mobile-First Always**: Prioritize touch interactions and mobile performance over desktop features
2. **Brava Island Bounds**: All mapping optimized for Brava Island geography and coordinates
3. **Cultural Context Required**: Every map feature includes authentic community context
4. **Performance Target**: <3 seconds map load for limited connectivity diaspora users
5. **Touch Success Rate**: >95% successful interactions on varied mobile devices
6. **Cultural Sensitivity**: Coordinate with community for sacred location access controls
7. **Memory Management**: Proper map instance lifecycle preventing leaks
8. **Graceful Degradation**: Cached tiles and offline content for connectivity issues

Every map interaction serves as a bridge connecting the global Cape Verdean diaspora to their ancestral homeland on Brava Island. Map visualizations must honor community knowledge while enabling meaningful cultural discovery and authentic ancestral exploration for both local residents and the worldwide diaspora community.
