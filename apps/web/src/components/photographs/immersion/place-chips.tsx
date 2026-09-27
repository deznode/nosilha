"use client";

import { clsx } from "clsx";

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
    <div
      role="group"
      aria-label="Filter by place"
      className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-0.5"
    >
      {chips.map((chip) => {
        const on = chip.key === active;
        return (
          <button
            key={chip.key}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(chip.key)}
            className={clsx(
              "focus-ring flex flex-none items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[13px] whitespace-nowrap transition-all duration-[180ms] ease-(--ease-archive) motion-reduce:transition-none",
              on
                ? "bg-foreground text-background border-foreground"
                : "text-body border-border-subtle hover:border-border-strong bg-transparent"
            )}
          >
            {chip.label}
            <span className="text-[11px] opacity-60">{chip.count}</span>
          </button>
        );
      })}
    </div>
  );
}
