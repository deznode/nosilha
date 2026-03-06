# React Integration Patterns

## Table of Contents
- [Pattern 1: Heritage Map Component](#pattern-1-heritage-map-component)
- [Pattern 2: Custom Mapbox Hook](#pattern-2-custom-mapbox-hook)
- [Pattern 3: GeoJSON Transformation](#pattern-3-geojson-transformation)
- [Pattern 4: TypeScript Interfaces](#pattern-4-typescript-interfaces)
- [Best Practices](#best-practices)

This document provides comprehensive React component patterns for Mapbox GL JS integration in the Nos Ilha cultural heritage platform.

## Pattern 1: Heritage Map Component

Use this pattern for the main interactive map component with cultural heritage site visualization.

### Complete Component Implementation

```typescript
// apps/web/src/components/ui/interactive-map.tsx
import { useRef, useEffect, useCallback, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { CulturalSite, CulturalCategory } from '@/types/directory'

// Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface HeritageMapProps {
  culturalSites: CulturalSite[]
  selectedCategory?: CulturalCategory
  onSiteSelect: (site: CulturalSite) => void
  userLocation?: GeolocationCoordinates
  enableCulturalClustering?: boolean
  className?: string
}

export const HeritageMap: React.FC<HeritageMapProps> = ({
  culturalSites,
  selectedCategory,
  onSiteSelect,
  userLocation,
  enableCulturalClustering = true,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Brava Island geographic bounds optimization
  const BRAVA_ISLAND_BOUNDS: mapboxgl.LngLatBoundsLike = [
    [-24.75, 14.80], // Southwest coordinates
    [-24.65, 14.90]  // Northeast coordinates
  ]

  const BRAVA_ISLAND_CENTER: [number, number] = [-24.70, 14.85]

  // Initialize map (only once)
  useEffect(() => {
    if (map.current) return // Prevent re-initialization
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: BRAVA_ISLAND_CENTER,
      zoom: 12,
      maxBounds: BRAVA_ISLAND_BOUNDS,

      // Mobile-first optimizations
      touchZoomRotate: true, // Enable pinch-to-zoom
      touchPitch: false, // Disable pitch for simpler mobile interaction
      dragRotate: false, // Disable rotation for clearer cultural site orientation
      antialias: true,

      // Performance optimizations
      maxTileCacheSize: 50, // Limit cache for mobile memory management
      trackResize: true
    })

    // Add navigation controls (mobile-optimized)
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false, // Simplify controls for mobile
        showZoom: true
      }),
      'top-right'
    )

    // Add geolocate control for diaspora ancestral exploration
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    )

    // Handle map load event
    map.current.on('load', () => {
      setMapLoaded(true)
    })

    // Cleanup on unmount
    return () => {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add cultural heritage site layer
  const addCulturalSiteLayer = useCallback(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Filter sites by selected category if provided
    const filteredSites = selectedCategory
      ? culturalSites.filter(site => site.category === selectedCategory)
      : culturalSites

    // Create GeoJSON feature collection for cultural sites
    const culturalGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredSites.map(site => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [site.longitude, site.latitude]
        },
        properties: {
          id: site.id,
          name: site.name,
          category: site.category,
          culturalSignificance: site.culturalSignificance,
          communityStory: site.communityStory,
          heritageContext: site.heritageContext,
          description: site.description
        }
      }))
    }

    // Add source if it doesn't exist
    if (!map.current.getSource('cultural-sites')) {
      map.current.addSource('cultural-sites', {
        type: 'geojson',
        data: culturalGeoJSON,
        cluster: enableCulturalClustering,
        clusterMaxZoom: 14, // Max zoom for clustering
        clusterRadius: 50 // Cluster radius in pixels
      })

      // Add cluster layer
      if (enableCulturalClustering) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'cultural-sites',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6', 100,
              '#f1f075', 750,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, 100,
              30, 750,
              40
            ]
          }
        })

        // Add cluster count labels
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'cultural-sites',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        })

        // Add click handler for clusters
        map.current.on('click', 'clusters', (e) => {
          if (!map.current) return
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          })
          const clusterId = features[0].properties?.cluster_id
          const source = map.current.getSource('cultural-sites') as mapboxgl.GeoJSONSource
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current) return
            const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
            map.current.easeTo({
              center: coordinates,
              zoom: zoom
            })
          })
        })

        // Change cursor on hover
        map.current.on('mouseenter', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer'
        })
        map.current.on('mouseleave', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = ''
        })
      }

      // Add unclustered points layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'cultural-sites',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'restaurant', '#D90368', // Bougainvillea Pink
            'hotel', '#005A8D', // Ocean Blue
            'landmark', '#3E7D5A', // Valley Green
            'beach', '#F7B801', // Sunny Yellow
            '#888888' // Default gray
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 8,
            15, 12
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      })

      // Add click handler for unclustered points
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return
        const feature = e.features[0]
        const siteId = feature.properties?.id
        const site = culturalSites.find(s => s.id === siteId)
        if (site) onSiteSelect(site)
      })

      // Change cursor on hover
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
    } else {
      // Update existing source data
      const source = map.current.getSource('cultural-sites') as mapboxgl.GeoJSONSource
      source.setData(culturalGeoJSON)
    }
  }, [culturalSites, selectedCategory, enableCulturalClustering, mapLoaded, onSiteSelect])

  // Update cultural site layer when data changes
  useEffect(() => {
    if (mapLoaded) {
      addCulturalSiteLayer()
    }
  }, [mapLoaded, addCulturalSiteLayer])

  // Handle user location updates
  useEffect(() => {
    if (!map.current || !userLocation) return

    // Add user location marker
    const userMarker = new mapboxgl.Marker({
      color: '#FF0000'
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map.current)

    return () => {
      userMarker.remove()
    }
  }, [userLocation])

  return (
    <div
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}
```

### Key Implementation Details

**Map Initialization**:
- Brava Island geographic bounds (`maxBounds`) prevent panning outside island geography
- Mobile-first optimizations: touch zoom enabled, pitch/rotate disabled for simpler interaction
- Navigation and geolocate controls added for diaspora exploration

**Cultural Site Layer**:
- GeoJSON feature collection with cultural heritage metadata
- Clustering enabled for dense heritage site collections (zoom <14)
- Category-based marker styling using cultural brand colors
- Click handlers for cluster expansion and site selection

**Memory Management**:
- Proper cleanup in `useEffect` return function
- Marker array cleanup preventing memory leaks
- Map instance removal on unmount

## Pattern 2: Custom Mapbox Hook

Use this pattern for reusable map state management and lifecycle handling.

### Custom Hook Implementation

```typescript
// apps/web/src/hooks/useMapbox.ts
import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'

export interface UseMapboxOptions {
  container: HTMLDivElement | null
  center: [number, number]
  zoom: number
  maxBounds?: mapboxgl.LngLatBoundsLike
  style?: string
}

export const useMapbox = (options: UseMapboxOptions) => {
  const { container, center, zoom, maxBounds, style = 'mapbox://styles/mapbox/streets-v12' } = options

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Initialize map
  useEffect(() => {
    if (!container || mapRef.current) return

    try {
      mapRef.current = new mapboxgl.Map({
        container,
        style,
        center,
        zoom,
        maxBounds,
        touchZoomRotate: true,
        touchPitch: false,
        dragRotate: false,
        antialias: true
      })

      mapRef.current.on('load', () => {
        setIsLoaded(true)
      })

      mapRef.current.on('error', (e) => {
        setError(new Error(e.error.message))
      })
    } catch (err) {
      setError(err as Error)
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      setIsLoaded(false)
    }
  }, [container, style, center, zoom, maxBounds])

  // Add source helper
  const addSource = useCallback((id: string, source: mapboxgl.AnySourceData) => {
    if (!mapRef.current || !isLoaded) return false

    if (mapRef.current.getSource(id)) {
      return false // Source already exists
    }

    mapRef.current.addSource(id, source)
    return true
  }, [isLoaded])

  // Add layer helper
  const addLayer = useCallback((layer: mapboxgl.AnyLayer) => {
    if (!mapRef.current || !isLoaded) return false

    if (mapRef.current.getLayer(layer.id)) {
      return false // Layer already exists
    }

    mapRef.current.addLayer(layer)
    return true
  }, [isLoaded])

  // Update source data helper
  const updateSource = useCallback((id: string, data: GeoJSON.FeatureCollection) => {
    if (!mapRef.current || !isLoaded) return false

    const source = mapRef.current.getSource(id) as mapboxgl.GeoJSONSource
    if (!source) return false

    source.setData(data)
    return true
  }, [isLoaded])

  // Fly to location helper
  const flyTo = useCallback((center: [number, number], zoom?: number) => {
    if (!mapRef.current || !isLoaded) return

    mapRef.current.flyTo({
      center,
      zoom: zoom !== undefined ? zoom : mapRef.current.getZoom()
    })
  }, [isLoaded])

  // Fit bounds helper
  const fitBounds = useCallback((bounds: mapboxgl.LngLatBoundsLike, options?: mapboxgl.FitBoundsOptions) => {
    if (!mapRef.current || !isLoaded) return

    mapRef.current.fitBounds(bounds, options)
  }, [isLoaded])

  return {
    map: mapRef.current,
    isLoaded,
    error,
    addSource,
    addLayer,
    updateSource,
    flyTo,
    fitBounds
  }
}
```

### Usage Example

```typescript
const MyMapComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { map, isLoaded, error, addSource, addLayer } = useMapbox({
    container: containerRef.current,
    center: [-24.70, 14.85], // Brava Island center
    zoom: 12,
    maxBounds: [[-24.75, 14.80], [-24.65, 14.90]]
  })

  useEffect(() => {
    if (isLoaded) {
      // Add cultural heritage sites
      addSource('sites', {
        type: 'geojson',
        data: culturalSitesGeoJSON
      })

      addLayer({
        id: 'sites-layer',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': 10,
          'circle-color': '#D90368'
        }
      })
    }
  }, [isLoaded, addSource, addLayer])

  if (error) {
    return <div>Error loading map: {error.message}</div>
  }

  return <div ref={containerRef} className="w-full h-full" />
}
```

## Pattern 3: GeoJSON Transformation

Use this pattern to transform cultural heritage directory data into GeoJSON format.

### Transformation Function

```typescript
// apps/web/src/lib/geojson-utils.ts
import type { CulturalSite, CulturalCategory } from '@/types/directory'

export const transformToGeoJSON = (
  sites: CulturalSite[],
  filterCategory?: CulturalCategory
): GeoJSON.FeatureCollection => {
  const filteredSites = filterCategory
    ? sites.filter(site => site.category === filterCategory)
    : sites

  return {
    type: 'FeatureCollection',
    features: filteredSites.map(site => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [site.longitude, site.latitude]
      },
      properties: {
        id: site.id,
        name: site.name,
        category: site.category,
        slug: site.slug,
        description: site.description,
        culturalSignificance: site.culturalSignificance,
        communityStory: site.communityStory,
        heritageContext: site.heritageContext,
        imageUrl: site.imageUrl,
        address: site.address,
        town: site.town
      },
      id: site.id
    }))
  }
}

// Validate coordinates are within Brava Island bounds
export const validateBravaCoordinates = (
  latitude: number,
  longitude: number
): boolean => {
  const BRAVA_BOUNDS = {
    minLat: 14.80,
    maxLat: 14.90,
    minLng: -24.75,
    maxLng: -24.65
  }

  return (
    latitude >= BRAVA_BOUNDS.minLat &&
    latitude <= BRAVA_BOUNDS.maxLat &&
    longitude >= BRAVA_BOUNDS.minLng &&
    longitude <= BRAVA_BOUNDS.maxLng
  )
}

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

const toRad = (value: number): number => {
  return (value * Math.PI) / 180
}
```

## Pattern 4: TypeScript Interfaces

Use these interfaces for type-safe map development.

### Map Data Interfaces

```typescript
// apps/web/src/types/mapbox.ts
import type { CulturalCategory } from './directory'

export interface MapboxConfig {
  accessToken: string
  style: string
  center: [number, number]
  zoom: number
  maxBounds: [[number, number], [number, number]]
}

export interface CulturalSiteFeature extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    id: string
    name: string
    category: CulturalCategory
    slug: string
    description: string
    culturalSignificance?: string
    communityStory?: string
    heritageContext?: string
    imageUrl?: string
    address?: string
    town: string
  }
}

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface CulturalProximityResult {
  site: CulturalSite
  distance: number // in kilometers
}

export interface MapPerformanceMetrics {
  loadTime: number // milliseconds
  tileLoadTime: number
  memoryUsage: number // MB
  touchSuccessRate: number // percentage
}
```

## Best Practices

**Map Initialization**:
- Initialize map only once using `useRef` and proper `useEffect` dependencies
- Clean up map instance and markers in `useEffect` return function
- Handle `load` event before adding layers or sources

**Performance**:
- Use clustering for dense heritage site collections (>20 sites)
- Implement proper memory management with marker cleanup
- Optimize for mobile with touch interactions and reduced quality modes

**Cultural Heritage**:
- Include all cultural heritage metadata in GeoJSON properties
- Use category-based styling with cultural brand colors
- Validate coordinates within Brava Island bounds

**Error Handling**:
- Catch map initialization errors
- Provide fallback for geolocation unavailability
- Handle source/layer existence checks

**Remember**: All map components must prioritize mobile-first design, Brava Island geographic optimization, and authentic cultural heritage representation with proper community context integration.
