# Complete Map Component Examples

This document provides complete, working examples of Mapbox integration for Nos Ilha cultural heritage platform.

## Example 1: Restaurant Directory Map

Complete map component showing all restaurants on Brava Island with category filtering.

See `frontend/src/components/ui/interactive-map.tsx` for full implementation.

**Key Features**:
- Cultural category filtering (restaurants only)
- Custom pink markers for traditional cuisine
- Community story popups with heritage context
- Mobile-first touch optimization
- Proximity detection for nearby restaurants

**Usage**:
```typescript
import { HeritageMap } from '@/components/ui/interactive-map'

<HeritageMap
  culturalSites={restaurants}
  selectedCategory="restaurant"
  onSiteSelect={(site) => router.push(`/directory/entry/${site.slug}`)}
  enableCulturalClustering={true}
/>
```

## Example 2: Landmark Heritage Map

Interactive map showing historical landmarks with enhanced markers and cultural significance.

**Key Features**:
- Larger green markers for historical significance
- Thicker stroke width for visual emphasis
- Cultural heritage context in popups
- Geolocation for ancestral territory exploration

**Usage**:
```typescript
<HeritageMap
  culturalSites={landmarks}
  selectedCategory="landmark"
  onSiteSelect={handleLandmarkSelect}
  userLocation={userCoordinates}
  enableCulturalClustering={false} // Show all landmarks individually
/>
```

## Example 3: Mobile-Optimized Full Directory Map

Complete directory map with low connectivity optimization and proximity detection.

**Implementation**:
```typescript
const DirectoryMapPage: React.FC = () => {
  const [culturalSites, setCulturalSites] = useState<CulturalSite[]>([])
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates>()
  const { optimizedMapConfig, isLowConnectivity } = useMobileMapOptimization()

  // Fetch cultural sites
  useEffect(() => {
    fetch('/api/v1/directory/entries')
      .then(res => res.json())
      .then(data => setCulturalSites(data))
  }, [])

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => console.warn('Geolocation unavailable:', error)
    )
  }, [])

  const { nearbyHeritageSites } = useCulturalProximity(userLocation, culturalSites)

  return (
    <div className="h-screen flex flex-col">
      {isLowConnectivity && (
        <div className="bg-yellow-100 p-2 text-sm text-center">
          Limited connectivity detected. Map optimized for slower speeds.
        </div>
      )}

      <HeritageMap
        culturalSites={culturalSites}
        onSiteSelect={(site) => console.log('Selected:', site)}
        userLocation={userLocation}
        enableCulturalClustering={true}
        className="flex-1"
      />

      {nearbyHeritageSites.length > 0 && (
        <div className="p-4 bg-white border-t">
          <h3 className="font-bold mb-2">Nearby Heritage Sites</h3>
          <ul className="space-y-2">
            {nearbyHeritageSites.slice(0, 3).map(({ site, distance }) => (
              <li key={site.id} className="text-sm">
                <a href={`/directory/entry/${site.slug}`} className="text-blue-600">
                  {site.name}
                </a>
                <span className="text-gray-500 ml-2">({distance.toFixed(1)} km)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

## Example 4: Category-Filtered Map with Lazy Loading

Lazy-loaded map component for page performance optimization.

**Implementation**:
```typescript
const LazyHeritageMap: React.FC<HeritageMapProps> = (props) => {
  const { mapContainerRef, shouldLoadMap } = useLazyMapLoad()

  return (
    <div ref={mapContainerRef} className="w-full h-96">
      {shouldLoadMap ? (
        <HeritageMap {...props} />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
    </div>
  )
}
```

## Example 5: Error Handling with Fallback

Map component with comprehensive error handling and static fallback.

**Implementation**:
```typescript
const RobustHeritageMap: React.FC<HeritageMapProps> = (props) => {
  const { mapError, showFallback, handleMapError, FallbackComponent } = useMapErrorHandling()

  if (showFallback) {
    return (
      <>
        <FallbackComponent />
        <div className="mt-4">
          <h3 className="font-bold mb-2">Heritage Sites</h3>
          <ul className="space-y-2">
            {props.culturalSites.map(site => (
              <li key={site.id}>
                <a href={`/directory/entry/${site.slug}`} className="text-blue-600">
                  {site.name} - {site.town}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  }

  return (
    <HeritageMap
      {...props}
      onError={handleMapError}
    />
  )
}
```

## Example 6: Performance Monitoring Dashboard

Track map performance metrics for optimization.

**Implementation**:
```typescript
const MonitoredHeritageMap: React.FC<HeritageMapProps> = (props) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const metrics = useMapPerformanceMetrics(mapRef.current)

  return (
    <div className="relative">
      <HeritageMap {...props} onMapLoad={(map) => { mapRef.current = map }} />

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-white p-2 text-xs rounded shadow">
          <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
          <div>Tiles: {metrics.tileLoadTime.toFixed(0)}ms</div>
          <div>Touch: {metrics.touchSuccessRate.toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}
```

**Remember**: All examples prioritize mobile-first design, Brava Island geographic optimization, and authentic cultural heritage representation. Use these patterns as starting points and adapt for specific cultural heritage visualization needs.
