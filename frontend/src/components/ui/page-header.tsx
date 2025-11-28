import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Heading level to use. Use "h2" when page already has an H1 elsewhere.
   * @default "h1"
   */
  as?: "h1" | "h2";
  /**
   * Show the bougainvillea-pink accent bar below the subtitle.
   * @default true
   */
  showAccentBar?: boolean;
  /**
   * Center the header content.
   * @default true
   */
  centered?: boolean;
  /**
   * Size variant for the header.
   * - "default": 3xl/4xl text (for section headers)
   * - "large": 4xl/5xl text (for page titles)
   * @default "large"
   */
  size?: "default" | "large";
}

/**
 * A consistent header component for main pages, displaying a title and an optional subtitle.
 * Aligned with the landing page's SectionHeader pattern for visual consistency.
 *
 * @param {PageHeaderProps} props The component props.
 * @param {string} props.title The main title, rendered with a serif font.
 * @param {string} [props.subtitle] An optional subtitle, rendered with a sans-serif font.
 * @param {"h1" | "h2"} [props.as="h1"] The heading level to use.
 * @param {boolean} [props.showAccentBar=true] Whether to show the accent bar.
 * @param {boolean} [props.centered=true] Whether to center the content.
 * @param {"default" | "large"} [props.size="large"] The size variant.
 */
export function PageHeader({
  title,
  subtitle,
  as: Heading = "h1",
  showAccentBar = true,
  centered = true,
  size = "large",
}: PageHeaderProps) {
  const textSizeClasses =
    size === "large" ? "text-4xl sm:text-5xl" : "text-3xl md:text-4xl";

  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      <Heading
        className={`text-ocean-blue mb-4 font-serif font-bold ${textSizeClasses}`}
      >
        {title}
      </Heading>
      {subtitle && (
        <p
          className={`text-volcanic-gray font-sans text-lg leading-relaxed ${
            centered ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
      {showAccentBar && (
        <div
          className={`bg-bougainvillea-pink mt-4 h-1 w-24 rounded-full ${
            centered ? "mx-auto" : ""
          }`}
        />
      )}
    </div>
  );
}
