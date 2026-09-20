"use client";

import Link from "next/link";
import { statusVar } from "@/lib/status";
import type { LegendRow } from "../data/map-copy";

const OVERLAY_GROUND = "color-mix(in srgb, var(--background) 88%, transparent)";

interface MapLegendProps {
  rows: LegendRow[];
  /** Distance from the canvas bottom, in pixels; lifts above a peeking sheet. */
  bottom: number;
}

/**
 * The pin colour key, floating over the canvas's bottom-left. Counts are live and
 * describe the whole mode, not the filtered list. Spec 034 FR-011.
 */
export function MapLegend({ rows, bottom }: MapLegendProps) {
  return (
    <ul
      aria-label="Pin colour key"
      className="absolute left-3.5 z-[5] flex flex-wrap gap-3.5 rounded-[10px] border px-[13px] py-[9px] backdrop-blur-[8px] transition-[bottom] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      style={{
        bottom,
        background: OVERLAY_GROUND,
        borderColor: "var(--border-subtle)",
      }}
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
  bottom: number;
}

/**
 * Photographs mode's dashed ochre note: how many photographs the map cannot show, and
 * the way to them.
 */
export function PhotographsNote({ note, bottom }: PhotographsNoteProps) {
  return (
    <div
      className="absolute right-3.5 z-[5] max-w-[260px] rounded-[10px] border border-dashed px-3.5 py-3 backdrop-blur-[8px] transition-[bottom] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      style={{
        bottom,
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
        className="mt-2 inline-block text-xs underline underline-offset-[3px]"
        style={{ color: "var(--foreground)" }}
      >
        Open the no-place tray
      </Link>
    </div>
  );
}
