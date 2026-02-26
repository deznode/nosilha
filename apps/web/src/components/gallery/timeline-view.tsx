"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import type { TimelineResponse, DecadeGroup } from "@/types/gallery";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";

interface TimelineViewProps {
  timeline: TimelineResponse;
  onDecadeSelect: (decade: string) => void;
}

function DecadeCard({
  group,
  onSelect,
  reducedMotion = false,
}: {
  group: DecadeGroup;
  onSelect: () => void;
  reducedMotion?: boolean;
}) {
  const isEmpty = group.count === 0;
  const photos = group.samplePhotos || [];

  return (
    <button
      onClick={onSelect}
      disabled={isEmpty}
      aria-label={`${group.label}, ${group.count} photos`}
      role="group"
      className={clsx(
        "rounded-card border-hairline focus-ring flex w-64 flex-shrink-0 snap-start flex-col overflow-hidden border text-left transition-all",
        isEmpty
          ? "cursor-default opacity-40"
          : "bg-surface shadow-subtle hover:shadow-medium",
        !isEmpty && !reducedMotion && "active:scale-[0.98]"
      )}
    >
      {/* Thumbnail grid */}
      <div className="bg-surface-alt grid h-32 grid-cols-3 gap-0.5 overflow-hidden">
        {photos.slice(0, 3).map((photo, i) => {
          const url = resolvePublicImageUrl(photo);
          return url ? (
            <div key={photo.id} className="relative overflow-hidden">
              <Image
                src={url}
                alt={photo.title || `${group.label} sample ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              key={`placeholder-${i}`}
              className="bg-surface-alt"
            />
          );
        })}
        {/* Fill empty slots */}
        {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-surface-alt" />
        ))}
      </div>

      {/* Label & count */}
      <div className="p-3">
        <p className="text-body font-serif text-base font-bold">{group.label}</p>
        <p className="text-muted text-xs">
          {group.count} {group.count === 1 ? "photo" : "photos"}
        </p>
      </div>
    </button>
  );
}

export function TimelineView({ timeline, onDecadeSelect }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const container = scrollRef.current;
      if (!container) return;

      // Arrow keys: navigate between decades
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
        next?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (e.target as HTMLElement)
          .previousElementSibling as HTMLElement;
        prev?.focus();
      }
    },
    []
  );

  if (!timeline || timeline.groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted text-sm">No timeline data available yet.</p>
      </div>
    );
  }

  return (
    <div
      aria-label="Gallery timeline showing photos by decade"
      className="py-4"
    >
      {/* Desktop: horizontal scroll */}
      <div className="hidden md:block">
        <div
          ref={scrollRef}
          role="toolbar"
          aria-label="Decade navigation"
          onKeyDown={handleKeyDown}
          className={clsx(
            "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin",
            !reducedMotion && "scroll-smooth"
          )}
        >
          {timeline.groups.map((group) => (
            <DecadeCard
              key={group.decade}
              group={group}
              reducedMotion={reducedMotion}
              onSelect={() => onDecadeSelect(group.decade)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="relative block md:hidden">
        {/* Timeline line */}
        <div className="border-hairline absolute top-0 bottom-0 left-4 w-px border-l" />

        <div
          role="toolbar"
          aria-label="Decade navigation"
          onKeyDown={handleKeyDown}
          className="space-y-6"
        >
          {timeline.groups.map((group) => (
            <div key={group.decade} className="relative flex items-start gap-4 pl-10">
              {/* Marker dot */}
              <div
                className={clsx(
                  "absolute left-2.5 top-2 h-3 w-3 rounded-full border-2",
                  group.count > 0
                    ? "bg-ocean-blue border-ocean-blue"
                    : "border-hairline bg-surface"
                )}
              />

              <MobileDecadeCard
                group={group}
                reducedMotion={reducedMotion}
                onSelect={() => onDecadeSelect(group.decade)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Total count */}
      <p className="text-muted mt-4 text-center text-xs">
        {timeline.totalCount} photos across all eras
      </p>
    </div>
  );
}

function MobileDecadeCard({
  group,
  onSelect,
  reducedMotion = false,
}: {
  group: DecadeGroup;
  onSelect: () => void;
  reducedMotion?: boolean;
}) {
  const isEmpty = group.count === 0;
  const photos = group.samplePhotos || [];

  return (
    <button
      onClick={onSelect}
      disabled={isEmpty}
      aria-label={`${group.label}, ${group.count} photos`}
      role="group"
      className={clsx(
        "rounded-card border-hairline focus-ring flex w-full flex-col overflow-hidden border text-left transition-all",
        isEmpty
          ? "cursor-default opacity-40"
          : "bg-surface shadow-subtle",
        !isEmpty && !reducedMotion && "active:scale-[0.98]"
      )}
    >
      {/* Thumbnails row */}
      {photos.length > 0 && (
        <div className="grid h-24 grid-cols-3 gap-0.5 overflow-hidden">
          {photos.slice(0, 3).map((photo, i) => {
            const url = resolvePublicImageUrl(photo);
            return url ? (
              <div key={photo.id} className="relative overflow-hidden">
                <Image
                  src={url}
                  alt={photo.title || `${group.label} sample ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div key={`placeholder-${i}`} className="bg-surface-alt" />
            );
          })}
          {Array.from({ length: Math.max(0, 3 - photos.length) }).map(
            (_, i) => (
              <div key={`empty-${i}`} className="bg-surface-alt" />
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between p-3">
        <p className="text-body font-serif text-base font-bold">{group.label}</p>
        <span className="text-muted text-xs">
          {group.count} {group.count === 1 ? "photo" : "photos"}
        </span>
      </div>
    </button>
  );
}
