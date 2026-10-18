"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "../../_hooks/use-copy";
import type { RadiusToken } from "../../_data/spacing";

interface RadiusSpecimenProps {
  token: RadiusToken;
}

/**
 * Individual border radius specimen.
 */
export function RadiusSpecimen({ token }: RadiusSpecimenProps) {
  const { copied, copy } = useCopy();

  return (
    <button
      onClick={() => copy(token.tailwindClass)}
      className="border-hairline rounded-card bg-surface hover:bg-surface-alt group focus-ring flex items-center gap-4 border p-4 text-left transition-colors"
    >
      {/* Visual preview */}
      <div
        className="bg-ocean-blue/20 dark:bg-ocean-blue/30 flex h-16 w-16 flex-shrink-0 items-center justify-center"
        style={{ borderRadius: `${token.pixels}px` }}
      >
        <div
          className="bg-ocean-blue h-10 w-10"
          style={{ borderRadius: `${Math.max(token.pixels - 6, 0)}px` }}
        />
      </div>

      {/* Token info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-body text-sm font-medium">{token.name}</h4>
          <code className="bg-surface-alt text-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {token.pixels}px
          </code>
        </div>
        <code className="text-muted mt-1 block font-mono text-xs">
          {token.tailwindClass}
        </code>
        <p className="text-muted mt-1 text-xs">{token.usage}</p>
      </div>

      {/* Copy indicator */}
      <div className="text-muted flex-shrink-0">
        {copied ? (
          <Check className="text-valley-green h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </button>
  );
}

interface RadiusGridProps {
  tokens: RadiusToken[];
}

/**
 * Display grid for radius tokens.
 */
export function RadiusGrid({ tokens }: RadiusGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tokens.map((token) => (
        <RadiusSpecimen key={token.name} token={token} />
      ))}
    </div>
  );
}
