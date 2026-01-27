import * as React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

interface FeatureCardProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Icon color class (e.g., "text-ocean-blue", "text-valley-green") */
  iconColor?: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional children rendered after description */
  children?: React.ReactNode;
  /** Additional className for the card container */
  className?: string;
  /** Center content (default: false for left-aligned) */
  centered?: boolean;
}

/**
 * FeatureCard - A composed card component for feature/info grids.
 *
 * Combines the base Card component with a consistent layout for:
 * - Icon with customizable color
 * - Title and description
 * - Optional children (buttons, links)
 * - Hover lift animation
 *
 * Used in: About page, Contribute page, Contact page FAQ cards
 *
 * @example
 * <FeatureCard
 *   icon={Heart}
 *   iconColor="text-ocean-blue"
 *   title="Community First"
 *   description="Every feature we build serves the local community."
 * />
 */
export function FeatureCard({
  icon: Icon,
  iconColor = "text-ocean-blue",
  title,
  description,
  children,
  className,
  centered = false,
}: FeatureCardProps) {
  return (
    <Card
      hoverable
      className={clsx(
        "p-6 transition-all duration-300 hover:-translate-y-1",
        centered && "text-center",
        className
      )}
    >
      <Icon
        className={clsx("mb-4 h-10 w-10", centered && "mx-auto", iconColor)}
      />
      <h4 className="text-body mb-2 text-lg font-semibold">{title}</h4>
      <p className="text-muted">{description}</p>
      {children}
    </Card>
  );
}
