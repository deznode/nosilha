"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ImageIcon, X, Sparkles, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { useUpdateGalleryMedia } from "@/hooks/queries/admin";
import { usePolishContent } from "@/hooks/queries/useTextAi";
import { useToast } from "@/hooks/use-toast";
import {
  galleryEditSchema,
  type GalleryEditInput,
} from "@/schemas/galleryEditSchema";
import type { GalleryMedia, UpdateGalleryMediaRequest } from "@/types/gallery";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";
import type { AiStatusResponse, AiModerationStatus } from "@/types/ai";
import { AiStatusBadge } from "./ai-status-badge";

function getAttribution(item: GalleryMedia): string {
  if (isUserUploadMedia(item)) {
    return item.photographerCredit ?? "";
  }
  if (isExternalMedia(item)) {
    return item.author ?? "";
  }
  return "";
}

interface GalleryEditModalProps {
  isOpen: boolean;
  item: GalleryMedia | null;
  onClose: () => void;
  onSuccess?: () => void;
  aiStatus?: AiStatusResponse;
  onTriggerAnalysis?: (mediaId: string) => void;
  isTriggerPending?: boolean;
  isEligibleForAi?: boolean;
}

/**
 * Modal for editing gallery media metadata in the admin dashboard.
 *
 * Features:
 * - Title, description, category, and contextual attribution fields
 * - AI status badge and "Analyze with AI" trigger in the header
 * - "Use AI suggestion" buttons for fields with existing AI analysis data
 * - Independent "Polish text" buttons for title and description
 */
export function GalleryEditModal({
  isOpen,
  item,
  onClose,
  onSuccess,
  aiStatus,
  onTriggerAnalysis,
  isTriggerPending,
  isEligibleForAi,
}: GalleryEditModalProps) {
  const toast = useToast();
  const updateMutation = useUpdateGalleryMedia();
  const polishTitleMutation = usePolishContent();
  const polishDescriptionMutation = usePolishContent();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GalleryEditInput>({
    resolver: zodResolver(galleryEditSchema),
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");

  useEffect(() => {
    if (item) {
      reset({
        title: item.title ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        attribution: getAttribution(item),
      });
    }
  }, [item, reset]);

  const onSubmit = (data: GalleryEditInput) => {
    if (!item) return;

    const request: UpdateGalleryMediaRequest = {
      title: data.title,
      description: data.description || undefined,
      category: data.category || undefined,
    };

    // Map attribution to the correct field based on media type
    if (data.attribution) {
      if (isUserUploadMedia(item)) {
        request.photographerCredit = data.attribution;
      } else if (isExternalMedia(item)) {
        request.author = data.attribution;
      }
    }

    updateMutation.mutate(
      { id: item.id, data: request },
      {
        onSuccess: () => {
          toast.success("Media updated successfully").show();
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update media").show();
        },
      }
    );
  };

  const handleApplyAiDescription = () => {
    if (!item || !isUserUploadMedia(item) || !item.aiDescription) return;
    setValue("description", item.aiDescription, { shouldDirty: true });
  };

  const handleApplyAiTitle = () => {
    if (!item || !isUserUploadMedia(item) || !item.aiAltText) return;
    setValue("title", item.aiAltText, { shouldDirty: true });
  };

  const handlePolish = (
    field: "title" | "description",
    value: string | undefined,
    mutation: typeof polishTitleMutation,
    label: string
  ) => {
    if (!value) return;

    mutation.mutate(
      { content: value },
      {
        onSuccess: (result) => {
          setValue(field, result.content, { shouldDirty: true });
          toast.success(`${label} polished`).show();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to polish text").show();
        },
      }
    );
  };

  const handleTriggerAnalysis = () => {
    if (!item || !onTriggerAnalysis) return;
    onTriggerAnalysis(item.id);
  };

  if (!item) return null;

  const isUserUpload = isUserUploadMedia(item);

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
            className="bg-surface relative w-full max-w-2xl transform overflow-hidden rounded-2xl text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-ocean-blue h-5 w-5" />
                <DialogTitle className="text-body text-lg font-semibold">
                  Edit Media
                </DialogTitle>
                {aiStatus?.moderationStatus && (
                  <AiStatusBadge
                    moderationStatus={
                      aiStatus.moderationStatus as AiModerationStatus
                    }
                  />
                )}
                {isEligibleForAi && onTriggerAnalysis && (
                  <Button
                    plain
                    onClick={handleTriggerAnalysis}
                    disabled={isTriggerPending}
                    className="!text-xs !text-violet-600 hover:!text-violet-700 dark:!text-violet-400"
                  >
                    {isTriggerPending ? (
                      <Loader2
                        data-slot="icon"
                        className="!h-3.5 !w-3.5 animate-spin"
                      />
                    ) : (
                      <Sparkles data-slot="icon" className="!h-3.5 !w-3.5" />
                    )}
                    Analyze with AI
                  </Button>
                )}
              </div>
              <Button plain onClick={onClose} aria-label="Close modal">
                <X data-slot="icon" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="gallery-title"
                    className="text-body mb-1 block text-sm font-medium"
                  >
                    Title <span className="text-status-error">*</span>
                  </label>
                  <input
                    id="gallery-title"
                    type="text"
                    {...register("title")}
                    className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
                  />
                  {errors.title && (
                    <p className="text-status-error mt-1 text-xs">
                      {errors.title.message}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {isUserUpload && item.aiAltText && (
                      <button
                        type="button"
                        onClick={handleApplyAiTitle}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400"
                      >
                        <Sparkles className="h-3 w-3" />
                        Use AI suggestion
                      </button>
                    )}
                    {titleValue && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePolish(
                            "title",
                            titleValue,
                            polishTitleMutation,
                            "Title"
                          )
                        }
                        disabled={polishTitleMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 disabled:opacity-50 dark:text-violet-400"
                      >
                        {polishTitleMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Polish text
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="gallery-description"
                    className="text-body mb-1 block text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="gallery-description"
                    rows={4}
                    {...register("description")}
                    className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
                  />
                  {errors.description && (
                    <p className="text-status-error mt-1 text-xs">
                      {errors.description.message}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {isUserUpload && item.aiDescription && (
                      <button
                        type="button"
                        onClick={handleApplyAiDescription}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400"
                      >
                        <Sparkles className="h-3 w-3" />
                        Use AI suggestion
                      </button>
                    )}
                    {descriptionValue && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePolish(
                            "description",
                            descriptionValue,
                            polishDescriptionMutation,
                            "Description"
                          )
                        }
                        disabled={polishDescriptionMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 disabled:opacity-50 dark:text-violet-400"
                      >
                        {polishDescriptionMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Polish text
                      </button>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="gallery-category"
                    className="text-body mb-1 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <input
                    id="gallery-category"
                    type="text"
                    {...register("category")}
                    className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
                  />
                  {errors.category && (
                    <p className="text-status-error mt-1 text-xs">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Attribution */}
                <div>
                  <label
                    htmlFor="gallery-attribution"
                    className="text-body mb-1 block text-sm font-medium"
                  >
                    {isUserUpload ? "Photographer Credit" : "Author / Credit"}
                  </label>
                  <input
                    id="gallery-attribution"
                    type="text"
                    {...register("attribution")}
                    className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
                  />
                  {errors.attribution && (
                    <p className="text-status-error mt-1 text-xs">
                      {errors.attribution.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-hairline flex items-center justify-end gap-3 border-t px-6 py-4">
                <Button plain onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="blue"
                  disabled={isSubmitting || updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
