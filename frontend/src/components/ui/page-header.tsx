import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * A consistent header component for main pages, displaying a title and an optional subtitle.
 *
 * @param {PageHeaderProps} props The component props.
 * @param {string} props.title The main title, rendered with a serif font.
 * @param {string} [props.subtitle] An optional subtitle, rendered with a sans-serif font.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-3xl font-sans text-lg text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
