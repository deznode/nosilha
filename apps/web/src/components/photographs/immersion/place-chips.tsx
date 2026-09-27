"use client";

import { ChipRow } from "@/components/ui/chip-row";
import type { PlaceChip } from "@/lib/archive-photographs";

/**
 * One scrolling row: All, each settlement by count, Not yet placed. Spec 038 FR-011.
 * The active chip is the page's filter; choosing one replaces the URL without scrolling.
 */
export function PlaceChips({
  chips,
  active,
  onSelect,
}: {
  chips: readonly PlaceChip[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ChipRow
      chips={chips}
      active={active}
      onSelect={onSelect}
      label="Filter by place"
      className="pb-0.5"
    />
  );
}
