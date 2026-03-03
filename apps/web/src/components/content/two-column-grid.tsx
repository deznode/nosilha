import { ReactNode } from "react";

export interface TwoColumnGridProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Two-column responsive grid layout
 * Stacks on mobile, side-by-side on desktop
 */
export function TwoColumnGrid({
  children,
  gap = "lg",
  className = "",
}: TwoColumnGridProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div
      className={`grid items-start lg:grid-cols-2 ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
}
