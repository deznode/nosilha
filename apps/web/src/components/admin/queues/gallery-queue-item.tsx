"use client";

import Image from "next/image";
import {
  CheckCircle,
  Flag,
  XCircle,
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink,
  Upload,
} from "lucide-react";
import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";

interface GalleryQueueItemProps {
  item: GalleryMedia;
  onStatusChange: (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => void;
}

export function GalleryQueueItem({
  item,
  onStatusChange,
}: GalleryQueueItemProps) {
  const getMediaIcon = () => {
    if (isExternalMedia(item)) {
      if (item.mediaType === "VIDEO") return <Video size={14} />;
      if (item.mediaType === "AUDIO") return <Music size={14} />;
      return <ImageIcon size={14} />;
    }
    return <Upload size={14} />;
  };

  const getSourceBadge = () => {
    if (isUserUploadMedia(item)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <Upload size={10} /> User Upload
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
        <ExternalLink size={10} /> {item.platform}
      </span>
    );
  };

  const getThumbnail = () => {
    if (isUserUploadMedia(item) && item.publicUrl) {
      return (
        <Image
          src={item.publicUrl}
          alt={item.title || "Gallery item"}
          fill
          className="object-cover"
          unoptimized
        />
      );
    }

    if (isExternalMedia(item) && item.thumbnailUrl) {
      return (
        <Image
          src={item.thumbnailUrl}
          alt={item.title || "Gallery item"}
          fill
          className="object-cover"
          unoptimized
        />
      );
    }

    return (
      <div className="bg-surface-alt flex h-full w-full items-center justify-center">
        {getMediaIcon()}
      </div>
    );
  };

  return (
    <div className="border-hairline bg-surface flex items-start gap-4 rounded-xl border p-4 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {getThumbnail()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-body truncate font-semibold">
              {item.title || "Untitled"}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {getSourceBadge()}
              {item.category && (
                <span className="bg-surface-alt text-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
                  {getMediaIcon()} {item.category}
                </span>
              )}
              <span className="text-muted text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {item.description && (
          <p className="text-muted mb-3 line-clamp-2 text-sm">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        <div className="text-muted mb-3 space-y-1 text-xs">
          {isUserUploadMedia(item) && (
            <>
              {item.uploadedBy && <div>Uploaded by: {item.uploadedBy}</div>}
              {item.fileName && <div>File: {item.fileName}</div>}
              {item.fileSize && (
                <div>Size: {(item.fileSize / 1024 / 1024).toFixed(2)} MB</div>
              )}
            </>
          )}
          {isExternalMedia(item) && (
            <>
              {item.author && <div>Author: {item.author}</div>}
              {item.url && (
                <div className="flex items-center gap-1">
                  <ExternalLink size={10} />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View source
                  </a>
                </div>
              )}
              {item.curatedBy && <div>Curated by: {item.curatedBy}</div>}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange(item.id, "APPROVE")}
            disabled={item.status === "ACTIVE"}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-valley-green)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={() => onStatusChange(item.id, "FLAG", "Needs review")}
            disabled={item.status === "FLAGGED"}
            className="inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Flag size={14} /> Flag
          </button>
          <button
            onClick={() =>
              onStatusChange(
                item.id,
                "REJECT",
                "Does not meet quality standards"
              )
            }
            disabled={item.status === "REJECTED"}
            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <XCircle size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
