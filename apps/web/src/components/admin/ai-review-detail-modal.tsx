"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X, Check, XCircle, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/catalyst-ui/button";
import {
  useAiRunDetail,
  useApproveAiRun,
  useRejectAiRun,
  useApproveEditedAiRun,
} from "@/hooks/queries/admin";
import { getGalleryMediaById } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { GalleryMedia } from "@/types/gallery";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";

interface AiReviewDetailModalProps {
  runId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AiReviewDetailModal({
  runId,
  isOpen,
  onClose,
}: AiReviewDetailModalProps) {
  const toast = useToast();
  const { data: detail, isLoading: isDetailLoading } = useAiRunDetail(runId);
  const approveMutation = useApproveAiRun();
  const rejectMutation = useRejectAiRun();
  const approveEditedMutation = useApproveEditedAiRun();

  const [mediaImage, setMediaImage] = useState<GalleryMedia | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  // Editable fields
  const [altText, setAltText] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Reject flow
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  // Initialize form when detail loads
  const originalSnapshot = useMemo(
    () => ({
      altText: detail?.resultAltText ?? "",
      description: detail?.resultDescription ?? "",
      tags: (detail?.resultTags ?? []).join(", "),
    }),
    [detail]
  );

  useEffect(() => {
    if (detail) {
      setAltText(originalSnapshot.altText);
      setDescription(originalSnapshot.description);
      setTagsInput(originalSnapshot.tags);
      setIsRejecting(false);
      setRejectNotes("");
    }
  }, [detail, originalSnapshot]);

  // Fetch gallery media image
  useEffect(() => {
    if (!detail?.mediaId) return;

    let cancelled = false;
    const loadMedia = async () => {
      if (cancelled) return;
      setIsMediaLoading(true);

      try {
        const media = await getGalleryMediaById(detail.mediaId);
        if (!cancelled) setMediaImage(media ?? null);
      } catch {
        if (!cancelled) setMediaImage(null);
      } finally {
        if (!cancelled) setIsMediaLoading(false);
      }
    };

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [detail?.mediaId]);

  // Check if fields have been edited
  const hasEdits = useMemo(
    () =>
      altText !== originalSnapshot.altText ||
      description !== originalSnapshot.description ||
      tagsInput !== originalSnapshot.tags,
    [altText, description, tagsInput, originalSnapshot]
  );

  // Resolve preview URL from the discriminated GalleryMedia union
  const imageUrl = useMemo((): string | null => {
    if (!mediaImage) return null;
    if (isUserUploadMedia(mediaImage)) return mediaImage.publicUrl;
    if (isExternalMedia(mediaImage)) return mediaImage.thumbnailUrl;
    return null;
  }, [mediaImage]);

  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    approveEditedMutation.isPending;

  const handleApprove = async () => {
    if (!runId) return;
    try {
      await approveMutation.mutateAsync(runId);
      toast.success("AI results approved").show();
      onClose();
    } catch {
      toast.error("Failed to approve AI results").show();
    }
  };

  const handleReject = async () => {
    if (!runId) return;
    try {
      await rejectMutation.mutateAsync({
        runId,
        request: rejectNotes ? { notes: rejectNotes } : undefined,
      });
      toast.success("AI results rejected").show();
      onClose();
    } catch {
      toast.error("Failed to reject AI results").show();
    }
  };

  const handleApproveEdited = async () => {
    if (!runId) return;
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await approveEditedMutation.mutateAsync({
        runId,
        request: {
          altText: altText || undefined,
          description: description || undefined,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
        },
      });
      toast.success("AI results approved with edits").show();
      onClose();
    } catch {
      toast.error("Failed to approve with edits").show();
    }
  };

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="bg-surface relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-start justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-orange-500" />
                <DialogTitle className="text-body text-lg font-semibold">
                  AI Review
                </DialogTitle>
              </div>
              <Button plain onClick={onClose}>
                <X data-slot="icon" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {isDetailLoading ? (
                <div className="space-y-4">
                  <div className="bg-surface-alt h-48 animate-pulse rounded-lg" />
                  <div className="bg-surface-alt h-8 animate-pulse rounded" />
                  <div className="bg-surface-alt h-20 animate-pulse rounded" />
                </div>
              ) : detail ? (
                <div className="space-y-5">
                  {/* Image Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    {isMediaLoading ? (
                      <div className="bg-surface-alt h-full w-full animate-pulse" />
                    ) : imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Media preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-surface-alt flex h-full w-full items-center justify-center">
                        <span className="text-muted text-sm">
                          No preview available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div className="flex flex-wrap gap-2">
                    {detail.providersUsed.map((provider) => (
                      <span
                        key={provider}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>

                  {/* Alt Text */}
                  <div>
                    <label className="text-body mb-1 block text-sm font-medium">
                      Alt Text
                    </label>
                    <textarea
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      rows={3}
                      className="border-hairline bg-canvas text-body w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="AI-generated alt text..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-body mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="border-hairline bg-canvas text-body w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="AI-generated description..."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-body mb-1 block text-sm font-medium">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="border-hairline bg-canvas text-body w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="tag1, tag2, tag3..."
                    />
                  </div>

                  {/* Reject Notes (conditional) */}
                  {isRejecting && (
                    <div>
                      <label className="text-body mb-1 block text-sm font-medium">
                        Rejection Notes
                      </label>
                      <textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        rows={2}
                        className="border-hairline bg-canvas text-body w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Optional reason for rejection..."
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted text-center text-sm">
                  Failed to load AI review details.
                </p>
              )}
            </div>

            {/* Actions */}
            {detail && (
              <div className="border-hairline bg-canvas flex items-center justify-end gap-3 border-t p-4">
                {isRejecting ? (
                  <>
                    <Button
                      outline
                      onClick={() => setIsRejecting(false)}
                      disabled={isMutating}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="red"
                      onClick={handleReject}
                      disabled={isMutating}
                    >
                      <XCircle data-slot="icon" />
                      Confirm Reject
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      color="red"
                      onClick={() => setIsRejecting(true)}
                      disabled={isMutating}
                    >
                      <XCircle data-slot="icon" />
                      Reject
                    </Button>
                    {hasEdits && (
                      <Button
                        color="blue"
                        onClick={handleApproveEdited}
                        disabled={isMutating}
                      >
                        <Pencil data-slot="icon" />
                        Approve with Edits
                      </Button>
                    )}
                    <Button
                      color="green"
                      onClick={handleApprove}
                      disabled={isMutating}
                    >
                      <Check data-slot="icon" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
