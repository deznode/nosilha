"use client";

import clsx from "clsx";

// --- Configuration ---
const DEFAULT_LOGO_TEXT = "Nosilha";
const DEFAULT_SUBTITLE = "BRAVA, CV";

// --- Variants ---
interface LogoProps {
  variant?: "default" | "compact"; // default = vertical/large, compact = horizontal/small (navbar)
  inverted?: boolean; // If true, uses light colors for dark backgrounds (footer/hero)
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string; // Allow overriding the subtitle text
}

// --- Icons ---
// A stylized Hibiscus flower to represent "Ilha das Flores"
const FlowerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true" // Decorative icon, hide from screen readers
  >
    {/* Back petals */}
    <path
      d="M12 2C9.5 5 5 7 5 10C5 13.5 8 15 8 18C8 20 6 22 6 22C6 22 9 21.5 11 20C13 18.5 13 16 13 14"
      className="opacity-60"
    />
    {/* Front petals */}
    <path d="M12 2C14.5 5 19 7 19 10C19 13.5 16 15 16 18C16 20 18 22 18 22C18 22 15 21.5 13 20C11 18.5 11 16 11 14" />
    {/* Center detail */}
    <path d="M12 14C10 11 8 9 5 9C2 9 2 13 4 14.5C6 16 9 16 12 14Z" />
    <path d="M12 14C14 11 16 9 19 9C22 9 22 13 20 14.5C18 16 15 16 12 14Z" />
    {/* Stamen (Yellow center) */}
    <circle
      cx="12"
      cy="11"
      r="1.5"
      className="text-sobrado-ochre"
      fill="currentColor"
    />
  </svg>
);

export function Logo({
  variant = "compact",
  inverted = false,
  showSubtitle = true,
  subtitle = DEFAULT_SUBTITLE,
  className,
}: LogoProps) {
  const isCompact = variant === "compact";

  // Determine text colors based on 'inverted' prop
  const textColor = inverted ? "text-white" : "text-ocean-blue";
  const subtitleColor = inverted ? "text-white/80" : "text-basalt-500";
  const iconColor = inverted ? "text-white" : "text-bougainvillea-pink";

  return (
    <div
      className={clsx(
        "group flex items-center select-none",
        isCompact ? "flex-row gap-2" : "flex-col gap-1",
        className
      )}
    >
      {/* Icon Wrapper */}
      <div
        className={clsx(
          "origin-center transform transition-transform duration-500 ease-in-out group-hover:rotate-12",
          iconColor,
          isCompact ? "h-8 w-8" : "mb-2 h-16 w-16"
        )}
      >
        <FlowerIcon className="h-full w-full" />
      </div>

      {/* Text Container */}
      <div
        className={clsx(
          "flex flex-col",
          isCompact ? "items-start" : "items-center"
        )}
      >
        <div
          className={clsx(
            "flex overflow-hidden font-serif leading-none font-bold tracking-tight transition-colors duration-300",
            textColor,
            isCompact ? "text-2xl" : "text-4xl md:text-5xl"
          )}
          aria-label={DEFAULT_LOGO_TEXT}
        >
          {Array.from(DEFAULT_LOGO_TEXT).map((letter, index) => (
            <span
              key={index}
              className="inline-block transition-transform duration-200 hover:-translate-y-0.5"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>

        {showSubtitle && (
          <p
            className={clsx(
              "font-sans font-medium tracking-[0.2em] uppercase transition-colors duration-300",
              subtitleColor,
              // On hover, if not inverted, subtitle turns blue. If inverted, it turns yellow.
              inverted
                ? "group-hover:text-sobrado-ochre"
                : "group-hover:text-ocean-blue",
              isCompact ? "ml-0.5 text-[0.6rem]" : "mt-1 text-sm"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
