"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { X, Search, Check, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { getAdminGallery } from "@/lib/api";
import type { GalleryMedia } from "@/types/gallery";
import { isUserUploadMedia, isExternalMedia } from "@/types/gallery";

interface GalleryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, mediaId: string) => void;
}

/**
 * Modal component for selecting approved gallery images.
 * Used in directory entry forms to set the primary/hero image
 * from already-approved gallery content.
 */
export function GalleryPicker({
  isOpen,
  onClose,
  onSelect,
}: GalleryPickerProps) {
  const t = useTranslations("photographs.gallery.picker");
  const tPhotographs = useTranslations("photographs");
  const tCommon = useTranslations("common");
  const [items, setItems] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(false);
  // Whether the last load failed; the message is written at render.
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<GalleryMedia | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchGalleryItems = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      // Fetch only ACTIVE (approved) gallery items
      const response = await getAdminGallery("ACTIVE", pageNum, 20);
      setItems(response.items);
      setHasMore(response.hasMore);
      setTotal(response.total);
    } catch (err) {
      setError(true);
      console.error("Gallery fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchGalleryItems(0);
      setPage(0);
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [isOpen, fetchGalleryItems]);

  // Refetch when page changes
  useEffect(() => {
    if (isOpen && page > 0) {
      fetchGalleryItems(page);
    }
  }, [page, isOpen, fetchGalleryItems]);

  const getImageUrl = (item: GalleryMedia): string | null => {
    if (isUserUploadMedia(item)) {
      return item.publicUrl;
    }
    if (isExternalMedia(item)) {
      return item.thumbnailUrl || item.url;
    }
    return null;
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  });

  const handleConfirm = () => {
    if (selectedItem) {
      const imageUrl = getImageUrl(selectedItem);
      if (imageUrl) {
        onSelect(imageUrl, selectedItem.id);
        onClose();
      }
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
            className="bg-surface relative w-full max-w-4xl transform overflow-hidden rounded-2xl text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="border-hairline flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-ocean-blue h-5 w-5" />
                <DialogTitle className="text-body text-lg font-semibold">
                  {t("title")}
                </DialogTitle>
              </div>
              <Button plain onClick={onClose} aria-label={t("close")}>
                <X data-slot="icon" />
              </Button>
            </div>

            {/* Search */}
            <div className="border-hairline border-b px-6 py-3">
              <div className="relative">
                <Search
                  size={16}
                  className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
                />
                <Input
                  type="text"
                  placeholder={t("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-ocean-blue h-8 w-8 animate-spin" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-status-error mb-4">{t("loadFailed")}</p>
                  <Button onClick={() => fetchGalleryItems(page)}>
                    {t("tryAgain")}
                  </Button>
                </div>
              )}

              {!loading && !error && filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="text-muted mb-4 h-12 w-12" />
                  <p className="text-muted">
                    {searchQuery ? t("noMatch") : t("noImages")}
                  </p>
                </div>
              )}

              {!loading && !error && filteredItems.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {filteredItems.map((item) => {
                    const imageUrl = getImageUrl(item);
                    if (!imageUrl) return null;

                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={clsx(
                          "group focus:ring-ocean-blue relative aspect-square overflow-hidden rounded-lg border-2 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none",
                          isSelected
                            ? "border-ocean-blue ring-ocean-blue/30 ring-2"
                            : "hover:border-edge border-transparent"
                        )}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.title || tPhotographs("gallery.imageAlt")}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="bg-ocean-blue/30 absolute inset-0 flex items-center justify-center">
                            <div className="bg-ocean-blue rounded-full p-2">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Title overlay */}
                        {item.title && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="truncate text-xs text-white">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && (page > 0 || hasMore) && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    plain
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    {t("previous")}
                  </Button>
                  <span className="text-muted text-sm">
                    {t("page", {
                      page: String(page + 1),
                      total: String(total),
                    })}
                  </span>
                  <Button
                    plain
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("next")}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-hairline flex items-center justify-between border-t px-6 py-4">
              <div className="text-muted text-sm">
                {selectedItem ? (
                  <span>
                    {t.rich("selected", {
                      title: selectedItem.title || tPhotographs("untitled"),
                      strong: (chunks) => (
                        <strong className="text-body">{chunks}</strong>
                      ),
                    })}
                  </span>
                ) : (
                  <span>{t("clickToSelect")}</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button plain onClick={onClose}>
                  {tCommon("cancel")}
                </Button>
                <Button
                  color="blue"
                  disabled={!selectedItem}
                  onClick={handleConfirm}
                >
                  <Check data-slot="icon" />
                  {t("use")}
                </Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
