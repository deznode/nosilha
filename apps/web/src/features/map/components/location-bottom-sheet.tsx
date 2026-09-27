"use client";

import type { ReactNode } from "react";

/** Grabber, the pin colour key and the mode tabs. Spec 039 (M3) added the key. */
export const SHEET_PEEK_HEIGHT = 160;
export const SHEET_EXPANDED_HEIGHT = "64%";
/** The selection's detail view sizes to its content, up to half the canvas. */
export const SHEET_DETAIL_MAX_HEIGHT = "50%";

/**
 * What the sheet shows: peeking at the list, a selected pin's details, or the list
 * expanded. Spec 039 (M1).
 */
export type SheetView = "peek" | "detail" | "open";

const MAX_HEIGHT: Record<SheetView, string> = {
  peek: `${SHEET_PEEK_HEIGHT}px`,
  detail: SHEET_DETAIL_MAX_HEIGHT,
  open: SHEET_EXPANDED_HEIGHT,
};

interface LocationBottomSheetProps {
  view: SheetView;
  onToggle: () => void;
  children: (grabber: ReactNode) => ReactNode;
}

/**
 * The narrow layout's sidebar: a sheet over the full-bleed canvas, peeking at the
 * grabber and mode tabs, expanding over the canvas. A selection shows in the sheet
 * rather than floating over the map. Spec 034 FR-012, handoff SPECS §3, Spec 039.
 *
 * The grabber is a button, so the sheet is reachable by keyboard and screen reader.
 */
export function LocationBottomSheet({
  view,
  onToggle,
  children,
}: LocationBottomSheetProps) {
  const open = view === "open";
  const grabber = (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex min-h-11 w-full flex-none cursor-pointer items-center justify-center gap-2.5 border-b px-2.5 text-xs"
      style={{
        borderColor: "var(--border-subtle)",
        color: "var(--foreground-secondary)",
      }}
    >
      <span
        aria-hidden
        className="h-1 w-[34px] rounded-full"
        style={{ background: "var(--border-strong)" }}
      />
      {open ? "Hide the list" : "Filters and list"}
    </button>
  );

  return (
    <section
      aria-label="Filters and list"
      data-testid="map-sheet"
      data-view={view}
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t transition-[max-height] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      style={{
        maxHeight: MAX_HEIGHT[view],
        background: "var(--background)",
        borderColor: "var(--border-subtle)",
        boxShadow:
          "0 -16px 44px color-mix(in srgb, var(--foreground) 18%, transparent)",
      }}
    >
      {children(grabber)}
    </section>
  );
}
