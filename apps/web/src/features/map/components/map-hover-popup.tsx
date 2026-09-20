"use client";

import { Popup } from "react-map-gl/maplibre";
import { statusVar } from "@/lib/status";
import { popupContent } from "../data/map-copy";
import type { MapItem } from "../data/types";

/**
 * What a hovered pin is, before anyone commits to a click. Spec 034 FR-011.
 *
 * The card, border and radius come from the `.map-hover-popup` rules in
 * `globals.css`, which also drop MapLibre's tip and let the pointer pass through so the
 * popup never steals the hover it depends on.
 */
export function MapHoverPopup({ item }: { item: MapItem }) {
  return (
    <Popup
      longitude={item.coordinates.lng}
      latitude={item.coordinates.lat}
      closeButton={false}
      closeOnClick={false}
      offset={18}
      maxWidth="240px"
      className="map-hover-popup"
    >
      <MapHoverCard item={item} />
    </Popup>
  );
}

/** The popup's body, separate so it can be rendered without a map. */
export function MapHoverCard({ item }: { item: MapItem }) {
  const copy = popupContent(item);

  return (
    <div
      data-testid="map-hover-card"
      className="w-[220px] font-sans"
      style={{ color: "var(--foreground)" }}
    >
      {copy.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={copy.image}
          alt=""
          className="block h-[110px] w-full object-cover"
        />
      )}
      <div className="px-3 pt-2.5 pb-3">
        <div className="font-serif text-[15px] leading-[1.2] font-normal">
          {copy.title}
        </div>
        {copy.sub?.kind === "file" && (
          <div
            className="mt-[3px] font-mono text-[9px] break-all"
            style={{ color: "var(--foreground-secondary)" }}
          >
            {copy.sub.text}
          </div>
        )}
        {copy.sub?.kind === "eyebrow" && (
          <div
            className="mt-[3px] text-[10px] tracking-[.12em] uppercase"
            style={{ color: "var(--foreground-secondary)" }}
          >
            {copy.sub.text}
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-[7px] rounded-full"
            style={{ background: statusVar(copy.status) }}
          />
          <span
            className="text-[11px]"
            style={{ color: "var(--foreground-secondary)" }}
          >
            {copy.statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
