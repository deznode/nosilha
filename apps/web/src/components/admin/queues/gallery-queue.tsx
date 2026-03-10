"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  GalleryMedia,
  GalleryModerationAction,
  GalleryMediaStatus,
} from "@/types/gallery";
import { GalleryQueueItem } from "./gallery-queue-item";
import { GalleryEditModal } from "./gallery-edit-modal";
import { ExifReextractModal } from "./exif-reextract-modal";
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
  const [exifItem, setExifItem] = useState<GalleryMedia | null>(null);
  const [isExifModalOpen, setIsExifModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<GalleryMediaStatus | "ALL">(
    "ALL"
  );

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as GalleryMediaStatus | "ALL");
      setPage(0);
    },
    []
  );

  const galleryQuery = useAdminGallery({
    status: statusFilter,
    page,
    size: 20,
  });
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

  const handleReextractExif = (item: GalleryMedia) => {
    setExifItem(item);
    setIsExifModalOpen(true);
  };

  const handleExifClose = () => {
    setIsExifModalOpen(false);
    setExifItem(null);
  };

  const filterBar = (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="border-hairline bg-surface text-body rounded-md border px-3 py-1.5 text-sm font-medium"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="PROCESSING">Processing</option>
          <option value="ACTIVE">Active</option>
          <option value="FLAGGED">Flagged</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {!isLoading && (
          <p className="text-muted text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} to review
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {filterBar}
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
      <div className="space-y-4">
        {filterBar}
        <div className="border-hairline bg-canvas flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed">
          <div className="text-center">
            <p className="text-muted text-lg font-medium">
              No gallery items to review
            </p>
            <p className="text-muted mt-2 text-sm">
              {statusFilter === "ALL"
                ? "All caught up! Check back later for new submissions."
                : `No items with status "${statusFilter.replace("_", " ").toLowerCase()}".`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterBar}

      {items.map((item) => (
        <GalleryQueueItem
          key={item.id}
          item={item}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onPromoteToHero={handlePromoteToHero}
          onReextractExif={handleReextractExif}
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

      <ExifReextractModal
        isOpen={isExifModalOpen}
        item={exifItem}
        onClose={handleExifClose}
        onSuccess={() => galleryQuery.refetch()}
      />
    </div>
  );
}
