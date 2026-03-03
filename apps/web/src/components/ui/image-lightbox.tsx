"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Download,
  Camera,
  User,
  Archive,
  Clock,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { CreditDisplay } from "@/components/ui/credit-display";
import { ShareButton } from "@/components/ui/actions/share-button";
import { PhotoIdentificationForm } from "@/components/gallery/photo-identification-form";
import { isRawFilename } from "@/lib/gallery-mappers";

export interface Photo {
  id?: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
  title?: string;
  highResSrc?: string;
  author?: string;
  creditPlatform?: string;
  creditHandle?: string;
  altText?: string;
  cameraMake?: string;
  cameraModel?: string;
  dateTaken?: string;
  approximateDate?: string;
  locationName?: string;
  photographerCredit?: string;
  archiveSource?: string;
  latitude?: number;
  longitude?: number;
}

interface ImageLightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onShowOnMap?: (lat: number, lng: number, photoId: string) => void;
}

const SWIPE_THRESHOLD = 50;
const DISMISS_THRESHOLD = 100;

function getShareUrl(photo: Photo): string {
  const path = `/gallery/photo/${photo.id || ""}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

function isNeedsIdentification(photo: Photo): boolean {
  const hasRawTitle = !photo.title || isRawFilename(photo.title);
  const missingLocation = !photo.locationName;
  const missingDates = !photo.dateTaken && !photo.approximateDate;
  return hasRawTitle || missingLocation || missingDates;
}

export function ImageLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onShowOnMap,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [identifyOpen, setIdentifyOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Sync current index when the caller selects a different photo
  if (prevInitialIndex !== initialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
    setSheetExpanded(false);
    setIdentifyOpen(false);
  }

  const photo = photos[currentIndex];

  // Track which element opened the lightbox for focus return
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Prevent background scroll (iOS Safari doesn't block it with dialog.showModal())
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Open/close native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      // Return focus to trigger element
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  // Handle native dialog close event (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const goToNext = useCallback(() => {
    if (isZoomed) return;
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length, isZoomed]);

  const goToPrevious = useCallback(() => {
    if (isZoomed) return;
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length, isZoomed]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, goToNext, goToPrevious]);

  // Handle horizontal swipe
  const handleDragEnd = useCallback(
    (
      _: unknown,
      info: {
        offset: { x: number; y: number };
        velocity: { x: number; y: number };
      }
    ) => {
      if (isZoomed) return;

      // Swipe down to dismiss
      if (info.offset.y > DISMISS_THRESHOLD) {
        onClose();
        return;
      }

      // Horizontal swipe
      if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
        if (info.offset.x > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      }
    },
    [goToNext, goToPrevious, onClose, isZoomed]
  );

  // Double tap to zoom
  const lastTapRef = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setIsZoomed((z) => !z);
    }
    lastTapRef.current = now;
  }, []);

  if (!photo) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label="Photo lightbox"
      className="fixed inset-0 m-0 h-screen max-h-screen w-screen max-w-full border-none bg-transparent p-0 backdrop:bg-black/95 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click (dialog element itself)
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {/* WCAG: polite announcement */}
      <div aria-live="polite" className="sr-only">
        Photo {currentIndex + 1} of {photos.length}: {photo.alt}
      </div>

      <div className="flex h-full w-full flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-black/40 px-4 py-3 backdrop-blur-sm">
          <span className="text-sm text-white/70">
            {currentIndex + 1} of {photos.length}
          </span>
          <button
            onClick={onClose}
            className="focus-ring touch-target rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main content area */}
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Navigation arrows — hidden on touch devices */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="focus-ring touch-target absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 pointer-coarse:hidden"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="focus-ring touch-target absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 lg:right-[21rem] pointer-coarse:hidden"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image area with touch gestures */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={
                  shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }
                }
                animate={
                  shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }
                }
                exit={
                  shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }
                }
                transition={{ duration: 0.2 }}
                drag={!isZoomed}
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                onDragEnd={handleDragEnd}
                onClick={handleTap}
                className="relative h-full w-full cursor-grab active:cursor-grabbing"
                style={{
                  transform: isZoomed ? "scale(2)" : "scale(1)",
                  transition: "transform 0.3s ease",
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.altText || photo.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden bg-black/40 p-6 text-white backdrop-blur-sm lg:block lg:w-80 lg:overflow-y-auto">
            <MetadataPanel photo={photo} />
            {onShowOnMap &&
              photo.latitude != null &&
              photo.longitude != null &&
              photo.id && (
                <div className="mt-4 border-t border-white/20 pt-4">
                  <button
                    onClick={() =>
                      onShowOnMap(photo.latitude!, photo.longitude!, photo.id!)
                    }
                    aria-label="Show photo location on map"
                    className="focus-ring touch-target flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  >
                    <MapPin className="h-4 w-4" />
                    Show on Map
                  </button>
                </div>
              )}
            {isNeedsIdentification(photo) && (
              <IdentifyButton onClick={() => setIdentifyOpen(true)} />
            )}
            <ActionsPanel photo={photo} />
            <ThumbnailNav
              photos={photos}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
          </div>

          {/* Mobile bottom sheet */}
          <MobileBottomSheet
            photo={photo}
            expanded={sheetExpanded}
            onToggle={() => setSheetExpanded((e) => !e)}
            shouldReduceMotion={shouldReduceMotion ?? false}
            onIdentify={
              isNeedsIdentification(photo)
                ? () => setIdentifyOpen(true)
                : undefined
            }
            onShowOnMap={onShowOnMap}
          />
        </div>
      </div>

      {photo.id && identifyOpen && (
        <PhotoIdentificationForm
          mediaId={photo.id}
          photoTitle={photo.title || photo.description || photo.alt}
          pageUrl={getShareUrl(photo)}
          isOpen={identifyOpen}
          onClose={() => setIdentifyOpen(false)}
          inline
        />
      )}
    </dialog>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetadataPanel({ photo }: { photo: Photo }) {
  return (
    <div className="space-y-3 text-sm text-white/80">
      {photo.description && (
        <p className="mb-4 text-base font-medium text-white">
          {photo.description}
        </p>
      )}

      {(photo.locationName || photo.location) && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-white/60" />
          <span>{photo.locationName || photo.location}</span>
        </div>
      )}

      {(photo.dateTaken || photo.approximateDate || photo.date) && (
        <div className="flex items-center gap-2">
          {photo.approximateDate && !photo.dateTaken ? (
            <Clock className="h-4 w-4 shrink-0 text-white/60" />
          ) : (
            <Calendar className="h-4 w-4 shrink-0 text-white/60" />
          )}
          <span>
            {photo.dateTaken || photo.approximateDate || photo.date}
            {photo.approximateDate && !photo.dateTaken && " (approx.)"}
          </span>
        </div>
      )}

      {(photo.cameraMake || photo.cameraModel) && (
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 shrink-0 text-white/60" />
          <span>
            {[photo.cameraMake, photo.cameraModel].filter(Boolean).join(" ")}
          </span>
        </div>
      )}

      {photo.photographerCredit && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-white/60" />
          <span>{photo.photographerCredit}</span>
        </div>
      )}

      {photo.archiveSource && (
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 shrink-0 text-white/60" />
          <span>{photo.archiveSource}</span>
        </div>
      )}
    </div>
  );
}

function IdentifyButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-4 border-t border-white/20 pt-4">
      <button
        onClick={onClick}
        className="focus-ring touch-target flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
      >
        <HelpCircle className="h-4 w-4" />
        Help identify this photo
      </button>
    </div>
  );
}

function ActionsPanel({ photo }: { photo: Photo }) {
  return (
    <div className="mt-6 border-t border-white/20 pt-6">
      <div className="flex gap-3">
        <a
          href={photo.highResSrc || photo.src}
          download={`brava-${photo.alt.replace(/\s+/g, "-").toLowerCase()}.jpg`}
          className="focus-ring touch-target flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
        <ShareButton
          title={photo.alt}
          url={getShareUrl(photo)}
          description={photo.description}
          variant="icon-only"
        />
      </div>
      {photo.author && (
        <div className="mt-3 text-center">
          <CreditDisplay
            credit={photo.author}
            creditPlatform={photo.creditPlatform}
            creditHandle={photo.creditHandle}
            variant="lightbox"
            className="justify-center text-white/60"
          />
        </div>
      )}
    </div>
  );
}

function ThumbnailNav({
  photos,
  currentIndex,
  onSelect,
}: {
  photos: Photo[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  if (photos.length <= 1) return null;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-2">
        {photos.map((p, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={clsx(
              "focus-ring relative aspect-square overflow-hidden rounded border-2 transition-all",
              index === currentIndex
                ? "shadow-elevated scale-105 border-white"
                : "border-transparent opacity-60 hover:border-white/50 hover:opacity-100"
            )}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileBottomSheet({
  photo,
  expanded,
  onToggle,
  shouldReduceMotion,
  onIdentify,
  onShowOnMap,
}: {
  photo: Photo;
  expanded: boolean;
  onToggle: () => void;
  shouldReduceMotion: boolean;
  onIdentify?: () => void;
  onShowOnMap?: (lat: number, lng: number, photoId: string) => void;
}) {
  const handleSheetDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number } }) => {
      // Drag up to expand, drag down to collapse
      if (info.offset.y < -50 && !expanded) {
        onToggle();
      } else if (info.offset.y > 50 && expanded) {
        onToggle();
      }
    },
    [expanded, onToggle]
  );

  return (
    <motion.div
      className="bg-black/60 backdrop-blur-md lg:hidden"
      animate={
        shouldReduceMotion ? undefined : { height: expanded ? "70vh" : "auto" }
      }
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSheetDragEnd}
    >
      {/* Drag handle */}
      <button
        onClick={onToggle}
        className="touch-target flex w-full items-center justify-center py-3"
        aria-label={expanded ? "Collapse details" : "Expand details"}
      >
        <div className="h-1 w-10 rounded-full bg-white/40" />
        <ChevronUp
          size={16}
          className={clsx(
            "ml-2 text-white/60 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={clsx(
          "overflow-y-auto px-4 pb-4 text-white",
          expanded ? "max-h-[calc(70vh-48px)]" : "max-h-[30vh]"
        )}
      >
        {/* Collapsed: title, location, date, actions */}
        <div className="space-y-2">
          {photo.description && (
            <p className="text-sm font-medium">{photo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            {(photo.locationName || photo.location) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {photo.locationName || photo.location}
              </span>
            )}
            {(photo.dateTaken || photo.approximateDate || photo.date) && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {photo.dateTaken || photo.approximateDate || photo.date}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 pt-1">
            <a
              href={photo.highResSrc || photo.src}
              download
              className="focus-ring touch-target flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Save
            </a>
            <ShareButton
              title={photo.alt}
              url={getShareUrl(photo)}
              description={photo.description}
              variant="icon-only"
            />
            {onIdentify && (
              <button
                onClick={onIdentify}
                className="focus-ring touch-target flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Identify
              </button>
            )}
            {onShowOnMap &&
              photo.latitude != null &&
              photo.longitude != null &&
              photo.id && (
                <button
                  onClick={() =>
                    onShowOnMap(photo.latitude!, photo.longitude!, photo.id!)
                  }
                  aria-label="Show photo location on map"
                  className="focus-ring touch-target flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Map
                </button>
              )}
          </div>
        </div>

        {/* Expanded: full metadata */}
        {expanded && (
          <div className="mt-4 border-t border-white/20 pt-4">
            <MetadataPanel photo={photo} />
            {photo.author && (
              <div className="mt-3">
                <CreditDisplay
                  credit={photo.author}
                  creditPlatform={photo.creditPlatform}
                  creditHandle={photo.creditHandle}
                  variant="lightbox"
                  className="text-white/60"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
