"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { MediaQueueItem } from "./media-queue-item";
import { MediaActionModal } from "./media-action-modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type {
  AdminMediaListItem,
  MediaStatus,
  MediaModerationAction,
} from "@/types/admin";

interface MediaQueueProps {
  mediaItems: AdminMediaListItem[];
  isLoading?: boolean;
  onStatusChange?: (
    id: string,
    action: MediaModerationAction,
    reason?: string,
    notes?: string
  ) => void;
}

export function MediaQueue({
  mediaItems,
  isLoading,
  onStatusChange,
}: MediaQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<MediaStatus | "ALL">("ALL");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: MediaModerationAction | null;
    mediaId: string | null;
    mediaTitle: string | null;
  }>({
    isOpen: false,
    action: null,
    mediaId: null,
    mediaTitle: null,
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredMedia = mediaItems.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Transform media items to lightbox photos format (only images)
  // Note: highResSrc would come from AdminMediaDetail.publicUrl when available
  const lightboxPhotos = filteredMedia
    .filter((m) => m.contentType.startsWith("image/"))
    .map((m) => ({
      src: m.thumbnailUrl || "/placeholder-image.jpg",
      alt: m.title,
      location: "Brava Island",
      date: new Date(m.createdAt).toLocaleDateString(),
      description: m.title,
      // Map uploadedBy to author for proper attribution
      author: m.uploadedBy,
      // highResSrc would be populated from detail view if needed
      highResSrc: undefined,
    }));

  const handleApprove = (id: string) => {
    onStatusChange?.(id, "APPROVE");
  };

  const handleFlag = (id: string, title: string) => {
    setModalState({
      isOpen: true,
      action: "FLAG",
      mediaId: id,
      mediaTitle: title,
    });
  };

  const handleReject = (id: string, title: string) => {
    setModalState({
      isOpen: true,
      action: "REJECT",
      mediaId: id,
      mediaTitle: title,
    });
  };

  const handleModalConfirm = (reason: string, notes?: string) => {
    if (modalState.mediaId && modalState.action) {
      onStatusChange?.(modalState.mediaId, modalState.action, reason, notes);
    }
    setModalState({
      isOpen: false,
      action: null,
      mediaId: null,
      mediaTitle: null,
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      action: null,
      mediaId: null,
      mediaTitle: null,
    });
  };

  const handlePreview = (mediaId: string) => {
    // Find the index of this media item in the lightbox photos array
    const mediaIndex = filteredMedia.findIndex((m) => m.id === mediaId);
    if (mediaIndex === -1) return;

    // Map the filteredMedia index to the lightboxPhotos index
    const imageItems = filteredMedia.filter((m) =>
      m.contentType.startsWith("image/")
    );
    const lightboxIdx = imageItems.findIndex((m) => m.id === mediaId);

    if (lightboxIdx !== -1) {
      setLightboxIndex(lightboxIdx);
      setLightboxOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-surface-alt mb-2 h-4 w-1/3 rounded" />
              <div className="flex gap-4">
                <div className="bg-surface-alt h-20 w-28 rounded" />
                <div className="flex-1">
                  <div className="bg-surface-alt mb-2 h-3 w-full rounded" />
                  <div className="bg-surface-alt h-3 w-2/3 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as MediaStatus | "ALL")
            }
            className="border-hairline bg-surface text-muted hover:bg-surface-alt rounded-md border px-3 py-1.5 text-sm font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged</option>
            <option value="AVAILABLE">Available</option>
            <option value="PROCESSING">Processing</option>
          </select>
          <button className="border-hairline bg-surface text-muted hover:bg-surface-alt flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">
            <Filter className="mr-2 h-4 w-4" /> Newest First
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="border-hairline bg-surface placeholder-muted block w-full rounded-md border py-2 pr-3 pl-10 leading-5 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Media List */}
      <div className="border-hairline bg-surface overflow-hidden border shadow sm:rounded-md">
        {filteredMedia.length === 0 ? (
          <div className="text-muted p-8 text-center">No media items found</div>
        ) : (
          <ul className="divide-hairline divide-y">
            {filteredMedia.map((media) => (
              <MediaQueueItem
                key={media.id}
                media={media}
                onApprove={() => handleApprove(media.id)}
                onFlag={() => handleFlag(media.id, media.title)}
                onReject={() => handleReject(media.id, media.title)}
                onPreview={() => handlePreview(media.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Action Modal */}
      <MediaActionModal
        isOpen={modalState.isOpen}
        action={modalState.action || "FLAG"}
        mediaTitle={modalState.mediaTitle || ""}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
