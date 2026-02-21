"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ImageIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { useUpdateGalleryMedia } from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";
import {
  galleryEditSchema,
  type GalleryEditInput,
} from "@/schemas/galleryEditSchema";
import type { GalleryMedia, UpdateGalleryMediaRequest } from "@/types/gallery";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";
import { detectCreditPlatform } from "@/lib/credit-utils";
import { CreditPreviewBadge } from "@/components/ui/credit-display";

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
}

/**
 * Modal for editing gallery media metadata in the admin dashboard.
 *
 * Features:
 * - Title, description, category, and contextual attribution fields
 */
export function GalleryEditModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: GalleryEditModalProps) {
  const toast = useToast();
  const updateMutation = useUpdateGalleryMedia();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GalleryEditInput>({
    resolver: zodResolver(galleryEditSchema),
  });

  const attributionValue = watch("attribution");
  const detectedCredit = useMemo(
    () => detectCreditPlatform(attributionValue || ""),
    [attributionValue]
  );

  useEffect(() => {
    if (item) {
      reset({
        title: item.title ?? "",
        description: item.description ?? "",
        category: item.category ?? "",
        attribution: getAttribution(item),
        showInGallery: item.showInGallery,
      });
    }
  }, [item, reset]);

  const onSubmit = (data: GalleryEditInput) => {
    if (!item) return;

    const request: UpdateGalleryMediaRequest = {
      title: data.title,
      description: data.description || undefined,
      category: data.category || undefined,
      showInGallery: data.showInGallery,
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

  if (!item) return null;

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
                    Creator Credit
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
                  {detectedCredit && (
                    <CreditPreviewBadge
                      detected={detectedCredit}
                      className="mt-1.5"
                    />
                  )}
                </div>

                {/* Show in Gallery */}
                <div className="flex items-center gap-3">
                  <input
                    id="gallery-show-in-gallery"
                    type="checkbox"
                    {...register("showInGallery")}
                    className="text-ocean-blue focus:ring-ocean-blue border-hairline h-4 w-4 rounded"
                  />
                  <label
                    htmlFor="gallery-show-in-gallery"
                    className="text-body text-sm font-medium"
                  >
                    Show in public gallery
                  </label>
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
