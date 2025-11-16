# Cultural Heritage Map Styling

This document provides styling patterns for cultural heritage map visualization using Nos Ilha brand colors and cultural significance markers.

## Cultural Category Styling

### Restaurant Markers (Traditional Cuisine)

```typescript
export const RESTAURANT_STYLE = {
  'circle-color': '#D90368', // Bougainvillea Pink
  'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12],
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 2,
  'circle-opacity': 0.9
}
```

### Hotel Markers (Community Hospitality)

```typescript
export const HOTEL_STYLE = {
  'circle-color': '#005A8D', // Ocean Blue
  'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12],
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 2,
  'circle-opacity': 0.9
}
```

### Landmark Markers (Historical Significance)

```typescript
export const LANDMARK_STYLE = {
  'circle-color': '#3E7D5A', // Valley Green
  'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 15], // Larger markers
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 3, // Thicker stroke for emphasis
  'circle-opacity': 0.95
}
```

### Beach Markers (Traditional Activities)

```typescript
export const BEACH_STYLE = {
  'circle-color': '#F7B801', // Sunny Yellow
  'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12],
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 2,
  'circle-opacity': 0.9
}
```

## Cultural Clustering Configuration

### Cluster Circle Styling

```typescript
export const CLUSTER_STYLE = {
  'circle-color': [
    'step',
    ['get', 'point_count'],
    '#51bbd6',  // 1-99 sites: Light blue
    100,
    '#f1f075',  // 100-749 sites: Yellow
    750,
    '#f28cb1'   // 750+ sites: Pink
  ],
  'circle-radius': [
    'step',
    ['get', 'point_count'],
    20,   // 1-99 sites
    100,
    30,   // 100-749 sites
    750,
    40    // 750+ sites
  ],
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 2
}
```

### Cluster Count Labels

```typescript
export const CLUSTER_COUNT_STYLE = {
  'text-field': '{point_count_abbreviated}',
  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
  'text-size': 12,
  'text-color': '#ffffff'
}
```

## Map Base Style Configuration

```typescript
export const MAPBOX_CONFIG = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-24.70, 14.85] as [number, number], // Brava Island center
  zoom: 12,
  maxBounds: [
    [-24.75, 14.80], // Southwest
    [-24.65, 14.90]  // Northeast
  ] as [[number, number], [number, number]]
}
```

## Custom Popup Styling

### Cultural Heritage Popup Template

```typescript
export const createCulturalPopup = (site: CulturalSite): mapboxgl.Popup => {
  const popupHTML = `
    <div class="cultural-popup">
      <h3 class="text-lg font-bold text-gray-900 mb-2">${site.name}</h3>
      ${site.imageUrl ? `<img src="${site.imageUrl}" alt="${site.name}" class="w-full h-32 object-cover rounded mb-2" />` : ''}
      <p class="text-sm text-gray-600 mb-2">${site.description}</p>
      ${site.communityStory ? `
        <div class="mt-2 p-2 bg-blue-50 rounded">
          <p class="text-xs text-blue-900 italic">"${site.communityStory}"</p>
        </div>
      ` : ''}
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-gray-500">${site.town}</span>
        <a href="/directory/entry/${site.slug}" class="text-xs text-blue-600 hover:underline">Learn More →</a>
      </div>
    </div>
  `

  return new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: '300px',
    className: 'cultural-heritage-popup'
  }).setHTML(popupHTML)
}
```

### Popup CSS Styling

```css
.cultural-heritage-popup .mapboxgl-popup-content {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Lato', sans-serif;
}

.cultural-heritage-popup .mapboxgl-popup-tip {
  border-top-color: #ffffff;
}

.cultural-popup h3 {
  font-family: 'Merriweather', serif;
  color: #1a202c;
}
```

## Category-Based Layer Configuration

```typescript
export const addCulturalLayers = (map: mapboxgl.Map) => {
  // Unclustered points with category-based styling
  map.addLayer({
    id: 'cultural-sites',
    type: 'circle',
    source: 'cultural-sites',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match',
        ['get', 'category'],
        'restaurant', '#D90368',
        'hotel', '#005A8D',
        'landmark', '#3E7D5A',
        'beach', '#F7B801',
        '#888888' // Default
      ],
      'circle-radius': [
        'match',
        ['get', 'category'],
        'landmark', ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 15], // Larger
        ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12] // Standard
      ],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': [
        'match',
        ['get', 'category'],
        'landmark', 3, // Thicker for landmarks
        2 // Standard
      ]
    }
  })
}
```

**Remember**: All styling must use Nos Ilha brand colors, prioritize mobile touch targets (min 8px radius at zoom 10), and include authentic cultural heritage context in popups.
