"use client";

import * as React from "react";
import clsx from "clsx";
import { X } from "lucide-react";

type ColorScheme = "ocean" | "pink";

const colorClasses: Record<
  ColorScheme,
  { active: string; count: string; clear: string }
> = {
  ocean: {
    active: "border-ocean-blue bg-ocean-blue/10 text-ocean-blue",
    count: "text-ocean-blue",
    clear: "text-ocean-blue/70 hover:text-ocean-blue hover:bg-ocean-blue/20",
  },
  pink: {
    active:
      "border-bougainvillea-pink bg-bougainvillea-pink/10 text-bougainvillea-pink",
    count: "text-bougainvillea-pink/70",
    clear:
      "text-bougainvillea-pink/70 hover:text-bougainvillea-pink hover:bg-bougainvillea-pink/20",
  },
};

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
  onClear?: () => void;
  colorScheme?: ColorScheme;
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      label,
      active = false,
      count,
      icon,
      onClick,
      onClear,
      colorScheme = "ocean",
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorClasses[colorScheme];

    const chipStyles = clsx(
      "touch-target rounded-button inline-flex h-9 shrink-0 items-center gap-1.5 border text-sm font-medium whitespace-nowrap transition-colors",
      active
        ? colors.active
        : "border-hairline bg-surface text-body shadow-subtle hover:bg-surface-alt",
      className
    );

    const labelContent = (
      <>
        {icon && <span className="flex shrink-0 items-center">{icon}</span>}
        <span>{label}</span>
        {count != null && count > 0 && (
          <span
            className={clsx(
              "ml-0.5 text-xs",
              active ? colors.count : "text-muted"
            )}
          >
            {count}
          </span>
        )}
      </>
    );

    // When active with a clear action, render two sibling buttons
    // to avoid nesting an interactive element inside a button (ARIA violation)
    if (active && onClear) {
      return (
        <div role="group" aria-label={label} className={chipStyles}>
          <button
            ref={ref}
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 pl-3"
            {...props}
          >
            {labelContent}
          </button>
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={onClear}
            className={clsx(
              "mr-1.5 ml-0.5 flex shrink-0 items-center rounded-full p-0.5 transition-colors",
              colors.clear
            )}
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={clsx(chipStyles, "px-3")}
        {...props}
      >
        {labelContent}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";
