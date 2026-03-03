/**
 * HistoricalFigures Component
 *
 * Renders a grid of historical figures with their roles, years, and descriptions.
 * Designed for cultural heritage content pages.
 */

import Link from "next/link";

export interface HistoricalFigure {
  name: string;
  role: string;
  years: string;
  description: string;
  slug?: string; // Optional link to dedicated page
}

interface HistoricalFiguresProps {
  figures: HistoricalFigure[];
  title?: string;
  subtitle?: string;
  exploreLink?: string;
  exploreLinkText?: string;
  className?: string;
}

export function HistoricalFigures({
  figures,
  title = "Cultural Architects",
  subtitle,
  exploreLink,
  exploreLinkText = "Explore All Historical Figures",
  className = "",
}: HistoricalFiguresProps) {
  return (
    <section
      className={`bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm ${className}`}
    >
      <div className="mb-8 text-center">
        <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
          {title}
        </h3>
        {subtitle && <p className="text-text-secondary mb-6">{subtitle}</p>}
        {exploreLink && (
          <Link
            href={exploreLink}
            className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
          >
            {exploreLinkText}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {figures.map((figure, index) => (
          <div
            key={`${figure.name}-${index}`}
            className="border-ocean-blue border-l-4 pl-6"
          >
            <h4 className="text-text-primary text-lg font-semibold">
              {figure.slug ? (
                <Link
                  href={`/people/${figure.slug}`}
                  className="hover:text-ocean-blue transition-colors"
                >
                  {figure.name}
                </Link>
              ) : (
                figure.name
              )}
            </h4>
            <p className="text-ocean-blue mb-2 text-sm font-medium">
              {figure.role} • {figure.years}
            </p>
            <p className="text-text-secondary text-sm">{figure.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
