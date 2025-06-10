import * as React from "react";
import { clsx } from "clsx";

/**
 * A custom, reusable Card component for the nosilha.com project.
 * It provides a basic visual shell (border, background, rounding)
 * and can be extended with additional styles via the className prop.
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      // Base styles for the card component
      "rounded-lg border border-zinc-950/5 bg-white",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";
