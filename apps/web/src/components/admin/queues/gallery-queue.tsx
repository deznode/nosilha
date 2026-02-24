"use client";

import { useState, useMemo } from "react";
import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
import { GalleryQueueItem } from "./gallery-queue-item";
import { GalleryEditModal } from "./gallery-edit-modal";
import {
  useAdminGallery,
  useAiStatus,
  useUpdateGalleryStatus,
  usePromoteToHeroImage,
} from "@/hooks/queries/admin";
import { Pagination, fromAdminQueueResponse } from "@/components/ui/pagination";

export function GalleryQueue() {
  const [mediaToEdit, setMediaToEdit] = useState<GalleryMedia | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  const galleryQuery = useAdminGallery({ page, size: 20 });
  const updateGallery = useUpdateGalleryStatus();
  const promoteToHero = usePromoteToHeroImage();

  const items = useMemo(
    () => galleryQuery.data?.items ?? [],
    [galleryQuery.data]
  );
  const isLoading = galleryQuery.isLoading;
  const paginationData = fromAdminQueueResponse(galleryQuery.data);

  const galleryMediaIds = useMemo(() => items.map((item) => item.id), [items]);
  const aiStatusQuery = useAiStatus(galleryMediaIds);
  const aiStatuses = useMemo(
    () => new Map((aiStatusQuery.data ?? []).map((s) => [s.mediaId, s])),
    [aiStatusQuery.data]
  );

  const handleStatusChange = (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => {
    updateGallery.mutate({
      id,
      request: { action, reason, adminNotes: notes },
    });
  };

  const handlePromoteToHero = (mediaId: string) => {
    promoteToHero.mutate(mediaId);
  };

  const handleEdit = (item: GalleryMedia) => {
    setMediaToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setMediaToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-alt h-32 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-hairline bg-canvas flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed">
        <div className="text-center">
          <p className="text-muted text-lg font-medium">
            No gallery items to review
          </p>
          <p className="text-muted mt-2 text-sm">
            All caught up! Check back later for new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted text-sm">
          {items.length} {items.length === 1 ? "item" : "items"} to review
        </p>
      </div>

      {items.map((item) => (
        <GalleryQueueItem
          key={item.id}
          item={item}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onPromoteToHero={handlePromoteToHero}
          aiStatus={aiStatuses.get(item.id)}
        />
      ))}

      {paginationData && (
        <Pagination
          {...paginationData}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      <GalleryEditModal
        isOpen={isEditModalOpen}
        item={mediaToEdit}
        onClose={handleEditClose}
      />
    </div>
  );
}
