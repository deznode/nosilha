# Mobile Performance Optimization

## Table of Contents
- [Low Connectivity Detection](#low-connectivity-detection)
- [Cultural Site Proximity Detection](#cultural-site-proximity-detection)
- [Memory Management](#memory-management)
- [Marker Clustering Optimization](#marker-clustering-optimization)
- [Lazy Loading Implementation](#lazy-loading-implementation)
- [Error Handling and Fallbacks](#error-handling-and-fallbacks)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

This document provides strategies for optimizing Mapbox GL JS performance for mobile diaspora users with limited connectivity.

## Low Connectivity Detection

```typescript
export const useMobileMapOptimization = () => {
  const [isLowConnectivity, setIsLowConnectivity] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    // Detect connection speed for diaspora users
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection.effectiveType

      setConnectionType(effectiveType)
      setIsLowConnectivity(
        effectiveType === '2g' || effectiveType === 'slow-2g'
      )

      // Listen for connection changes
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType)
        setIsLowConnectivity(
          connection.effectiveType === '2g' ||
          connection.effectiveType === 'slow-2g'
        )
      })
    }
  }, [])

  const optimizedMapConfig = useMemo(() => ({
    // Reduce quality for low connectivity
    antialias: !isLowConnectivity,
    performanceMetrics: true,

    // Optimize for mobile hardware
    fadeDuration: isLowConnectivity ? 0 : 300,
    crossSourceCollisions: !isLowConnectivity,

    // Cultural heritage tile optimization
    transformRequest: (url: string) => {
      if (isLowConnectivity && url.startsWith('mapbox://')) {
        // Use lower resolution tiles (256px instead of 512px)
        return {
          url: url.replace('512', '256')
        }
      }
      return { url }
    },

    // Limit tile cache for mobile memory
    maxTileCacheSize: isLowConnectivity ? 30 : 50
  }), [isLowConnectivity])

  return {
    optimizedMapConfig,
    isLowConnectivity,
    connectionType
  }
}
```

## Cultural Site Proximity Detection

```typescript
export const useCulturalProximity = (
  userLocation?: GeolocationCoordinates,
  culturalSites: CulturalSite[],
  maxDistance: number = 5 // kilometers
) => {
  const nearbyHeritageSites = useMemo(() => {
    if (!userLocation) return []

    return culturalSites
      .map(site => ({
        ...site,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          site.latitude,
          site.longitude
        )
      }))
      .filter(site => site.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  }, [userLocation, culturalSites, maxDistance])

  const closestHeritageSite = nearbyHeritageSites[0] || null

  return {
    nearbyHeritageSites,
    closestHeritageSite,
    hasNearbySites: nearbyHeritageSites.length > 0
  }
}
```

## Memory Management

```typescript
export const useMapMemoryManagement = (map: mapboxgl.Map | null) => {
  useEffect(() => {
    if (!map) return

    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / 1048576
        const limitMB = memory.jsHeapSizeLimit / 1048576

        // If using >80% of available memory, reduce quality
        if (usedMB > limitMB * 0.8) {
          map.setRenderWorldCopies(false)
          map.setMaxTileCacheSize(20)
        }
      }
    }

    const intervalId = setInterval(checkMemory, 30000) // Check every 30s

    return () => clearInterval(intervalId)
  }, [map])
}
```

## Marker Clustering Optimization

```typescript
export const CULTURAL_CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 14, // Don't cluster above zoom 14
  clusterRadius: 50, // Cluster within 50px radius

  // Cluster properties for efficient rendering
  clusterProperties: {
    // Sum of cultural significance ratings in cluster
    significanceSum: ['+', ['get', 'culturalSignificance']],
    // Most common category in cluster
    dominantCategory: ['most-frequent', ['get', 'category']]
  }
}
```

## Lazy Loading Implementation

```typescript
export const useLazyMapLoad = () => {
  const [shouldLoadMap, setShouldLoadMap] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return { mapContainerRef, shouldLoadMap }
}
```

## Error Handling and Fallbacks

```typescript
export const useMapErrorHandling = () => {
  const [mapError, setMapError] = useState<Error | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const handleMapError = useCallback((error: Error) => {
    console.error('Map error:', error)
    setMapError(error)

    // Show fallback after 5 seconds if map doesn't load
    setTimeout(() => {
      setShowFallback(true)
    }, 5000)
  }, [])

  const FallbackComponent = useCallback(() => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center p-6">
        <h3 className="text-lg font-bold mb-2">Map Unavailable</h3>
        <p className="text-sm text-gray-600 mb-4">
          The interactive map is temporarily unavailable. View cultural heritage sites in list format below.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  ), [])

  return {
    mapError,
    showFallback,
    handleMapError,
    FallbackComponent
  }
}
```

## Performance Monitoring

```typescript
export const useMapPerformanceMetrics = (map: mapboxgl.Map | null) => {
  const [metrics, setMetrics] = useState<MapPerformanceMetrics>({
    loadTime: 0,
    tileLoadTime: 0,
    memoryUsage: 0,
    touchSuccessRate: 100
  })

  useEffect(() => {
    if (!map) return

    const loadStartTime = performance.now()

    map.on('load', () => {
      const loadTime = performance.now() - loadStartTime
      setMetrics(prev => ({ ...prev, loadTime }))
    })

    map.on('data', (e) => {
      if (e.dataType === 'source' && e.isSourceLoaded) {
        const tileLoadTime = performance.now() - loadStartTime
        setMetrics(prev => ({ ...prev, tileLoadTime }))
      }
    })

    // Track touch interaction success
    let touchAttempts = 0
    let touchSuccesses = 0

    const trackTouch = () => {
      touchAttempts++
    }

    const trackSuccess = () => {
      touchSuccesses++
      const successRate = (touchSuccesses / touchAttempts) * 100
      setMetrics(prev => ({ ...prev, touchSuccessRate: successRate }))
    }

    map.on('touchstart', trackTouch)
    map.on('touchend', trackSuccess)

    return () => {
      map.off('touchstart', trackTouch)
      map.off('touchend', trackSuccess)
    }
  }, [map])

  return metrics
}
```

## Best Practices

**Performance Targets**:
- Map load time: <3 seconds for mobile with limited connectivity
- Touch interaction success rate: >95%
- Memory usage: <50MB for mobile devices
- Tile load time: <2 seconds for critical heritage sites

**Optimization Strategies**:
- Use vector tiles (not raster) for better mobile performance
- Enable clustering for dense heritage site collections (>20 sites)
- Implement lazy loading for off-screen maps
- Reduce tile resolution for 2G/slow-2G connections
- Limit max tile cache size for mobile memory management
- Disable antialiasing and cross-source collisions for low connectivity

**Error Handling**:
- Provide static heritage site list fallback if map fails to load
- Cache cultural heritage content for offline access
- Show loading indicators for tile loading delays
- Escalate to support if Mapbox service unavailable >5 minutes

**Remember**: Mobile diaspora users may have limited connectivity and varied device capabilities. Always prioritize core cultural heritage functionality over advanced map features.
