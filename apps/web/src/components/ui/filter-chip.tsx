"use client";

import * as React from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
  onClear?: () => void;
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
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={clsx(
          "touch-target rounded-button inline-flex h-9 shrink-0 items-center gap-1.5 border px-3 text-sm font-medium whitespace-nowrap transition-colors",
          active
            ? "border-ocean-blue bg-ocean-blue/10 text-ocean-blue"
            : "border-hairline bg-surface text-body shadow-subtle hover:bg-surface-alt",
          className
        )}
        {...props}
      >
        {icon && <span className="flex shrink-0 items-center">{icon}</span>}
        <span>{label}</span>
        {count != null && count > 0 && (
          <span
            className={clsx(
              "ml-0.5 text-xs",
              active ? "text-ocean-blue/70" : "text-muted"
            )}
          >
            {count}
          </span>
        )}
        {active && onClear && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                onClear();
              }
            }}
            className="text-ocean-blue/70 hover:text-ocean-blue hover:bg-ocean-blue/20 -mr-1 ml-0.5 flex shrink-0 items-center rounded-full p-0.5 transition-colors"
          >
            <X size={14} />
          </span>
        )}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";
