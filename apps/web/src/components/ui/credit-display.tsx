"use client";

import * as React from "react";
import { clsx } from "clsx";
import { ExternalLink } from "lucide-react";
import {
  PLATFORM_PROFILE_URLS,
  PLATFORM_LABELS,
  type CreditPlatform,
} from "@/lib/credit-utils";

interface CreditDisplayProps {
  /** Display name (e.g., "@nosilha" or "João Silva") */
  credit: string;
  /** Detected social platform, or undefined for plain names */
  creditPlatform?: CreditPlatform | string;
  /** Normalized handle without @ prefix */
  creditHandle?: string;
  /** Rendering variant */
  variant?: "card" | "lightbox";
  className?: string;
}

/**
 * Renders creator credit as a clickable social link or plain text.
 *
 * - Social handles: renders as `<a>` with platform name and external link icon
 * - Plain names: renders as `<span>` (no link)
 */
export const CreditDisplay = React.forwardRef<
  HTMLSpanElement,
  CreditDisplayProps
>(
  (
    {
      credit,
      creditPlatform,
      creditHandle,
      variant = "card",
      className,
    },
    ref
  ) => {
    if (!credit) return null;

    const isCompact = variant === "card";
    const platform = creditPlatform as CreditPlatform | undefined;

    // Social link mode
    if (platform && creditHandle && platform in PLATFORM_PROFILE_URLS) {
      const profileUrl = PLATFORM_PROFILE_URLS[platform](creditHandle);
      const platformLabel = PLATFORM_LABELS[platform] || platform;

      return (
        <span ref={ref} className={clsx("inline-flex items-center gap-1", className)}>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${credit} on ${platformLabel} (opens in new tab)`}
            className={clsx(
              "inline-flex items-center gap-1 transition-colors",
              isCompact
                ? "text-ocean-blue hover:text-ocean-blue-deep text-xs font-medium"
                : "text-ocean-blue hover:text-ocean-blue-deep text-sm font-medium"
            )}
          >
            <span>{credit}</span>
            <ExternalLink
              size={isCompact ? 10 : 12}
              className="flex-shrink-0 opacity-60"
              aria-hidden="true"
            />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </span>
      );
    }

    // Plain text mode
    return (
      <span
        ref={ref}
        className={clsx(
          isCompact ? "text-muted text-xs" : "text-muted text-sm",
          className
        )}
      >
        {credit}
      </span>
    );
  }
);
CreditDisplay.displayName = "CreditDisplay";
