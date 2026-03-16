import { ReactNode } from "react";
import clsx from "clsx";

export interface SectionProps {
  variant?: "card" | "default" | "gradient";
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES = {
  card: "bg-surface border-hairline mt-8 sm:mt-16 rounded-lg border p-8 shadow-sm",
  default: "mt-8 sm:mt-16",
  gradient:
    "from-ocean-blue/10 to-valley-green/10 mt-8 sm:mt-16 rounded-lg bg-gradient-to-r p-8",
} as const;

/**
 * Section wrapper component for MDX content.
 * Provides consistent styling for different section types.
 */
export function Section({
  variant = "default",
  children,
  className,
}: SectionProps): ReactNode {
  return (
    <section className={clsx(VARIANT_CLASSES[variant], className)}>
      {children}
    </section>
  );
}
