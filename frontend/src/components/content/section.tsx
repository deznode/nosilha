import { ReactNode } from "react";

export interface SectionProps {
  variant?: "card" | "default" | "gradient";
  children: ReactNode;
  className?: string;
}

/**
 * Section wrapper component for MDX content
 * Provides consistent styling for different section types
 */
export function Section({
  variant = "default",
  children,
  className = "",
}: SectionProps) {
  const variantClasses = {
    card: "bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm",
    default: "mt-16",
    gradient:
      "from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8",
  };

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      {children}
    </section>
  );
}
