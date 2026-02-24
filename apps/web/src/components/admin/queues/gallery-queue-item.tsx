"use client";

import { useState } from "react";
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
  Star,
  Pencil,
} from "lucide-react";
import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
import type { AiStatusResponse, AiModerationStatus } from "@/types/ai";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";
import { Button } from "@/components/catalyst-ui/button";
import { AiStatusBadge } from "./ai-status-badge";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface GalleryQueueItemProps {
  item: GalleryMedia;
  onStatusChange: (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => void;
  onEdit?: (item: GalleryMedia) => void;
  onPromoteToHero?: (id: string) => void;
  aiStatus?: AiStatusResponse;
}

export function GalleryQueueItem({
  item,
  onStatusChange,
  onEdit,
  onPromoteToHero,
  aiStatus,
}: GalleryQueueItemProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const canPromoteToHero =
    isUserUploadMedia(item) &&
    item.entryId &&
    item.publicUrl &&
    item.status === "ACTIVE";

  const getFullImageUrl = (): string | null => {
    if (isUserUploadMedia(item)) {
      return item.publicUrl;
    }
    if (isExternalMedia(item)) {
      if (item.mediaType === "VIDEO") {
        if (item.thumbnailUrl) return item.thumbnailUrl;
        if (item.platform === "YOUTUBE" && item.externalId) {
          return `https://img.youtube.com/vi/${item.externalId}/maxresdefault.jpg`;
        }
        return null;
      }
      return item.url || item.thumbnailUrl;
    }
    return null;
  };

  const fullImageUrl = getFullImageUrl();

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
    let thumbnailUrl: string | null = null;
    if (isUserUploadMedia(item)) {
      thumbnailUrl = item.publicUrl;
    } else if (isExternalMedia(item)) {
      thumbnailUrl = item.thumbnailUrl;
      if (!thumbnailUrl && item.platform === "YOUTUBE" && item.externalId) {
        thumbnailUrl = `https://img.youtube.com/vi/${item.externalId}/maxresdefault.jpg`;
      }
    }

    if (thumbnailUrl) {
      return (
        <Image
          src={thumbnailUrl}
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
      {/* Thumbnail - clickable to open lightbox */}
      <button
        type="button"
        onClick={() => fullImageUrl && setIsLightboxOpen(true)}
        disabled={!fullImageUrl}
        className="focus:ring-ocean-blue relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-default disabled:hover:scale-100"
        aria-label={
          fullImageUrl ? "View full-size image" : "No image available"
        }
      >
        {getThumbnail()}
      </button>

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
              {!item.showInGallery && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Hidden from gallery
                </span>
              )}
              <span className="text-muted text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              {aiStatus?.moderationStatus && (
                <AiStatusBadge
                  moderationStatus={
                    aiStatus.moderationStatus as AiModerationStatus
                  }
                />
              )}
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
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button outline onClick={() => onEdit(item)}>
              <Pencil data-slot="icon" />
              Edit
            </Button>
          )}
          <Button
            color="green"
            onClick={() => onStatusChange(item.id, "APPROVE")}
            disabled={item.status === "ACTIVE"}
          >
            <CheckCircle data-slot="icon" />
            Approve
          </Button>
          <Button
            color="yellow"
            onClick={() => onStatusChange(item.id, "FLAG", "Needs review")}
            disabled={item.status === "FLAGGED"}
          >
            <Flag data-slot="icon" />
            Flag
          </Button>
          <Button
            color="red"
            onClick={() =>
              onStatusChange(
                item.id,
                "REJECT",
                "Does not meet quality standards"
              )
            }
            disabled={item.status === "REJECTED"}
          >
            <XCircle data-slot="icon" />
            Reject
          </Button>
          {canPromoteToHero && onPromoteToHero && (
            <Button
              color="blue"
              onClick={() => onPromoteToHero(item.id)}
              title="Set this image as the hero image for the directory entry"
            >
              <Star data-slot="icon" />
              Set as Hero
            </Button>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {fullImageUrl && (
        <ImageLightbox
          photos={[
            {
              src: fullImageUrl,
              alt: item.title || "Gallery item",
              location: "",
              date: new Date(item.createdAt).toLocaleDateString(),
              description: item.description || "",
              author: isExternalMedia(item)
                ? item.author || undefined
                : undefined,
            },
          ]}
          initialIndex={0}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
