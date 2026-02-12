"use client";

import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Flag,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";
import type { AdminMediaListItem, MediaStatus } from "@/types/admin";

interface MediaQueueItemProps {
  media: AdminMediaListItem;
  onApprove: () => void;
  onFlag: () => void;
  onReject: () => void;
  onPreview?: () => void;
}

function StatusBadge({ status }: { status: MediaStatus }) {
  const styles: Record<MediaStatus, string> = {
    PENDING: "bg-surface-alt text-body",
    PROCESSING:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PENDING_REVIEW:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    FLAGGED:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    AVAILABLE:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const displayText = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${styles[status]}`}
    >
      {displayText}
    </span>
  );
}

function getSeverityLabel(severity: number): string | null {
  switch (severity) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    default:
      return null;
  }
}

function getSeverityColor(severity: number): string {
  switch (severity) {
    case 1:
      return "text-yellow-600 dark:text-yellow-400";
    case 2:
      return "text-orange-600 dark:text-orange-400";
    case 3:
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted";
  }
}

export function MediaQueueItem({
  media,
  onApprove,
  onFlag,
  onReject,
  onPreview,
}: MediaQueueItemProps) {
  const isPendingReview = media.status === "PENDING_REVIEW";
  const isFlagged = media.status === "FLAGGED";
  const showActions = isPendingReview || isFlagged;
  const isImage = media.contentType.startsWith("image/");

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <li className="hover:bg-surface-alt block transition duration-150 ease-in-out">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-bougainvillea-pink h-4 w-4" />
            <p className="text-ocean-blue truncate text-sm font-medium">
              {media.title}
            </p>
          </div>
          <div className="ml-2 shrink-0">
            <StatusBadge status={media.status} />
          </div>
        </div>

        {/* Media Preview */}
        <div className="mt-2 flex gap-4">
          {media.thumbnailUrl ? (
            <button
              onClick={isImage && onPreview ? onPreview : undefined}
              disabled={!isImage || !onPreview}
              className="group border-hairline bg-surface-alt relative h-20 w-28 shrink-0 overflow-hidden rounded border disabled:cursor-default"
            >
              <Image
                src={media.thumbnailUrl}
                alt={media.title}
                fill
                className="object-cover"
                unoptimized
              />
              {isImage && onPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Maximize2 className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              )}
            </button>
          ) : (
            <div className="border-hairline bg-surface-alt flex h-20 w-28 shrink-0 items-center justify-center rounded border">
              <ImageIcon className="text-muted h-8 w-8" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-muted text-xs">
              Type: <span className="font-medium">{media.contentType}</span>
            </p>
            {media.uploadedBy && (
              <p className="text-muted mt-1 text-xs">
                Uploaded by:{" "}
                <span className="font-medium">{media.uploaderDisplayName || media.uploadedBy}</span>
              </p>
            )}
            <p className="text-muted mt-1 text-xs">
              Date: {formatDate(media.createdAt)}
            </p>
            {media.severity > 0 && getSeverityLabel(media.severity) && (
              <p className="text-muted mt-1 text-xs">
                Severity:{" "}
                <span
                  className={`font-medium ${getSeverityColor(media.severity)}`}
                >
                  {getSeverityLabel(media.severity)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onApprove}
              className="inline-flex items-center rounded border border-transparent bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
            >
              <CheckCircle className="mr-1 h-3 w-3" /> Approve
            </button>
            <button
              onClick={onFlag}
              className="inline-flex items-center rounded border border-transparent bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
            >
              <Flag className="mr-1 h-3 w-3" /> Flag
            </button>
            <button
              onClick={onReject}
              className="inline-flex items-center rounded border border-transparent bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
            >
              <XCircle className="mr-1 h-3 w-3" /> Reject
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
