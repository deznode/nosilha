"use client";

import { useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { useSheetDrag } from "../hooks/use-sheet-drag";

/**
 * Expanded, as a share of the canvas: tall enough for several list rows under the
 * tabs, search and chips. A drag stops there too. Spec 039 (M4).
 */
const EXPANDED_SHARE = 0.85;

/**
 * What the sheet shows: peeking at the list, a selected pin's details, or the list
 * expanded. Spec 039 (M1).
 */
export type SheetView = "peek" | "detail" | "open";

const MAX_HEIGHT: Record<SheetView, string> = {
  // Grabber, the pin colour key and the mode tabs. Spec 039 (M3) added the key.
  peek: "160px",
  // The selection's detail view sizes to its content, up to half the canvas.
  detail: "50%",
  open: `${EXPANDED_SHARE * 100}%`,
};

interface LocationBottomSheetProps {
  view: SheetView;
  /** The grabber's click, key press or drag, settling the list open or shut. */
  onSetOpen: (open: boolean) => void;
  /** A drag down on the detail view's handle, which closes the selection. */
  onDismiss: () => void;
  /** The grabber heads the list; the handle heads the detail view. */
  children: (grabber: ReactNode, handle: ReactNode) => ReactNode;
}

/**
 * The narrow layout's sidebar: a sheet over the full-bleed canvas, peeking at the
 * grabber and mode tabs, expanding over the canvas. A selection shows in the sheet
 * rather than floating over the map. Spec 034 FR-012, handoff SPECS §3, Spec 039.
 *
 * The grabber is a button, so the sheet is reachable by keyboard and screen reader; it
 * also drags, as a handle bar suggests on a phone (M5).
 */
export function LocationBottomSheet({
  view,
  onSetOpen,
  onDismiss,
  children,
}: LocationBottomSheetProps) {
  const open = view === "open";
  const sheetRef = useRef<HTMLElement>(null);
  const { handlers, dragHeight } = useSheetDrag({
    sheetRef,
    maxShare: EXPANDED_SHARE,
    onUp: () => onSetOpen(true),
    onDown: () => (view === "detail" ? onDismiss() : onSetOpen(false)),
  });

  const bar = (
    <span
      aria-hidden
      className="h-1 w-[34px] rounded-full"
      style={{ background: "var(--border-strong)" }}
    />
  );

  const grabber = (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => onSetOpen(!open)}
      {...handlers}
      className="flex min-h-11 w-full flex-none cursor-pointer touch-none items-center justify-center gap-2.5 border-b px-2.5 text-xs"
      style={{
        borderColor: "var(--border-subtle)",
        color: "var(--foreground-secondary)",
      }}
    >
      {bar}
      {open ? "Hide the list" : "Filters and list"}
    </button>
  );

  // Pointer only: the detail view's Close is its keyboard route.
  const handle = (
    <div
      aria-hidden
      data-testid="map-sheet-handle"
      {...handlers}
      className="flex min-h-11 flex-1 cursor-grab touch-none items-center justify-center self-stretch"
    >
      {bar}
    </div>
  );

  return (
    <section
      ref={sheetRef}
      aria-label="Filters and list"
      data-testid="map-sheet"
      data-view={view}
      className={clsx(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t",
        // The sheet follows a dragging finger without lag, then eases to rest.
        dragHeight === null &&
          "transition-[max-height] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      )}
      style={{
        maxHeight: dragHeight === null ? MAX_HEIGHT[view] : `${dragHeight}px`,
        background: "var(--background)",
        borderColor: "var(--border-subtle)",
        boxShadow:
          "0 -16px 44px color-mix(in srgb, var(--foreground) 18%, transparent)",
      }}
    >
      {children(grabber, handle)}
    </section>
  );
}
