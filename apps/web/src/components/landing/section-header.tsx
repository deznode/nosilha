import type { SectionHeaderProps } from "@/types/landing";

/**
 * SectionHeader - Reusable header for landing page sections
 *
 * Displays a title with optional subtitle and accent bar.
 * Can be centered or left-aligned.
 */
export function SectionHeader({
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      <h2 className="text-ocean-blue mb-4 font-serif text-3xl font-bold md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-basalt-500 mx-auto max-w-2xl font-sans text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className={`bg-bougainvillea-pink mt-4 h-1 w-24 rounded-full ${centered ? "mx-auto" : ""}`}
      />
    </div>
  );
}
