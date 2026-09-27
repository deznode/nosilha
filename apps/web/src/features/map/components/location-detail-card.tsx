"use client";

import { selectionCard } from "../data/map-copy";
import type { MapItem } from "../data/types";
import { LocationDetailBody } from "./location-detail";

interface LocationDetailCardProps {
  item: MapItem;
  onClose: () => void;
}

/** Distance from the canvas bottom, in pixels (SPECS §3). */
const BOTTOM = 62;
/** Space kept clear above the card, so its close control never leaves the canvas. */
const TOP_CLEARANCE = 14;

/**
 * The selected pin's card, centred over the canvas on a wide screen. Hand-built to the
 * handoff panel (SPECS §4). Spec 034 FR-011.
 *
 * It grows upward from its bottom, so its height is capped to the canvas and it scrolls
 * inside: a long description once pushed the close control out of reach. Spec 039 (M1).
 * On a narrow screen the selection lives in the bottom sheet instead.
 */
export function LocationDetailCard({ item, onClose }: LocationDetailCardProps) {
  return (
    <section
      aria-label={`Selected: ${selectionCard(item).name}`}
      className="absolute left-1/2 z-[6] w-[min(420px,calc(100%-28px))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-[14px] border p-[18px] backdrop-blur-[10px]"
      style={{
        bottom: BOTTOM,
        maxHeight: `calc(100% - ${BOTTOM + TOP_CLEARANCE}px)`,
        background: "color-mix(in srgb, var(--background) 95%, transparent)",
        borderColor: "var(--border-strong)",
        boxShadow: "0 20px 50px rgba(0,0,0,.5)",
      }}
    >
      <LocationDetailBody item={item} onClose={onClose} />
    </section>
  );
}
