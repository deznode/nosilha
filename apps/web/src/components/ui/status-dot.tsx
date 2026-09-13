import * as React from "react";
import clsx from "clsx";
import type { DocumentationStatus } from "@/lib/documentation-status";

// The partial label is neutral on purpose. Sunny yellow measures 3.62–4.22:1 as text
// on the light backgrounds, which fails AA at this size; the dot beside it still
// carries the colour at ≥3:1. Green and ochre pass as text in both themes.
const statusClasses: Record<
  DocumentationStatus,
  { dot: string; label: string }
> = {
  documented: { dot: "bg-valley-green", label: "text-valley-green" },
  partial: { dot: "bg-sunny-yellow", label: "text-muted-foreground" },
  gap: { dot: "bg-sobrado-ochre", label: "text-sobrado-ochre" },
};

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: DocumentationStatus;
  label: string;
  /** Hide the label visually while keeping it for screen readers. */
  hideLabel?: boolean;
}

/**
 * A documentation-status dot with its uppercase label.
 *
 * Shared by the settlement cards, the map legend and the photograph tiles, so the
 * three states look the same everywhere they appear. Spec 033 FR-005.
 */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ status, label, hideLabel = false, className, ...props }, ref) => {
    const classes = statusClasses[status];

    return (
      <span
        ref={ref}
        className={clsx("inline-flex items-center gap-2", className)}
        {...props}
      >
        <span
          data-status-dot
          aria-hidden="true"
          className={clsx("size-2 shrink-0 rounded-full", classes.dot)}
        />
        <span
          className={clsx(
            hideLabel
              ? "sr-only"
              : "font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase",
            !hideLabel && classes.label
          )}
        >
          {label}
        </span>
      </span>
    );
  }
);
StatusDot.displayName = "StatusDot";
