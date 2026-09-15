import * as React from "react";
import clsx from "clsx";
import { statusVar, type DocumentationStatus } from "@/lib/status";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: DocumentationStatus;
  label: string;
  /** Hide the label visually while keeping it for screen readers. */
  hideLabel?: boolean;
}

/**
 * A documentation status dot with its uppercase label.
 *
 * Shared by the settlement cards, the map legend and the photograph tiles, so the
 * three states look the same everywhere they appear. The colour comes only from
 * `STATUS_CONFIG`, as a theme-following variable. Dot and label share it: green, ocean
 * blue and ochre all pass AA as text in both themes, which sunny yellow never did.
 * Spec 033 FR-005, spec 034 FR-002.
 */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ status, label, hideLabel = false, className, ...props }, ref) => {
    const colour = statusVar(status);

    return (
      <span
        ref={ref}
        className={clsx("inline-flex items-center gap-2", className)}
        {...props}
      >
        <span
          data-status-dot
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: colour }}
        />
        <span
          className={clsx(
            hideLabel
              ? "sr-only"
              : "font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase"
          )}
          style={hideLabel ? undefined : { color: colour }}
        >
          {label}
        </span>
      </span>
    );
  }
);
StatusDot.displayName = "StatusDot";
