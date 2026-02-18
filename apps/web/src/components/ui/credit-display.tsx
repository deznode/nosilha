"use client";

import * as React from "react";
import { clsx } from "clsx";
import { ExternalLink } from "lucide-react";
import {
  PLATFORM_PROFILE_URLS,
  PLATFORM_LABELS,
  type CreditPlatform,
  type DetectedCredit,
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
    { credit, creditPlatform, creditHandle, variant = "card", className },
    ref
  ) => {
    if (!credit) return null;

    const textSizeClass = variant === "card" ? "text-xs" : "text-sm";
    const iconSize = variant === "card" ? 10 : 12;
    const platform = creditPlatform as CreditPlatform | undefined;

    // Social link mode
    if (platform && creditHandle && platform in PLATFORM_PROFILE_URLS) {
      const profileUrl = PLATFORM_PROFILE_URLS[platform](creditHandle);
      const platformLabel = PLATFORM_LABELS[platform] || platform;

      return (
        <span
          ref={ref}
          className={clsx("inline-flex items-center gap-1", className)}
        >
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${credit} on ${platformLabel} (opens in new tab)`}
            className={clsx(
              "text-ocean-blue hover:text-ocean-blue-deep inline-flex items-center gap-1 font-medium transition-colors",
              textSizeClass
            )}
          >
            <span>{credit}</span>
            <ExternalLink
              size={iconSize}
              className="flex-shrink-0 opacity-60"
              aria-hidden="true"
            />
          </a>
        </span>
      );
    }

    // Plain text mode
    return (
      <span ref={ref} className={clsx("text-muted", textSizeClass, className)}>
        {credit}
      </span>
    );
  }
);
CreditDisplay.displayName = "CreditDisplay";

interface CreditPreviewBadgeProps {
  detected: DetectedCredit;
  className?: string;
}

/**
 * Inline preview badge for detected social platform credit.
 * Used in forms to give instant feedback when a user types a social handle or URL.
 */
export function CreditPreviewBadge({
  detected,
  className,
}: CreditPreviewBadgeProps) {
  return (
    <div className={clsx("flex items-center gap-2 text-xs", className)}>
      <span className="bg-ocean-blue/10 text-ocean-blue rounded-full px-2.5 py-0.5 font-medium">
        {PLATFORM_LABELS[detected.platform]}
      </span>
      <a
        href={detected.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ocean-blue hover:underline"
      >
        @{detected.handle}
      </a>
    </div>
  );
}
