"use client";

import { ReactNode } from "react";
import { Card as BaseCard } from "@/components/ui/card";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Content Card - Wrapper around the base Card component for MDX content.
 * Includes default padding suitable for article content.
 *
 * @deprecated Prefer using `@/components/ui/card` directly with className="p-6"
 */
export function Card({ title, children, className = "" }: CardProps) {
  return (
    <BaseCard title={title} className={`p-6 ${className}`}>
      <div>{children}</div>
    </BaseCard>
  );
}

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function CardGrid({
  children,
  columns = 2,
  className = "",
}: CardGridProps) {
  const gridCols = {
    1: "",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>
      {children}
    </div>
  );
}
