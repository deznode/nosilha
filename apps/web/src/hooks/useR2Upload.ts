"use client";

import { useState, useCallback, useRef } from "react";
import type {
  PresignResponse,
  MediaMetadataDto,
  ConfirmRequest,
} from "@/types/api";
import { BackendApiClient } from "@/lib/backend-api";

/**
 * Upload state representing the current status of an upload operation
 */
export type UploadState =
  | "idle"
  | "requesting-url"
  | "uploading"
  | "confirming"
  | "completed"
  | "error";

/**
 * Upload progress information
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  media: MediaMetadataDto;
  publicUrl: string;
}

/**
 * Options for configuring the upload
 */
export interface UploadOptions {
  entryId?: string;
  category?: string;
  description?: string;
  onProgress?: (progress: UploadProgress) => void;
  // EXIF metadata (privacy-processed)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTaken?: string; // ISO 8601
  cameraMake?: string;
  cameraModel?: string;
  orientation?: number;
  // Privacy tracking
  photoType?: string;
  gpsPrivacyLevel?: string;
  // Manual metadata
  approximateDate?: string;
  locationName?: string;
  photographerCredit?: string;
  archiveSource?: string;
}

/**
 * Return type for the useR2Upload hook
 */
export interface UseR2UploadReturn {
  /** Current upload state */
  state: UploadState;
  /** Upload progress (only valid during "uploading" state) */
  progress: UploadProgress;
  /** Error message if upload failed */
  error: string | null;
  /** Uploads a file to R2 storage with progress tracking */
  upload: (file: File, options?: UploadOptions) => Promise<UploadResult | null>;
  /** Cancels the current upload */
  cancel: () => void;
  /** Resets the hook state */
  reset: () => void;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Hook for uploading files to R2 storage with XHR progress tracking.
 *
 * Uses the presigned URL flow:
 * 1. Request presigned URL from backend
 * 2. Upload directly to R2 using XHR (with progress events)
 * 3. Confirm upload with backend
 *
 * @example
 * ```tsx
 * const { state, progress, error, upload, cancel, reset } = useR2Upload();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await upload(file, {
 *     category: "gallery",
 *     onProgress: (p) => console.log(`${p.percentage}%`),
 *   });
 *   if (result) {
 *     console.log("Uploaded:", result.publicUrl);
 *   }
 * };
 * ```
 */
export function useR2Upload(): UseR2UploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const apiClient = useRef(new BackendApiClient());

  /**
   * Validates file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported. Allowed types: JPEG, PNG, WebP, GIF, MP4`;
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${sizeMB}MB) exceeds maximum allowed (50MB)`;
    }
    if (file.size === 0) {
      return "File is empty";
    }
    return null;
  }, []);

  /**
   * Uploads file to R2 using XHR with progress tracking
   */
  const uploadToR2 = useCallback(
    (
      presignResponse: PresignResponse,
      file: File,
      onProgress?: (progress: UploadProgress) => void
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progressInfo: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            setProgress(progressInfo);
            onProgress?.(progressInfo);
          }
        };

        xhr.onload = () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          xhrRef.current = null;
          reject(new Error("Network error during upload"));
        };

        xhr.onabort = () => {
          xhrRef.current = null;
          reject(new Error("Upload cancelled"));
        };

        // Open PUT request to presigned URL
        xhr.open("PUT", presignResponse.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        // Send the file
        xhr.send(file);
      });
    },
    []
  );

  /**
   * Main upload function
   */
  const upload = useCallback(
    async (
      file: File,
      options?: UploadOptions
    ): Promise<UploadResult | null> => {
      // Reset state
      setError(null);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setState("error");
        return null;
      }

      try {
        // Step 1: Request presigned URL
        setState("requesting-url");
        const presignResponse = await apiClient.current.getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        // Step 2: Upload to R2 with progress tracking
        setState("uploading");
        await uploadToR2(presignResponse, file, options?.onProgress);

        // Step 3: Confirm upload
        setState("confirming");
        const confirmRequest: ConfirmRequest = {
          key: presignResponse.key,
          originalName: file.name,
          contentType: file.type,
          fileSize: file.size,
          entryId: options?.entryId,
          category: options?.category,
          description: options?.description,
          // EXIF metadata (privacy-processed)
          latitude: options?.latitude,
          longitude: options?.longitude,
          altitude: options?.altitude,
          dateTaken: options?.dateTaken,
          cameraMake: options?.cameraMake,
          cameraModel: options?.cameraModel,
          orientation: options?.orientation,
          // Privacy tracking
          photoType: options?.photoType,
          gpsPrivacyLevel: options?.gpsPrivacyLevel,
          // Manual metadata
          approximateDate: options?.approximateDate,
          locationName: options?.locationName,
          photographerCredit: options?.photographerCredit,
          archiveSource: options?.archiveSource,
        };
        const media = await apiClient.current.confirmUpload(confirmRequest);

        // Success!
        setState("completed");
        return {
          media,
          publicUrl: media.publicUrl ?? "",
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed unexpectedly";

        // Don't show error for cancellation
        if (message === "Upload cancelled") {
          setState("idle");
          return null;
        }

        setError(message);
        setState("error");
        return null;
      }
    },
    [validateFile, uploadToR2]
  );

  /**
   * Cancels the current upload
   */
  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setState("idle");
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);

  /**
   * Resets hook state
   */
  const reset = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setState("idle");
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    state,
    progress,
    error,
    upload,
    cancel,
    reset,
  };
}
