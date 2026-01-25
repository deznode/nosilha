import * as React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift animation with shadow transition */
  hoverable?: boolean;
}

/**
 * A custom, reusable Card component for the nosilha.com project.
 * It provides a basic visual shell (border, background, rounding)
 * and can be extended with additional styles via the className prop.
 *
 * Uses Calm Premium design tokens:
 * - rounded-card (16px) border radius
 * - shadow-subtle default, shadow-lift on hover (when hoverable)
 * - ease-calm transition timing
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        // Base styles with Calm Premium tokens
        "rounded-card border-hairline bg-surface shadow-subtle border",
        // Hover animation when hoverable
        hoverable &&
          "ease-calm hover:shadow-lift transition-all duration-200 hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
