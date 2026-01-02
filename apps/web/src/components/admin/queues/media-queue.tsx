"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { MediaQueueItem } from "./media-queue-item";
import { MediaActionModal } from "./media-action-modal";
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

  const filteredMedia = mediaItems.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    const matchesStatus = filterStatus === "ALL" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  if (isLoading) {
    return (
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex gap-4">
                <div className="h-20 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
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
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged</option>
            <option value="AVAILABLE">Available</option>
            <option value="PROCESSING">Processing</option>
          </select>
          <button className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Filter className="mr-2 h-4 w-4" /> Newest First
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="block w-full rounded-md border border-slate-200 bg-white py-2 pr-3 pl-10 leading-5 placeholder-slate-400 focus:border-[var(--color-ocean-blue)] focus:ring-1 focus:ring-[var(--color-ocean-blue)] focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:placeholder-slate-500"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Media List */}
      <div className="overflow-hidden border border-slate-200 bg-white shadow sm:rounded-md dark:border-slate-700 dark:bg-slate-800">
        {filteredMedia.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No media items found
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMedia.map((media) => (
              <MediaQueueItem
                key={media.id}
                media={media}
                onApprove={() => handleApprove(media.id)}
                onFlag={() => handleFlag(media.id, media.title)}
                onReject={() => handleReject(media.id, media.title)}
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
    </div>
  );
}
