"use client";

/**
 * Photo Upload Hook
 *
 * Orchestrating hook that combines EXIF metadata extraction with the R2 upload flow.
 * Handles GPS privacy transformation and manual metadata for historical photos.
 */

import { useState, useCallback } from "react";
import { useR2Upload, type UploadResult } from "./useR2Upload";
import { extractMetadata } from "@/lib/exif-utils";
import { applyGpsPrivacy, type GpsPrivacyResult } from "@/lib/gps-privacy";
import type {
  ExtractedExifData,
  PhotoType,
  PhotoMetadata,
  ManualMetadata,
  ConfirmRequestMetadata,
} from "@/types/media";

/**
 * Photo upload state representing the current status
 */
export type PhotoUploadState =
  | "idle"
  | "extracting" // Extracting EXIF metadata
  | "ready" // File selected, metadata extracted, ready to upload
  | "requesting-url"
  | "uploading"
  | "confirming"
  | "completed"
  | "error";

/**
 * Return type for the usePhotoUpload hook
 */
export interface UsePhotoUploadReturn {
  /** Current upload state */
  state: PhotoUploadState;

  /** Upload progress (percentage) */
  progress: number;

  /** Error message if any */
  error: string | null;

  /** Selected file */
  file: File | null;

  /** Preview URL for selected file */
  previewUrl: string | null;

  /** Extracted + processed metadata */
  metadata: PhotoMetadata | null;

  /** Whether the photo has EXIF data */
  hasExifData: boolean;

  /** Currently selected photo type */
  photoType: PhotoType;

  /** Manual metadata for historical photos */
  manualMetadata: ManualMetadata;

  /**
   * Select a file and extract metadata
   */
  selectFile: (file: File) => Promise<void>;

  /**
   * Change the photo type (updates GPS privacy)
   */
  setPhotoType: (type: PhotoType) => void;

  /**
   * Update manual metadata fields
   */
  setManualMetadata: (metadata: Partial<ManualMetadata>) => void;

  /**
   * Upload the file with all metadata
   */
  upload: (options?: {
    category?: string;
    description?: string;
  }) => Promise<UploadResult | null>;

  /**
   * Clear the selected file and reset state
   */
  reset: () => void;
}

/**
 * Hook for uploading photos with EXIF metadata extraction and GPS privacy.
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   file,
 *   metadata,
 *   hasExifData,
 *   photoType,
 *   selectFile,
 *   setPhotoType,
 *   upload,
 *   reset
 * } = usePhotoUpload();
 *
 * // Select file
 * await selectFile(inputFile);
 *
 * // Change privacy level
 * setPhotoType('CULTURAL_SITE');
 *
 * // Upload
 * const result = await upload({ category: 'gallery' });
 * ```
 */
export function usePhotoUpload(): UsePhotoUploadReturn {
  // Internal upload hook
  const {
    state: uploadState,
    progress: uploadProgress,
    error: uploadError,
    upload: r2Upload,
    reset: r2Reset,
  } = useR2Upload();

  // Local state
  const [state, setState] = useState<PhotoUploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedExif, setExtractedExif] = useState<ExtractedExifData | null>(
    null
  );
  const [photoType, setPhotoTypeState] = useState<PhotoType>("COMMUNITY_EVENT");
  const [manualMetadata, setManualMetadataState] = useState<ManualMetadata>({});

  // Track if we have EXIF data
  const hasExifData = extractedExif !== null;

  // Compute GPS privacy result
  const gpsResult: GpsPrivacyResult = applyGpsPrivacy(extractedExif, photoType);

  // Build complete metadata object
  const metadata: PhotoMetadata | null = file
    ? {
        // EXIF data
        latitude: gpsResult.latitude,
        longitude: gpsResult.longitude,
        altitude: gpsResult.altitude,
        dateTimeOriginal: extractedExif?.dateTimeOriginal,
        make: extractedExif?.make,
        model: extractedExif?.model,
        orientation: extractedExif?.orientation ?? 1,
        width: extractedExif?.width,
        height: extractedExif?.height,
        // Privacy
        photoType,
        gpsPrivacyLevel: gpsResult.gpsPrivacyLevel,
        // Manual
        ...manualMetadata,
        // Status
        hasExifData,
      }
    : null;

  // Map upload state to our state
  const effectiveState: PhotoUploadState =
    state === "ready"
      ? uploadState === "idle"
        ? "ready"
        : uploadState === "completed"
          ? "completed"
          : uploadState === "error"
            ? "error"
            : uploadState
      : state;

  // Combine errors
  const effectiveError = error || uploadError;

  /**
   * Select a file and extract metadata
   */
  const selectFile = useCallback(
    async (newFile: File) => {
      // Cleanup previous preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setFile(newFile);
      setError(null);
      setManualMetadataState({});
      setState("extracting");

      // Create preview URL
      const preview = URL.createObjectURL(newFile);
      setPreviewUrl(preview);

      try {
        // Extract EXIF metadata
        const exif = await extractMetadata(newFile);
        setExtractedExif(exif);
        setState("ready");
      } catch (err) {
        console.warn("EXIF extraction failed:", err);
        setExtractedExif(null);
        setState("ready");
      }
    },
    [previewUrl]
  );

  /**
   * Change photo type (updates GPS privacy)
   */
  const setPhotoType = useCallback((type: PhotoType) => {
    setPhotoTypeState(type);
  }, []);

  /**
   * Update manual metadata
   */
  const setManualMetadata = useCallback((partial: Partial<ManualMetadata>) => {
    setManualMetadataState((prev) => ({ ...prev, ...partial }));
  }, []);

  /**
   * Upload the file with all metadata
   */
  const upload = useCallback(
    async (options?: {
      category?: string;
      description?: string;
    }): Promise<UploadResult | null> => {
      if (!file || !metadata) {
        setError("No file selected");
        return null;
      }

      // Build metadata for confirm request
      const confirmMetadata: ConfirmRequestMetadata = {
        // EXIF (privacy-processed)
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        altitude: metadata.altitude,
        dateTaken: metadata.dateTimeOriginal?.toISOString(),
        cameraMake: metadata.make,
        cameraModel: metadata.model,
        orientation: metadata.orientation,
        // Privacy
        photoType: metadata.photoType,
        gpsPrivacyLevel: metadata.gpsPrivacyLevel,
        // Manual
        approximateDate: metadata.approximateDate,
        locationName: metadata.locationName,
        photographerCredit: metadata.photographerCredit,
        archiveSource: metadata.archiveSource,
      };

      // Call R2 upload with extended metadata
      const result = await r2Upload(file, {
        category: options?.category,
        description: options?.description,
        // Pass metadata to be included in confirm request
        ...(confirmMetadata as Record<string, unknown>),
      });

      return result;
    },
    [file, metadata, r2Upload]
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setExtractedExif(null);
    setPhotoTypeState("COMMUNITY_EVENT");
    setManualMetadataState({});
    setError(null);
    setState("idle");
    r2Reset();
  }, [previewUrl, r2Reset]);

  return {
    state: effectiveState,
    progress: uploadProgress.percentage,
    error: effectiveError,
    file,
    previewUrl,
    metadata,
    hasExifData,
    photoType,
    manualMetadata,
    selectFile,
    setPhotoType,
    setManualMetadata,
    upload,
    reset,
  };
}
