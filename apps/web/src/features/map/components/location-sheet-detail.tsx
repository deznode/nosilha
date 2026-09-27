"use client";

import type { ReactNode } from "react";
import { selectionCard } from "../data/map-copy";
import type { MapItem } from "../data/types";
import { DetailCloseButton, LocationDetailBody } from "./location-detail";

interface LocationSheetDetailProps {
  item: MapItem;
  onClose: () => void;
  /** The handle row's drag target; a plain bar when omitted. */
  handle?: ReactNode;
}

/**
 * A selected pin's details inside the narrow layout's bottom sheet: a header row with
 * the close control that can never leave the screen, then the body, scrolling when it
 * is taller than the sheet. Spec 039 (M1, M2).
 */
export function LocationSheetDetail({
  item,
  onClose,
  handle,
}: LocationSheetDetailProps) {
  return (
    <section
      aria-label={`Selected: ${selectionCard(item).name}`}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        className="relative flex min-h-11 flex-none items-center justify-center border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {handle ?? (
          <span
            aria-hidden
            className="h-1 w-[34px] rounded-full"
            style={{ background: "var(--border-strong)" }}
          />
        )}
        <DetailCloseButton
          onClose={onClose}
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] pt-3.5 pb-[calc(18px+env(safe-area-inset-bottom,0px))]">
        <LocationDetailBody item={item} />
      </div>
    </section>
  );
}
