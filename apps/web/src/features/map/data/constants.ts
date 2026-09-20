import type { StyleSpecification } from "maplibre-gl";

// --- Basemap Styles (CARTO, open / no API key) ---
// Any host added here must also be allowed by the CSP in `next.config.ts`.
export const MAP_STYLES = {
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  darkMatter:
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

/**
 * Esri World Imagery as a raster style, for the explorer's satellite toggle. One
 * module-level object, so the map sees the same reference on every render and never
 * restyles for nothing.
 */
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri",
    },
  },
  layers: [{ id: "satellite", type: "raster", source: "satellite" }],
};

// --- Terrain DEM Source (AWS Terrarium tiles, open / no API key) ---
export const TERRAIN_DEM = {
  SOURCE_ID: "terrain-dem",
  TILES: [
    "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
  ],
  ENCODING: "terrarium",
  TILE_SIZE: 256,
  MAX_ZOOM: 14,
} as const;

// --- Map Configuration Constants ---
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lng: -24.7, lat: 14.86 },
  DEFAULT_ZOOM: 12.5,
  LOCATION_ZOOM: 15,
  PITCH_2D: 0,
  DEFAULT_BEARING: 0,
  TERRAIN_EXAGGERATION: 1.5,
  ANIMATION_DURATION: 2000,
  EASE_DURATION: 500,
  MAX_PITCH: 85,
} as const;

/** The map explorer's view, as prototyped. Spec 034 FR-011. */
export const EXPLORER_VIEW = {
  CENTER: { lng: -24.718, lat: 14.859 },
  ZOOM: 12.1,
  /** Where a list row eases to. */
  SELECT_ZOOM: 14.2,
  SELECT_DURATION: 900,
  RESET_DURATION: 800,
  PITCH_3D: 58,
  PITCH_DURATION: 700,
  /** Where "my location" eases to. */
  LOCATE_ZOOM: 14,
  /** Labels appear above this zoom (SPECS §3a). */
  LABEL_ZOOM: 13,
} as const;
