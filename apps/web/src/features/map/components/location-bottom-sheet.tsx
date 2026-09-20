"use client";

import type { ReactNode } from "react";

export const SHEET_PEEK_HEIGHT = 132;
export const SHEET_EXPANDED_HEIGHT = "64%";

interface LocationBottomSheetProps {
  open: boolean;
  onToggle: () => void;
  children: (grabber: ReactNode) => ReactNode;
}

/**
 * The narrow layout's sidebar: a sheet over the full-bleed canvas, peeking at the
 * grabber and mode tabs, expanding to 64%. Spec 034 FR-012, handoff SPECS §3.
 *
 * Hand-built to the handoff rather than drag-driven: the prototype's grabber is a
 * button, and a button is reachable by keyboard and screen reader.
 */
export function LocationBottomSheet({
  open,
  onToggle,
  children,
}: LocationBottomSheetProps) {
  const grabber = (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex w-full flex-none cursor-pointer items-center justify-center gap-2.5 border-b p-2.5 text-xs"
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
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t transition-[max-height] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      style={{
        maxHeight: open ? SHEET_EXPANDED_HEIGHT : `${SHEET_PEEK_HEIGHT}px`,
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
