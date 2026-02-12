"use client";

/**
 * Metadata Badges
 *
 * Compact badges showing extracted/entered photo metadata status.
 * Used in the upload preview to show what data is available.
 */

import {
  Calendar,
  Camera,
  MapPin,
  MapPinOff,
  AlertCircle,
  FileEdit,
} from "lucide-react";
import type { PhotoMetadata, GpsPrivacyLevel } from "@/types/media";
import { formatCameraInfo } from "@/lib/exif-utils";

interface MetadataBadgesProps {
  metadata: PhotoMetadata | null;
  showManualPrompt?: boolean;
}

interface BadgeProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  variant: "neutral" | "success" | "warning" | "muted" | "info";
}

function Badge({ icon: Icon, label, variant }: BadgeProps) {
  const variantClasses = {
    neutral: "bg-surface text-body",
    success: "bg-valley-green/10 text-valley-green",
    warning: "bg-sunny-yellow/10 text-sunny-yellow-deep",
    muted: "bg-surface-alt text-muted",
    info: "bg-ocean-blue/10 text-ocean-blue",
  };

  return (
    <div
      className={`rounded-button inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}
    >
      <Icon size={12} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function getGpsBadgeProps(
  privacyLevel: GpsPrivacyLevel
): Pick<BadgeProps, "icon" | "label" | "variant"> {
  switch (privacyLevel) {
    case "FULL":
      return {
        icon: MapPin,
        label: "Full location",
        variant: "success",
      };
    case "APPROXIMATE":
      return {
        icon: MapPin,
        label: "~100m accuracy",
        variant: "warning",
      };
    case "STRIPPED":
      return {
        icon: MapPinOff,
        label: "Location removed",
        variant: "muted",
      };
    case "NONE":
      return {
        icon: AlertCircle,
        label: "No location data",
        variant: "muted",
      };
  }
}

export function MetadataBadges({
  metadata,
  showManualPrompt = false,
}: MetadataBadgesProps) {
  if (!metadata) {
    return null;
  }

  // Format date for display
  const dateLabel = metadata.dateTimeOriginal
    ? metadata.dateTimeOriginal.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : metadata.approximateDate || "Date unknown";

  // Format camera info
  const cameraLabel =
    formatCameraInfo(metadata.make, metadata.model) || "Unknown camera";

  // Get GPS badge props
  const gpsBadge = getGpsBadgeProps(metadata.gpsPrivacyLevel);

  return (
    <div className="flex flex-wrap gap-2">
      {/* Date badge */}
      <Badge
        icon={Calendar}
        label={dateLabel}
        variant={
          metadata.dateTimeOriginal || metadata.approximateDate
            ? "neutral"
            : "muted"
        }
      />

      {/* Camera badge */}
      <Badge
        icon={Camera}
        label={cameraLabel}
        variant={metadata.make || metadata.model ? "neutral" : "muted"}
      />

      {/* GPS status badge */}
      <Badge
        icon={gpsBadge.icon}
        label={gpsBadge.label}
        variant={gpsBadge.variant}
      />

      {/* Manual entry prompt */}
      {showManualPrompt && !metadata.hasExifData && (
        <Badge icon={FileEdit} label="Add details" variant="info" />
      )}
    </div>
  );
}
