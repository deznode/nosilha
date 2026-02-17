"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink,
  Upload,
} from "lucide-react";
import type { GalleryMedia } from "@/types/gallery";
import type { AiStatusResponse, AiModerationStatus } from "@/types/ai";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";
import { Button } from "@/components/catalyst-ui/button";
import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { AiStatusBadge } from "./ai-status-badge";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface AiMediaItemProps {
  item: GalleryMedia;
  aiStatus?: AiStatusResponse;
  onTriggerAnalysis?: (mediaId: string) => void;
  onViewAiReview?: (mediaId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isEligibleForAi?: boolean;
  isTriggerPending?: boolean;
}

export function AiMediaItem({
  item,
  aiStatus,
  onTriggerAnalysis,
  onViewAiReview,
  isSelected,
  onToggleSelect,
  isEligibleForAi,
  isTriggerPending,
}: AiMediaItemProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getFullImageUrl = (): string | null => {
    if (isUserUploadMedia(item)) {
      return item.publicUrl;
    }
    if (isExternalMedia(item)) {
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
        <span className="bg-surface-alt text-brand inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
          <Upload size={10} /> User Upload
        </span>
      );
    }

    return (
      <span className="bg-surface-alt text-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
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
    }

    if (thumbnailUrl) {
      return (
        <Image
          src={thumbnailUrl}
          alt={item.title || "Gallery item"}
          fill
          sizes="80px"
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

  const hasPendingReview = aiStatus?.moderationStatus === "PENDING_REVIEW";

  return (
    <div className="border-hairline bg-surface flex items-start gap-4 rounded-card border p-4 transition-shadow hover:shadow-medium">
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="flex flex-shrink-0 items-center pt-1">
          <Checkbox
            checked={isSelected ?? false}
            onChange={() => onToggleSelect(item.id)}
            color="blue"
          />
        </div>
      )}

      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => fullImageUrl && setIsLightboxOpen(true)}
        disabled={!fullImageUrl}
        className="focus-ring relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-button transition-transform hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
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
              <span className="text-muted text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              {aiStatus?.moderationStatus && (
                <AiStatusBadge
                  moderationStatus={
                    aiStatus.moderationStatus as AiModerationStatus
                  }
                  onClick={
                    onViewAiReview ? () => onViewAiReview(item.id) : undefined
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
                    className="text-brand hover:underline"
                  >
                    View source
                  </a>
                </div>
              )}
              {item.curatedBy && <div>Curated by: {item.curatedBy}</div>}
            </>
          )}
        </div>

        {/* AI Actions */}
        <div className="flex flex-wrap gap-2">
          {isEligibleForAi && onTriggerAnalysis && (
            <Button
              color="dark"
              onClick={() => onTriggerAnalysis(item.id)}
              disabled={isTriggerPending}
            >
              {isTriggerPending ? (
                <Loader2 data-slot="icon" className="animate-spin" />
              ) : (
                <Sparkles data-slot="icon" />
              )}
              {aiStatus?.aiProcessed ? "Re-analyze" : "Analyze with AI"}
            </Button>
          )}
          {hasPendingReview && onViewAiReview && (
            <Button color="blue" onClick={() => onViewAiReview(item.id)}>
              <Sparkles data-slot="icon" />
              Review
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
