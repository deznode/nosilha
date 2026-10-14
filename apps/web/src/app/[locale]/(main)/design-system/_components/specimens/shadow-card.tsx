"use client";

import { Check, Copy } from "lucide-react";
import { clsx } from "clsx";
import { useCopy } from "../../_hooks/use-copy";
import type { ShadowToken } from "../../_data/spacing";

interface ShadowCardProps {
  token: ShadowToken;
}

/**
 * Interactive shadow specimen card.
 * Shows shadow elevation with hover preview.
 */
export function ShadowCard({ token }: ShadowCardProps) {
  const { copied, copy } = useCopy();

  return (
    <button
      onClick={() => copy(token.tailwindClass)}
      className={clsx(
        "rounded-card bg-surface group focus-ring flex flex-col p-6 text-left transition-all",
        token.tailwindClass
      )}
    >
      {/* Shadow preview area */}
      <div className="mb-4 flex h-20 items-center justify-center">
        <div
          className={clsx(
            "bg-canvas rounded-card h-12 w-12 transition-transform",
            token.tailwindClass,
            "group-hover:scale-110"
          )}
        />
      </div>

      {/* Token info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-body text-sm font-medium">{token.name}</h4>
          <code className="text-muted mt-1 block font-mono text-xs">
            {token.tailwindClass}
          </code>
          <p className="text-muted mt-2 text-xs">{token.usage}</p>
        </div>
        <div className="text-muted flex-shrink-0">
          {copied ? (
            <Check className="text-valley-green h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>
    </button>
  );
}

interface ShadowGridProps {
  tokens: ShadowToken[];
}

/**
 * Grid layout for shadow specimens.
 */
export function ShadowGrid({ tokens }: ShadowGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <ShadowCard key={token.name} token={token} />
      ))}
    </div>
  );
}
