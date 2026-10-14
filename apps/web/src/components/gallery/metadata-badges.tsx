"use client";

/**
 * Metadata Badges
 *
 * Compact badges showing extracted/entered photo metadata status.
 * Used in the upload preview to show what data is available.
 */

import { clsx } from "clsx";
import { useFormatter } from "next-intl";
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
      className={clsx(
        "rounded-button inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
        variantClasses[variant]
      )}
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
  const format = useFormatter();
  if (!metadata) {
    return null;
  }

  // EXIF dates carry no zone and are read as the uploader's local time, so they are
  // written out in the browser's zone rather than the site's UTC. This preview only
  // renders in the browser, so the zone cannot differ from a server render.
  const dateLabel = metadata.dateTimeOriginal
    ? format.dateTime(metadata.dateTimeOriginal, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
