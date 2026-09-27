"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { statusVar } from "@/lib/status";
import type { LegendRow } from "../data/map-copy";

const OVERLAY_GROUND = "color-mix(in srgb, var(--background) 88%, transparent)";

/**
 * Where an overlay sits: floating over the canvas (wide), or inline in the bottom sheet
 * (narrow), where it no longer covers the map. Spec 039 (M3).
 */
export type OverlayVariant = "floating" | "sheet";

interface MapLegendProps {
  rows: LegendRow[];
  /** Distance from the canvas bottom, in pixels; floating only. */
  bottom?: number;
  variant?: OverlayVariant;
}

/**
 * The pin colour key, floating over the canvas's bottom-left or as one scrolling line in
 * the sheet. Counts are live and describe the whole mode, not the filtered list.
 * Spec 034 FR-011, Spec 039 (M3).
 */
export function MapLegend({
  rows,
  bottom,
  variant = "floating",
}: MapLegendProps) {
  const floating = variant === "floating";
  return (
    <ul
      aria-label="Pin colour key"
      className={clsx(
        "flex gap-3.5",
        floating
          ? "absolute left-3.5 z-[5] flex-wrap rounded-[10px] border px-[13px] py-[9px] backdrop-blur-[8px] transition-[bottom] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
          : "scrollbar-hide flex-none overflow-x-auto px-[18px] pt-2.5"
      )}
      style={
        floating
          ? {
              bottom,
              background: OVERLAY_GROUND,
              borderColor: "var(--border-subtle)",
            }
          : undefined
      }
    >
      {rows.map((row) => (
        <li
          key={`${row.status}-${row.label}`}
          className="flex items-center gap-[7px] text-[11px] whitespace-nowrap"
          style={{ color: "var(--foreground-secondary)" }}
        >
          <span
            data-legend-dot
            aria-hidden
            className="size-2 rounded-full"
            style={{ background: statusVar(row.status) }}
          />
          {row.label}{" "}
          <span className="tabular-nums" style={{ color: "var(--foreground)" }}>
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface PhotographsNoteProps {
  note: string;
  /** Distance from the canvas bottom, in pixels; floating only. */
  bottom?: number;
  variant?: OverlayVariant;
}

/**
 * Photographs mode's dashed ochre note: how many photographs the map cannot show, and
 * the way to them. Floats over the canvas, or heads the sheet's list. Spec 039 (M3).
 */
export function PhotographsNote({
  note,
  bottom,
  variant = "floating",
}: PhotographsNoteProps) {
  const floating = variant === "floating";
  return (
    <div
      className={clsx(
        "rounded-[10px] border border-dashed px-3.5 py-3",
        floating
          ? "absolute right-3.5 z-[5] max-w-[260px] backdrop-blur-[8px] transition-[bottom] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
          : "mb-2"
      )}
      style={{
        bottom: floating ? bottom : undefined,
        background: "color-mix(in srgb, var(--background) 90%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--brand-sobrado-ochre) 50%, transparent)",
      }}
    >
      <p
        className="text-xs leading-normal"
        style={{ color: "var(--brand-sobrado-ochre)" }}
      >
        {note}
      </p>
      <Link
        href="/photographs?filter=noplace"
        className="hit-area mt-2 inline-block text-xs underline underline-offset-[3px] [--hit-inset:-14px_-8px]"
        style={{ color: "var(--foreground)" }}
      >
        Open the no-place tray
      </Link>
    </div>
  );
}
