"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { MapPin, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/catalyst-ui/button";
import { useUpdateExif } from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import {
  extractMetadataFromUrl,
  formatGpsCoordinates,
  formatCameraInfo,
} from "@/lib/exif-utils";
import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import type { GalleryMedia, UpdateExifRequest } from "@/types/gallery";
import { isUserUploadMedia } from "@/types/gallery";
import type {
  ExtractedExifData,
  PhotoType,
  PhotoMetadata,
  GpsPrivacyLevel,
} from "@/types/media";

interface ExifReextractModalProps {
  isOpen: boolean;
  item: GalleryMedia | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type ExtractionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ExtractedExifData }
  | { status: "empty" }
  | { status: "error"; message: string };

interface FieldCheckState {
  latitude: boolean;
  longitude: boolean;
  altitude: boolean;
  dateTaken: boolean;
  cameraMake: boolean;
  cameraModel: boolean;
  orientation: boolean;
}

const FIELD_LABELS: Record<keyof FieldCheckState, string> = {
  latitude: "Latitude",
  longitude: "Longitude",
  altitude: "Altitude",
  dateTaken: "Date Taken",
  cameraMake: "Camera Make",
  cameraModel: "Camera Model",
  orientation: "Orientation",
};

const GPS_PRIVACY_MAP: Record<PhotoType, GpsPrivacyLevel> = {
  CULTURAL_SITE: "FULL",
  COMMUNITY_EVENT: "APPROXIMATE",
  PERSONAL: "STRIPPED",
};

function formatFieldValue(
  field: keyof FieldCheckState,
  value: unknown
): string {
  if (value == null) return "—";
  if (field === "latitude" || field === "longitude") {
    return typeof value === "number" ? value.toFixed(6) : String(value);
  }
  if (field === "altitude") {
    return `${Number(value).toFixed(1)}m`;
  }
  if (field === "dateTaken") {
    if (value instanceof Date) {
      return value.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return String(value);
  }
  return String(value);
}

function buildCurrentMetadata(item: GalleryMedia): PhotoMetadata | null {
  if (!isUserUploadMedia(item)) return null;
  return {
    latitude: item.latitude,
    longitude: item.longitude,
    altitude: item.altitude,
    dateTimeOriginal: item.dateTaken ? new Date(item.dateTaken) : undefined,
    make: item.cameraMake,
    model: item.cameraModel,
    orientation: item.orientation,
    photoType: (item.photoType as PhotoType) || "CULTURAL_SITE",
    gpsPrivacyLevel: (item.gpsPrivacyLevel as GpsPrivacyLevel) || "NONE",
    hasExifData: !!(item.latitude || item.cameraMake || item.dateTaken),
  };
}

function buildExtractedMetadata(
  data: ExtractedExifData,
  photoType: PhotoType
): PhotoMetadata {
  return {
    ...data,
    photoType,
    gpsPrivacyLevel:
      data.latitude && data.longitude ? GPS_PRIVACY_MAP[photoType] : "NONE",
    hasExifData: true,
  };
}

export function ExifReextractModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: ExifReextractModalProps) {
  const toast = useToast();
  const updateExif = useUpdateExif();
  const [extractionState, setExtractionState] = useState<ExtractionState>({
    status: "idle",
  });
  const [checks, setChecks] = useState<FieldCheckState>({
    latitude: true,
    longitude: true,
    altitude: true,
    dateTaken: true,
    cameraMake: true,
    cameraModel: true,
    orientation: true,
  });
  const [photoType, setPhotoType] = useState<PhotoType>("CULTURAL_SITE");

  const doExtract = useCallback(async () => {
    if (!item || !isUserUploadMedia(item) || !item.publicUrl) return;

    setExtractionState({ status: "loading" });
    try {
      const data = await extractMetadataFromUrl(item.publicUrl);
      if (!data) {
        setExtractionState({ status: "empty" });
        return;
      }

      // Check if any meaningful data was extracted
      const hasAnyData =
        data.latitude != null ||
        data.longitude != null ||
        data.altitude != null ||
        data.dateTimeOriginal != null ||
        data.make != null ||
        data.model != null;

      if (!hasAnyData) {
        setExtractionState({ status: "empty" });
        return;
      }

      setExtractionState({ status: "success", data });

      // Default checks to fields that have values
      setChecks({
        latitude: data.latitude != null,
        longitude: data.longitude != null,
        altitude: data.altitude != null,
        dateTaken: data.dateTimeOriginal != null,
        cameraMake: data.make != null,
        cameraModel: data.model != null,
        orientation: data.orientation != null && data.orientation !== 1,
      });
    } catch {
      setExtractionState({
        status: "error",
        message:
          "Failed to extract EXIF data. The image may not be accessible.",
      });
    }
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      // Reset state when modal opens, then start extraction
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExtractionState({ status: "idle" });
      setPhotoType("CULTURAL_SITE");
      doExtract();
    }
  }, [isOpen, item, doExtract]);

  const handleToggle = (field: keyof FieldCheckState) => {
    setChecks((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleApply = () => {
    if (!item || extractionState.status !== "success") return;

    const { data } = extractionState;
    const request: UpdateExifRequest = {};

    if (checks.latitude && data.latitude != null)
      request.latitude = data.latitude;
    if (checks.longitude && data.longitude != null)
      request.longitude = data.longitude;
    if (checks.altitude && data.altitude != null)
      request.altitude = data.altitude;
    if (checks.dateTaken && data.dateTimeOriginal) {
      request.dateTaken = data.dateTimeOriginal.toISOString();
    }
    if (checks.cameraMake && data.make) request.cameraMake = data.make;
    if (checks.cameraModel && data.model) request.cameraModel = data.model;
    if (checks.orientation && data.orientation != null)
      request.orientation = data.orientation;

    // Include photoType always; guard gpsPrivacyLevel on GPS data being applied
    request.photoType = photoType;
    const hasGpsData =
      (checks.latitude && data.latitude != null) ||
      (checks.longitude && data.longitude != null);
    request.gpsPrivacyLevel = hasGpsData ? GPS_PRIVACY_MAP[photoType] : "NONE";

    updateExif.mutate(
      { mediaId: item.id, data: request },
      {
        onSuccess: () => {
          toast.success("EXIF metadata updated").show();
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update EXIF metadata").show();
        },
      }
    );
  };

  if (!item) return null;

  const extractedData =
    extractionState.status === "success" ? extractionState.data : null;

  // Build extracted metadata for MetadataBadges
  const extractedMetadata = extractedData
    ? buildExtractedMetadata(extractedData, photoType)
    : null;
  const currentMetadata = buildCurrentMetadata(item);

  // Get extracted field values mapped to comparison table fields
  const getExtractedValue = (field: keyof FieldCheckState): unknown => {
    if (!extractedData) return null;
    switch (field) {
      case "latitude":
        return extractedData.latitude;
      case "longitude":
        return extractedData.longitude;
      case "altitude":
        return extractedData.altitude;
      case "dateTaken":
        return extractedData.dateTimeOriginal;
      case "cameraMake":
        return extractedData.make;
      case "cameraModel":
        return extractedData.model;
      case "orientation":
        return extractedData.orientation;
    }
  };

  const hasCheckedFields = Object.values(checks).some(Boolean);

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="bg-surface shadow-floating relative w-full max-w-2xl transform overflow-hidden rounded-2xl text-left transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-ocean-blue h-5 w-5" />
                <DialogTitle className="text-body text-lg font-semibold">
                  Re-extract EXIF Metadata
                </DialogTitle>
              </div>
              <Button plain onClick={onClose} aria-label="Close modal">
                <X data-slot="icon" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
              {/* Loading */}
              {extractionState.status === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="text-ocean-blue mb-3 h-8 w-8 animate-spin" />
                  <p className="text-muted text-sm">
                    Extracting EXIF data from image...
                  </p>
                </div>
              )}

              {/* Empty */}
              {extractionState.status === "empty" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <MapPin className="text-muted mb-3 h-8 w-8" />
                  <p className="text-body font-medium">
                    No EXIF metadata found in this image
                  </p>
                  <p className="text-muted mt-1 text-sm">
                    The image may have had its metadata stripped during
                    processing.
                  </p>
                  <Button outline onClick={doExtract} className="mt-4">
                    <RefreshCw data-slot="icon" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Error */}
              {extractionState.status === "error" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-status-error font-medium">
                    Extraction Failed
                  </p>
                  <p className="text-muted mt-1 text-sm">
                    {extractionState.message}
                  </p>
                  <Button outline onClick={doExtract} className="mt-4">
                    <RefreshCw data-slot="icon" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Success: Comparison */}
              {extractionState.status === "success" && extractedData && (
                <div className="space-y-5">
                  {/* Metadata Badges */}
                  <div className="space-y-2">
                    <h4 className="text-body text-sm font-medium">
                      Extracted Metadata
                    </h4>
                    <MetadataBadges metadata={extractedMetadata} />
                  </div>

                  {/* Current Metadata Badges */}
                  {currentMetadata && (
                    <div className="space-y-2">
                      <h4 className="text-body text-sm font-medium">
                        Current Metadata
                      </h4>
                      <MetadataBadges metadata={currentMetadata} />
                    </div>
                  )}

                  {/* GPS Summary */}
                  {extractedData.latitude != null &&
                    extractedData.longitude != null && (
                      <div className="bg-valley-green/5 rounded-card border-valley-green/20 border p-3">
                        <p className="text-valley-green text-sm font-medium">
                          GPS Location Found
                        </p>
                        <p className="text-body mt-0.5 text-sm">
                          {formatGpsCoordinates(
                            extractedData.latitude,
                            extractedData.longitude
                          )}
                        </p>
                      </div>
                    )}

                  {/* Camera Info */}
                  {(extractedData.make || extractedData.model) && (
                    <div className="bg-ocean-blue/5 rounded-card border-ocean-blue/20 border p-3">
                      <p className="text-ocean-blue text-sm font-medium">
                        Camera Info
                      </p>
                      <p className="text-body mt-0.5 text-sm">
                        {formatCameraInfo(
                          extractedData.make,
                          extractedData.model
                        )}
                      </p>
                    </div>
                  )}

                  {/* Comparison Table */}
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-alt">
                          <th className="text-muted px-3 py-2 text-left font-medium">
                            Field
                          </th>
                          <th className="text-muted px-3 py-2 text-left font-medium">
                            Extracted Value
                          </th>
                          <th className="text-muted w-16 px-3 py-2 text-center font-medium">
                            Apply
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(
                          Object.keys(FIELD_LABELS) as Array<
                            keyof FieldCheckState
                          >
                        ).map((field) => {
                          const extractedVal = getExtractedValue(field);
                          if (extractedVal == null) return null;

                          return (
                            <tr key={field} className="hover:bg-surface-alt/50">
                              <td className="text-body px-3 py-2 font-medium">
                                {FIELD_LABELS[field]}
                              </td>
                              <td className="text-body px-3 py-2">
                                {formatFieldValue(field, extractedVal)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={checks[field]}
                                  onChange={() => handleToggle(field)}
                                  className="text-ocean-blue focus:ring-ocean-blue border-hairline h-4 w-4 rounded"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Photo Type Selector */}
                  <PhotoTypeSelector
                    value={photoType}
                    onChange={setPhotoType}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            {extractionState.status === "success" && (
              <div className="border-hairline flex items-center justify-end gap-3 border-t px-6 py-4">
                <Button plain onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  color="blue"
                  onClick={handleApply}
                  disabled={!hasCheckedFields || updateExif.isPending}
                >
                  {updateExif.isPending ? "Applying..." : "Apply Selected"}
                </Button>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
