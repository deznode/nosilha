"use client";

import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface border-border-primary rounded-lg border p-6 shadow-sm ${className}`}
    >
      {title && (
        <h4 className="text-text-primary mb-3 text-lg font-semibold">
          {title}
        </h4>
      )}
      <div>{children}</div>
    </div>
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
