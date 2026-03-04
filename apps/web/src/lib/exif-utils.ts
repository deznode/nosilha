/**
 * EXIF Metadata Extraction Utilities
 *
 * Client-side extraction of EXIF metadata from image files using exifr.
 * Supports JPEG, PNG, HEIC (iPhone), AVIF, and WebP formats.
 */

import exifr from "exifr";
import type { ExtractedExifData } from "@/types/media";

/**
 * Configuration for exifr to extract only needed tags.
 * This minimizes parsing time and bundle size impact.
 */
const EXIFR_OPTIONS = {
  // Enable segments we need
  tiff: true,
  exif: true,
  gps: true,
  translateValues: false,

  // Disable segments we don't need
  iptc: false,
  xmp: false,
  icc: false,
  jfif: false,

  // Only extract specific tags for performance
  pick: [
    // GPS - raw TIFF tags (exifr converts to lowercase latitude/longitude in output)
    "GPSLatitude",
    "GPSLatitudeRef",
    "GPSLongitude",
    "GPSLongitudeRef",
    "GPSAltitude",
    "GPSAltitudeRef",

    // Date
    "DateTimeOriginal",
    "CreateDate",

    // Camera
    "Make",
    "Model",

    // Image properties
    "Orientation",
    "ImageWidth",
    "ImageHeight",
    "ExifImageWidth",
    "ExifImageHeight",
  ],

  // Don't fail on minor issues
  silentErrors: true,
};

/**
 * Extracts EXIF metadata from an image file.
 *
 * @param file - The image file to extract metadata from
 * @returns Extracted metadata or null if extraction fails or no data found
 *
 * @example
 * ```ts
 * const metadata = await extractMetadata(file);
 * if (metadata) {
 *   console.log(`Photo taken: ${metadata.dateTimeOriginal}`);
 *   console.log(`Location: ${metadata.latitude}, ${metadata.longitude}`);
 * }
 * ```
 */
export async function extractMetadata(
  file: File
): Promise<ExtractedExifData | null> {
  try {
    const data = await exifr.parse(file, EXIFR_OPTIONS);

    if (!data) {
      return null;
    }

    // Normalize the extracted data
    return {
      // GPS - exifr normalizes to decimal degrees
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.GPSAltitude,

      // Date - prefer DateTimeOriginal, fall back to CreateDate
      dateTimeOriginal: data.DateTimeOriginal ?? data.CreateDate,

      // Camera info
      make: data.Make,
      model: data.Model,

      // Orientation (1-8, default 1 = normal)
      orientation: data.Orientation ?? 1,

      // Image dimensions - try multiple sources
      width: data.ImageWidth ?? data.ExifImageWidth,
      height: data.ImageHeight ?? data.ExifImageHeight,
    };
  } catch (error) {
    // Log for debugging but don't throw
    console.warn(
      `EXIF extraction failed for ${file.name}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Extracts EXIF metadata from an image URL.
 *
 * Uses exifr's built-in UrlFetcher which only reads the first ~500 bytes,
 * avoiding a full image download.
 *
 * @param url - The public image URL to extract metadata from
 * @returns Extracted metadata or null if extraction fails or no data found
 */
export async function extractMetadataFromUrl(
  url: string
): Promise<ExtractedExifData | null> {
  try {
    const data = await exifr.parse(url, EXIFR_OPTIONS);

    if (!data) {
      return null;
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.GPSAltitude,
      dateTimeOriginal: data.DateTimeOriginal ?? data.CreateDate,
      make: data.Make,
      model: data.Model,
      orientation: data.Orientation ?? 1,
      width: data.ImageWidth ?? data.ExifImageWidth,
      height: data.ImageHeight ?? data.ExifImageHeight,
    };
  } catch (error) {
    console.warn(
      `EXIF extraction failed for URL ${url}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Checks if the extracted metadata contains GPS coordinates.
 */
export function hasGpsData(metadata: ExtractedExifData | null): boolean {
  return !!(metadata?.latitude && metadata?.longitude);
}

/**
 * Checks if the extracted metadata contains a capture date.
 */
export function hasDateData(metadata: ExtractedExifData | null): boolean {
  return !!metadata?.dateTimeOriginal;
}

/**
 * Checks if the extracted metadata contains camera information.
 */
export function hasCameraData(metadata: ExtractedExifData | null): boolean {
  return !!(metadata?.make || metadata?.model);
}

/**
 * Checks if a file is a HEIC/HEIF image (common on iPhones).
 */
export function isHeicFile(file: File): boolean {
  const heicTypes = ["image/heic", "image/heif"];
  const heicExtensions = [".heic", ".heif"];

  if (heicTypes.includes(file.type.toLowerCase())) {
    return true;
  }

  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return heicExtensions.includes(extension);
}

/**
 * Formats GPS coordinates for display.
 *
 * @example
 * formatGpsCoordinates(14.8672, -24.7045) // "14.8672°N, 24.7045°W"
 */
export function formatGpsCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

/**
 * Formats camera information for display.
 *
 * @example
 * formatCameraInfo("Apple", "iPhone 13 Pro") // "Apple iPhone 13 Pro"
 * formatCameraInfo(undefined, "Canon EOS") // "Canon EOS"
 */
export function formatCameraInfo(
  make?: string,
  model?: string
): string | undefined {
  if (!make && !model) return undefined;
  if (!make) return model;
  if (!model) return make;

  // Avoid duplication (some cameras include make in model)
  if (model.toLowerCase().startsWith(make.toLowerCase())) {
    return model;
  }

  return `${make} ${model}`;
}
