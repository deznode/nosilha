import type { FeatureCollection, Polygon } from "geojson";
import zonesData from "./zones.json";
import trailsData from "./trails.json";

// --- Cinematic Intro Configuration ---
export const INTRO_CONFIG = {
  PEAK_POSITION: { lng: -24.708, lat: 14.851 }, // Monte Fontainhas
  START_ALTITUDE: 4000,
  END_ALTITUDE: 2000,
  HOLD_DURATION: 1500,
  SWEEP_DURATION: 4000,
  SETTLE_DURATION: 1000,
  ORBIT_RADIUS: 0.025,
} as const;

// --- Map Configuration Constants ---
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lng: -24.7, lat: 14.86 },
  DEFAULT_ZOOM: 12.5,
  LOCATION_ZOOM: 15,
  PITCH_3D: 60,
  PITCH_2D: 0,
  DEFAULT_BEARING: 0,
  LOCATION_BEARING: -10,
  TERRAIN_EXAGGERATION: 1.5,
  ANIMATION_DURATION: 2000,
  RESET_DURATION: 1500,
  EASE_DURATION: 500,
  MAX_PITCH: 85,
  DEM_TILE_SIZE: 512,
  DEM_MAX_ZOOM: 14,
} as const;

// --- Illustration Mode Configuration ---
export const ILLUSTRATION_BOUNDS: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [-24.75, 14.89],
  [-24.66, 14.89],
  [-24.66, 14.83],
  [-24.75, 14.83],
];

export const ILLUSTRATION_URL = "/brava-illustration.jpg";

export const ENABLE_ILLUSTRATION_MODE = false;

// --- GeoJSON Data (imported from files) ---
export const ZONES_GEOJSON = zonesData as FeatureCollection<
  Polygon,
  { name: string; color: string; zoomTo?: number }
>;
export const TRAILS_GEOJSON = trailsData as FeatureCollection;

// --- Utility: Calculate Bearing Between Two Points ---
export function calculateBearing(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
