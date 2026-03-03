import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Heading level to use. Use "h2" when page already has an H1 elsewhere.
   * @default "h1"
   */
  as?: "h1" | "h2";
}

/**
 * A consistent header component for main pages, displaying a title and an optional subtitle.
 *
 * @param {PageHeaderProps} props The component props.
 * @param {string} props.title The main title, rendered with a serif font.
 * @param {string} [props.subtitle] An optional subtitle, rendered with a sans-serif font.
 * @param {"h1" | "h2"} [props.as="h1"] The heading level to use.
 */
export function PageHeader({
  title,
  subtitle,
  as: Heading = "h1",
}: PageHeaderProps) {
  return (
    <div className="text-center">
      <Heading className="text-text-primary font-serif text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </Heading>
      {subtitle && (
        <p className="text-text-secondary mx-auto mt-4 max-w-3xl font-sans text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
