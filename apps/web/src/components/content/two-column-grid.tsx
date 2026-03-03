import { ReactNode } from "react";
import clsx from "clsx";

export interface TwoColumnGridProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const GAP_CLASSES = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
} as const;

/**
 * Two-column responsive grid layout.
 * Stacks on mobile, side-by-side on desktop.
 */
export function TwoColumnGrid({
  children,
  gap = "lg",
  className,
}: TwoColumnGridProps) {
  return (
    <div
      className={clsx(
        "grid items-start lg:grid-cols-2",
        GAP_CLASSES[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
