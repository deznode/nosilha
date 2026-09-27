"use client";

import { clsx } from "clsx";

export interface Chip<K extends string> {
  key: K;
  label: string;
  count: number;
}

/**
 * One scrolling row of filter chips, each with its count; the active one is pressed.
 * The media immersion screens' filter row (spec 038 FR-011, FR-032).
 */
export function ChipRow<K extends string>({
  chips,
  active,
  onSelect,
  label,
  className,
}: {
  chips: readonly Chip<K>[];
  active: K;
  onSelect: (key: K) => void;
  /** The group's accessible name. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx("scrollbar-hide flex gap-1.5 overflow-x-auto", className)}
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
