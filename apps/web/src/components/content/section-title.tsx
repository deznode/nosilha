import { ReactNode } from "react";

export interface SectionTitleProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}

/**
 * Section title component (h3) with consistent styling
 */
export function SectionTitle({
  children,
  centered = false,
  className = "",
}: SectionTitleProps) {
  return (
    <h3
      className={`text-text-primary mb-8 font-serif text-2xl font-bold ${
        centered ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </h3>
  );
}
