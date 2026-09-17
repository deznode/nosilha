"use client";

import { statusVar } from "@/lib/status";

/** How far a fanned pin sits from the shared point, in pixels (SPECS §5). */
export const FAN_RADIUS = 34;

/**
 * Pixel offsets for `count` records fanned out from one point.
 *
 * A pair sits either side, lifted 6px, as prototyped. More than two share a circle
 * starting at nine o'clock, so the first always lands where a pair's first would.
 */
export function fanOffsets(count: number): [number, number][] {
  if (count === 2) {
    return [
      [-FAN_RADIUS, -6],
      [FAN_RADIUS, -6],
    ];
  }
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.PI + (2 * Math.PI * index) / count;
    return [
      Math.round(Math.cos(angle) * FAN_RADIUS),
      Math.round(Math.sin(angle) * FAN_RADIUS),
    ];
  });
}

interface CoincidentRingProps {
  count: number;
  onExpand: () => void;
}

/**
 * Records at one exact point, drawn as a dashed ring with their count. Clicking fans
 * them apart. Coincidence is shown rather than resolved by nudging pins: if curation
 * separates the coordinates, the ring simply stops appearing. Spec 034 FR-011.
 *
 * Ocean blue comes from the status table's `partial` entry — the ring marks records,
 * and it follows the theme like every other status colour.
 */
export function CoincidentRing({ count, onExpand }: CoincidentRingProps) {
  const blue = statusVar("partial");

  return (
    <button
      type="button"
      aria-expanded={false}
      aria-label={`${count} records at one point`}
      title={`${count} records at one point`}
      onClick={onExpand}
      className="flex size-10 cursor-pointer items-center justify-center rounded-full font-sans text-sm font-semibold"
      style={{
        border: `2px dashed ${blue}`,
        color: blue,
        background: "color-mix(in srgb, var(--background) 90%, transparent)",
      }}
    >
      {count}
    </button>
  );
}
