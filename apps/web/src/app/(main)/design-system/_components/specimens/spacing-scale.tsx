"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpacingToken } from "../../_data/spacing";

interface SpacingScaleProps {
  tokens: SpacingToken[];
}

/**
 * Visual spacing scale display with interactive bars.
 * Uses local state to track which token was copied since multiple tokens are displayed.
 */
export function SpacingScale({ tokens }: SpacingScaleProps) {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const toast = useToast();

  async function handleCopy(token: SpacingToken): Promise<void> {
    try {
      await navigator.clipboard.writeText(token.tailwindClass);
      setCopiedName(token.name);
      toast.showSuccess(`Copied: ${token.tailwindClass}`);
      setTimeout(() => setCopiedName(null), 2000);
    } catch {
      toast.showError("Failed to copy");
    }
  }

  return (
    <div className="space-y-3">
      {tokens.map((token) => (
        <button
          key={token.name}
          onClick={() => handleCopy(token)}
          className="border-hairline rounded-card bg-surface hover:bg-surface-alt group focus-ring flex w-full items-center gap-4 border p-3 text-left transition-colors"
        >
          {/* Visual bar */}
          <div
            className="bg-ocean-blue/20 dark:bg-ocean-blue/30 flex-shrink-0 rounded"
            style={{
              width: `${Math.min(token.pixels * 2, 128)}px`,
              height: "24px",
            }}
          >
            <div
              className="bg-ocean-blue h-full rounded"
              style={{ width: `${token.pixels}px`, minWidth: "4px" }}
            />
          </div>

          {/* Token info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-body text-sm font-medium">
                {token.name}
              </span>
              <code className="bg-surface-alt text-muted rounded px-1.5 py-0.5 font-mono text-xs">
                {token.tailwindClass}
              </code>
            </div>
            <p className="text-muted truncate text-xs">{token.usage}</p>
          </div>

          {/* Values */}
          <div className="text-muted hidden text-right text-xs sm:block">
            <div className="font-mono">{token.pixels}px</div>
            <div className="font-mono">{token.rem}</div>
          </div>

          {/* Copy indicator */}
          <div className="text-muted flex-shrink-0">
            {copiedName === token.name ? (
              <Check className="text-valley-green h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
