# Mapbox Agent Knowledge Base

## Domain Expertise: Mapbox GL JS + React Integration for Tourism Platform

### Architecture Overview
```
React Component Layer (Map UI)
    ↓
Mapbox GL JS Layer (Map Engine)
    ↓
Data Layer (GeoJSON, Vector Tiles)
    ↓
Mapbox Studio (Style & Data)
```

### Key Technologies
- **Mapbox GL JS v3.x** - Core mapping library
- **React 18/19** - Component framework
- **TypeScript** - Type safety for mapping APIs
- **Tailwind CSS** - Styling integration
- **React Hooks** - State management for map interactions

## Core Integration Patterns

### 1. React + Mapbox GL JS Integration
```typescript
// InteractiveMap.tsx
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface InteractiveMapProps {
  entries: DirectoryEntry[]
  onEntrySelect?: (entry: DirectoryEntry) => void
  className?: string
}

export function InteractiveMap({ entries, onEntrySelect, className }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // Tourism-friendly style
      center: [-24.713, 14.867], // Brava Island coordinates
      zoom: 12,
      pitch: 45, // 3D perspective for better tourism experience
      bearing: 0
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      addTourismLayers()
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Add tourism-specific layers
  const addTourismLayers = () => {
    if (!map.current) return

    // Add directory entries as source
    map.current.addSource('directory-entries', {
      type: 'geojson',
      data: createGeoJSONFromEntries(entries),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    // Add cluster layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'directory-entries',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', 100, '#f1f075', 750, '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 100, 30, 750, 40
        ]
      }
    })

    // Add individual points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'directory-entries',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': getCategoryColor,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })

    // Add click handlers
    map.current.on('click', 'unclustered-point', handleMarkerClick)
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {children}
    </div>
  )
}
```

### 2. Category-Based Marker Styling
```typescript
// CategoryMarkerIcon.tsx
interface CategoryMarkerIconProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
}

export function CategoryMarkerIcon({ category, size = 'md', selected }: CategoryMarkerIconProps) {
  const categoryConfig = {
    RESTAURANT: { 
      icon: '🍽️', 
      color: '#E53E3E', 
      bgColor: '#FED7D7' 
    },
    HOTEL: { 
      icon: '🏨', 
      color: '#3182CE', 
      bgColor: '#BEE3F8' 
    },
    LANDMARK: { 
      icon: '🏛️', 
      color: '#805AD5', 
      bgColor: '#E9D8FD' 
    },
    BEACH: { 
      icon: '🏖️', 
      color: '#38A169', 
      bgColor: '#C6F6D5' 
    }
  }

  const config = categoryConfig[category]
  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size]

  return (
    <div 
      className={`
        ${sizeClass} rounded-full flex items-center justify-center
        border-2 shadow-lg transition-all duration-200
        ${selected ? 'scale-110 shadow-xl' : 'hover:scale-105'}
      `}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.color,
        color: config.color
      }}
    >
      <span>{config.icon}</span>
    </div>
  )
}

// Create custom HTML markers for better performance
function createCustomMarker(entry: DirectoryEntry): HTMLElement {
  const el = document.createElement('div')
  el.className = 'marker'
  
  // Render CategoryMarkerIcon to HTML
  const iconHtml = ReactDOMServer.renderToString(
    <CategoryMarkerIcon 
      category={entry.category} 
      size="md" 
    />
  )
  
  el.innerHTML = iconHtml
  el.addEventListener('click', () => {
    // Handle marker click
  })
  
  return el
}
```

### 3. Advanced Map Controls
```typescript
// MapFilterControl.tsx
interface MapFilterControlProps {
  categories: Category[]
  selectedCategories: Category[]
  onCategoryToggle: (category: Category) => void
  onViewportChange: (bounds: mapboxgl.LngLatBounds) => void
}

export function MapFilterControl({ 
  categories, 
  selectedCategories, 
  onCategoryToggle,
  onViewportChange 
}: MapFilterControlProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute top-4 left-4 z-10">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <FilterIcon className="w-5 h-5" />
      </button>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-3">Filter Places</h3>
          
          {categories.map((category) => (
            <div key={category} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="mr-2"
              />
              <label htmlFor={category} className="flex items-center">
                <CategoryMarkerIcon category={category} size="sm" />
                <span className="ml-2 text-sm">{category}</span>
              </label>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => categories.forEach(cat => 
                !selectedCategories.includes(cat) && onCategoryToggle(cat)
              )}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={() => selectedCategories.forEach(onCategoryToggle)}
              className="text-xs text-red-600 hover:text-red-800 ml-3"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4. Geolocation & Location Services
```typescript
// useGeolocation.ts
interface GeolocationState {
  position: GeolocationPosition | null
  error: GeolocationPositionError | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false
  })

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new Error('Geolocation not supported') as any
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    navigator.geolocation.getCurrentPosition(
      (position) => setState({
        position,
        error: null,
        loading: false
      }),
      (error) => setState({
        position: null,
        error,
        loading: false
      }),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  return { ...state, getCurrentPosition }
}

// Integration with map
function addUserLocationToMap(map: mapboxgl.Map, position: GeolocationPosition) {
  const { latitude, longitude } = position.coords

  // Add user location marker
  new mapboxgl.Marker({
    color: '#007cbf',
    scale: 1.2
  })
  .setLngLat([longitude, latitude])
  .addTo(map)

  // Fly to user location
  map.flyTo({
    center: [longitude, latitude],
    zoom: 15,
    duration: 2000
  })

  // Add accuracy circle
  map.addSource('user-location-accuracy', {
    type: 'geojson',
    data: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  })

  map.addLayer({
    id: 'user-location-accuracy',
    type: 'circle',
    source: 'user-location-accuracy',
    paint: {
      'circle-radius': position.coords.accuracy,
      'circle-color': '#007cbf',
      'circle-opacity': 0.2,
      'circle-stroke-color': '#007cbf',
      'circle-stroke-width': 1
    }
  })
}
```

## Tourism-Specific Features

### 1. Point of Interest (POI) Clustering
```typescript
interface ClusterFeature extends mapboxgl.MapboxGeoJSONFeature {
  properties: {
    cluster: true
    cluster_id: number
    point_count: number
  }
}

function handleClusterClick(e: mapboxgl.MapMouseEvent & { features?: ClusterFeature[] }) {
  if (!map.current || !e.features) return

  const feature = e.features[0]
  const clusterId = feature.properties.cluster_id
  
  // Get cluster expansion zoom
  const source = map.current.getSource('directory-entries') as mapboxgl.GeoJSONSource
  source.getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return

    map.current!.easeTo({
      center: (feature.geometry as any).coordinates,
      zoom: zoom || 14,
      duration: 1000
    })
  })
}

// Custom cluster styling based on POI types
function getClusterColor(pointCount: number, features: any[]) {
  // Analyze cluster contents
  const categories = features.map(f => f.properties.category)
  const majority = getMajorityCategory(categories)
  
  const categoryColors = {
    RESTAURANT: '#E53E3E',
    HOTEL: '#3182CE', 
    LANDMARK: '#805AD5',
    BEACH: '#38A169'
  }
  
  return categoryColors[majority] || '#51bbd6'
}
```

### 2. Route Planning & Directions
```typescript
// Integration with Mapbox Directions API
interface RouteRequest {
  origin: [number, number]
  destination: [number, number]
  waypoints?: [number, number][]
  profile?: 'driving' | 'walking' | 'cycling'
}

async function getDirections(request: RouteRequest) {
  const { origin, destination, waypoints = [], profile = 'walking' } = request
  
  const coordinates = [origin, ...waypoints, destination]
    .map(coord => coord.join(','))
    .join(';')

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?` +
    `steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
  )

  return response.json()
}

function addRouteToMap(map: mapboxgl.Map, route: any) {
  // Add route source
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: route.geometry
    }
  })

  // Add route layer
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b9ff3',
      'line-width': 8,
      'line-opacity': 0.8
    }
  })

  // Add turn-by-turn directions
  addDirectionMarkers(map, route.legs[0].steps)
}
```

### 3. Mobile-Optimized Touch Interactions
```typescript
// Touch-friendly map configuration
const mobileMapConfig = {
  touchZoomRotate: true,
  touchPitch: true,
  dragPan: true,
  scrollZoom: true,
  boxZoom: false, // Disable for mobile
  dragRotate: false, // Disable for mobile
  keyboard: false, // Disable for mobile
  doubleClickZoom: true
}

// Handle mobile gestures
function setupMobileGestures(map: mapboxgl.Map) {
  let touchStartTime = 0
  let touchStartPosition = { x: 0, y: 0 }

  map.on('touchstart', (e) => {
    touchStartTime = Date.now()
    touchStartPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  })

  map.on('touchend', (e) => {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime
    const touchEndPosition = { 
      x: e.changedTouches[0].clientX, 
      y: e.changedTouches[0].clientY 
    }
    
    const distance = Math.sqrt(
      Math.pow(touchEndPosition.x - touchStartPosition.x, 2) +
      Math.pow(touchEndPosition.y - touchStartPosition.y, 2)
    )

    // Long press detection
    if (touchDuration > 500 && distance < 10) {
      handleLongPress(e.lngLat)
    }
  })
}

function handleLongPress(lngLat: mapboxgl.LngLat) {
  // Show context menu or add custom marker
  const popup = new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(`
      <div class="p-2">
        <button class="block w-full text-left p-2 hover:bg-gray-100">
          Add to favorites
        </button>
        <button class="block w-full text-left p-2 hover:bg-gray-100">
          Get directions
        </button>
      </div>
    `)
    .addTo(map.current!)
}
```

## Performance Optimization

### 1. Vector Tile Optimization
```typescript
// Custom vector tile source for better performance
function addOptimizedDirectorySource(map: mapboxgl.Map, entries: DirectoryEntry[]) {
  // For large datasets, use vector tiles
  if (entries.length > 1000) {
    map.addSource('directory-entries', {
      type: 'vector',
      tiles: [`${API_BASE_URL}/tiles/{z}/{x}/{y}.pbf`],
      minzoom: 6,
      maxzoom: 14
    })
  } else {
    // Use GeoJSON for smaller datasets
    map.addSource('directory-entries', {
      type: 'geojson',
      data: createGeoJSONFromEntries(entries),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })
  }
}

// Lazy loading for better initial performance
function useLazyMapLoading() {
  const [shouldLoadMap, setShouldLoadMap] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return { shouldLoadMap, observerRef }
}
```

### 2. Memory Management
```typescript
// Proper cleanup to prevent memory leaks
export function InteractiveMap({ entries }: InteractiveMapProps) {
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    return () => {
      // Clean up markers
      markers.current.forEach(marker => marker.remove())
      markers.current = []

      // Clean up map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update markers efficiently
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    entries.forEach(entry => {
      if (entry.latitude && entry.longitude) {
        const marker = new mapboxgl.Marker(createCustomMarker(entry))
          .setLngLat([entry.longitude, entry.latitude])
          .addTo(map.current!)
        
        markers.current.push(marker)
      }
    })
  }, [entries])
}
```

## Common File Structure

```
frontend/src/components/ui/
├── interactive-map.tsx           # Main map component
├── map-filter-control.tsx        # Filter controls
├── category-marker-icon.tsx      # Custom markers
└── map-utils/
    ├── geojson-utils.ts         # GeoJSON data transformation
    ├── mapbox-styles.ts         # Custom map styles
    ├── clustering.ts            # Clustering utilities
    └── directions.ts            # Route planning

frontend/src/hooks/
├── useGeolocation.ts            # Geolocation hook
├── useMapbox.ts                 # Mapbox integration hook
└── useDirections.ts             # Routing hook

frontend/src/types/
├── mapbox.ts                    # Mapbox-specific types
└── geojson.ts                   # GeoJSON type definitions
```

## Brava Island Specific Configuration

### Map Bounds & Initial View
```typescript
const BRAVA_ISLAND_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-24.73, 14.84],  // Southwest coordinates
  [-24.68, 14.89]   // Northeast coordinates
]

const BRAVA_ISLAND_CENTER: [number, number] = [-24.713, 14.867]

// Tourism-optimized initial configuration
const TOURISM_MAP_CONFIG = {
  center: BRAVA_ISLAND_CENTER,
  zoom: 12,
  pitch: 45, // 3D view for better landscape visualization
  bearing: 0,
  maxBounds: BRAVA_ISLAND_BOUNDS,
  minZoom: 10,
  maxZoom: 18
}
```

### Custom Mapbox Style for Tourism
```javascript
// Custom style emphasizing tourism features
const TOURISM_MAP_STYLE = {
  version: 8,
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8'
    }
  },
  layers: [
    // Ocean with tourism-friendly blue
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#a8e6cf'
      }
    },
    // Emphasize beaches and coastal areas
    {
      id: 'beaches',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'sand'],
      paint: {
        'fill-color': '#f7dc6f',
        'fill-opacity': 0.8
      }
    }
    // Additional tourism-focused styling...
  ]
}
```

This knowledge base provides comprehensive coverage of Mapbox GL JS integration patterns, React components, and tourism-specific mapping features for the Nos Ilha platform.