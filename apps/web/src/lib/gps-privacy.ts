/**
 * GPS Privacy Utilities
 *
 * Implements tiered GPS privacy handling based on photo type.
 * Processes coordinates client-side before upload to ensure
 * personal location data never reaches the server.
 */

import type {
  ExtractedExifData,
  PhotoType,
  GpsPrivacyLevel,
} from "@/types/media";

/**
 * GPS precision levels by decimal places.
 * Reference: https://en.wikipedia.org/wiki/Decimal_degrees
 *
 * 6 decimals = ~11cm precision (survey-grade)
 * 5 decimals = ~1.1m precision
 * 4 decimals = ~11m precision
 * 3 decimals = ~111m precision (~100m)
 * 2 decimals = ~1.1km precision
 */
export const GPS_PRECISION = {
  FULL: 6, // Survey-grade precision
  APPROXIMATE: 3, // ~100m accuracy (neighborhood level)
} as const;

/**
 * Rounds a coordinate to the specified number of decimal places.
 */
function roundCoordinate(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Result of applying GPS privacy transformation.
 */
export interface GpsPrivacyResult {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gpsPrivacyLevel: GpsPrivacyLevel;
}

/**
 * Applies GPS privacy transformation based on photo type.
 *
 * @param metadata - Extracted EXIF data (may or may not contain GPS)
 * @param photoType - User-selected photo type determining privacy level
 * @returns Transformed GPS data with privacy level indicator
 *
 * @example
 * ```ts
 * const result = applyGpsPrivacy(metadata, 'COMMUNITY_EVENT');
 * // GPS rounded to ~100m accuracy
 *
 * const result = applyGpsPrivacy(metadata, 'PERSONAL');
 * // GPS stripped entirely
 * ```
 */
export function applyGpsPrivacy(
  metadata: ExtractedExifData | null,
  photoType: PhotoType
): GpsPrivacyResult {
  // No GPS data available
  if (!metadata?.latitude || !metadata?.longitude) {
    return {
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      gpsPrivacyLevel: "NONE",
    };
  }

  switch (photoType) {
    case "CULTURAL_SITE":
      // Preserve full GPS precision for documented landmarks
      return {
        latitude: roundCoordinate(metadata.latitude, GPS_PRECISION.FULL),
        longitude: roundCoordinate(metadata.longitude, GPS_PRECISION.FULL),
        altitude: metadata.altitude,
        gpsPrivacyLevel: "FULL",
      };

    case "COMMUNITY_EVENT":
      // Round to ~100m accuracy for community gatherings
      return {
        latitude: roundCoordinate(metadata.latitude, GPS_PRECISION.APPROXIMATE),
        longitude: roundCoordinate(
          metadata.longitude,
          GPS_PRECISION.APPROXIMATE
        ),
        altitude: metadata.altitude
          ? Math.round(metadata.altitude)
          : undefined,
        gpsPrivacyLevel: "APPROXIMATE",
      };

    case "PERSONAL":
      // Strip GPS entirely for private photos
      return {
        latitude: undefined,
        longitude: undefined,
        altitude: undefined,
        gpsPrivacyLevel: "STRIPPED",
      };

    default:
      // Defensive: treat unknown as personal (most restrictive)
      return {
        latitude: undefined,
        longitude: undefined,
        altitude: undefined,
        gpsPrivacyLevel: "STRIPPED",
      };
  }
}

/**
 * Returns a human-readable description of the GPS privacy level.
 */
export function getPrivacyDescription(level: GpsPrivacyLevel): string {
  switch (level) {
    case "FULL":
      return "Exact location preserved";
    case "APPROXIMATE":
      return "Location rounded to ~100m";
    case "STRIPPED":
      return "Location removed";
    case "NONE":
      return "No location data";
  }
}

/**
 * Returns a human-readable description of the photo type and its GPS handling.
 */
export function getPhotoTypeDescription(photoType: PhotoType): string {
  switch (photoType) {
    case "CULTURAL_SITE":
      return "Cultural Site - Full GPS preserved for mapping heritage locations";
    case "COMMUNITY_EVENT":
      return "Community Event - GPS rounded to ~100m for neighborhood privacy";
    case "PERSONAL":
      return "Personal - GPS removed entirely for privacy";
  }
}

/**
 * Brava Island approximate bounds for location validation (optional use).
 */
export const BRAVA_BOUNDS = {
  minLat: 14.8,
  maxLat: 14.92,
  minLon: -24.75,
  maxLon: -24.65,
} as const;

/**
 * Checks if coordinates fall within Brava Island bounds.
 * Useful for validating that GPS data is plausible for the archive.
 */
export function isWithinBravaIsland(lat: number, lon: number): boolean {
  return (
    lat >= BRAVA_BOUNDS.minLat &&
    lat <= BRAVA_BOUNDS.maxLat &&
    lon >= BRAVA_BOUNDS.minLon &&
    lon <= BRAVA_BOUNDS.maxLon
  );
}
