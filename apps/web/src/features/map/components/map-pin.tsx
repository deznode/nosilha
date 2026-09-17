"use client";

import type { KeyboardEvent, Ref } from "react";
import { statusVar } from "@/lib/status";
import type { MapItem } from "../data/types";

/** Dot diameter in pixels: photographs pin as slightly larger thumbnails. */
export function pinSize(item: Pick<MapItem, "kind">): number {
  return item.kind === "photo" ? 26 : 22;
}

/** The selected pin's ring, from the foreground so it reads on either basemap. */
const SELECTED_HALO =
  "0 0 0 6px color-mix(in srgb, var(--foreground) 18%, transparent)";

interface MapPinProps {
  item: MapItem;
  selected: boolean;
  /** Registers the label with the declutter pass; absent when the pin is unlabelled. */
  labelRef?: Ref<HTMLSpanElement>;
  showLabel: boolean;
  onSelect: (item: MapItem) => void;
  onHover: (item: MapItem | null) => void;
}

/**
 * One pin, as prototyped: a status-coloured dot with a 2px ground-coloured edge, a 3px
 * foreground edge and halo when selected, and a small label beneath. Spec 034 FR-011.
 *
 * Every colour is a CSS variable, never a resolved value, so switching the theme
 * repaints a mounted pin without rebuilding its marker (T-32).
 */
export function MapPin({
  item,
  selected,
  labelRef,
  showLabel,
  onSelect,
  onHover,
}: MapPinProps) {
  const size = pinSize(item);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(item);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${item.eyebrow}`}
      aria-pressed={selected}
      data-pin={item.key}
      className="group flex cursor-pointer flex-col items-center gap-[3px] outline-none"
      onClick={(event) => {
        // The map's own click handler ignores marker targets; this keeps a pin click
        // from also reaching any other marker listener.
        event.stopPropagation();
        onSelect(item);
      }}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(item)}
      onBlur={() => onHover(null)}
    >
      <span
        data-pin-dot
        className="block overflow-hidden rounded-full transition-transform duration-[180ms] ease-[cubic-bezier(.4,.14,.3,1)] group-hover:scale-[1.18] group-focus-visible:scale-[1.18]"
        style={{
          width: size,
          height: size,
          background: statusVar(item.status),
          border: selected
            ? "3px solid var(--foreground)"
            : "2px solid var(--background)",
          boxShadow: selected
            ? `0 2px 10px rgba(0,0,0,.5), ${SELECTED_HALO}`
            : "0 2px 10px rgba(0,0,0,.5)",
        }}
      >
        {item.image && (
          // A 26px thumbnail from R2: the optimiser would cost more than it saves.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
        )}
      </span>

      {showLabel && (
        <span
          ref={labelRef}
          data-pin-label
          className="pointer-events-none rounded-[5px] font-sans text-[10px] font-medium tracking-[.04em] whitespace-nowrap"
          style={{
            color: "var(--foreground)",
            background:
              "color-mix(in srgb, var(--background) 82%, transparent)",
            padding: "2px 6px",
          }}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
