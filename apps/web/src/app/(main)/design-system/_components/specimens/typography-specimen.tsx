"use client";

import { Check, Copy } from "lucide-react";
import { clsx } from "clsx";
import { useCopy } from "../../_hooks/use-copy";
import type { TypographyToken, TypographyGroup } from "../../_data/typography";

interface TypographySpecimenProps {
  token: TypographyToken;
}

/**
 * Individual typography specimen showing live text sample.
 */
export function TypographySpecimen({ token }: TypographySpecimenProps) {
  const { copied, copy } = useCopy();

  return (
    <div className="border-hairline rounded-card bg-surface group border p-4">
      {/* Sample text */}
      <div className="mb-4">
        <p className={clsx(token.tailwindClass, "text-body")}>
          {token.sampleText}
        </p>
      </div>

      {/* Token details */}
      <div className="border-hairline flex flex-wrap items-start justify-between gap-3 border-t pt-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-body text-sm font-medium">{token.name}</h4>
          <p className="text-muted mt-0.5 text-xs">{token.usage}</p>
        </div>

        {/* Copy button */}
        <button
          onClick={() => copy(token.tailwindClass)}
          className={clsx(
            "rounded-badge bg-surface-alt flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            "hover:bg-mist-200 dark:hover:bg-basalt-800",
            "focus-ring"
          )}
          aria-label="Copy Tailwind classes"
        >
          <code className="font-mono">{token.tailwindClass}</code>
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="text-muted h-3 w-3" />
          )}
        </button>
      </div>

      {/* Size specs */}
      <div className="text-muted mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          Mobile: <code className="font-mono">{token.mobileSizeRem}</code>
        </span>
        <span>
          Desktop: <code className="font-mono">{token.desktopSizeRem}</code>
        </span>
        <span>
          Weight: <code className="font-mono">{token.weight}</code>
        </span>
        <span>
          Line Height: <code className="font-mono">{token.lineHeight}</code>
        </span>
        {token.letterSpacing && (
          <span>
            Letter Spacing:{" "}
            <code className="font-mono">{token.letterSpacing}</code>
          </span>
        )}
      </div>
    </div>
  );
}

interface TypographyGroupDisplayProps {
  group: TypographyGroup;
}

/**
 * Display a group of related typography tokens.
 */
export function TypographyGroupDisplay({ group }: TypographyGroupDisplayProps) {
  return (
    <div className="mt-10 first:mt-0">
      <div className="mb-4">
        <h3 className="text-body font-sans text-lg font-medium">
          {group.name}
        </h3>
        <p className="text-muted text-sm">
          {group.description} •{" "}
          <code className="font-mono">{group.fontVariable}</code>
        </p>
      </div>
      <div className="space-y-4">
        {group.tokens.map((token) => (
          <TypographySpecimen key={token.name} token={token} />
        ))}
      </div>
    </div>
  );
}
