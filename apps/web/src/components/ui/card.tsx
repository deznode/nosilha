import * as React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift animation with shadow transition */
  hoverable?: boolean;
  /** Optional card title rendered as h4 */
  title?: string;
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
 *
 * @example
 * // Basic card
 * <Card className="p-6">Content</Card>
 *
 * // With title
 * <Card title="Section Title" className="p-6">Content</Card>
 *
 * // Hoverable card
 * <Card hoverable className="p-6">Interactive content</Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, title, children, ...props }, ref) => (
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
    >
      {title && (
        <h4 className="text-body mb-3 text-lg font-semibold">{title}</h4>
      )}
      {children}
    </div>
  )
);
Card.displayName = "Card";
