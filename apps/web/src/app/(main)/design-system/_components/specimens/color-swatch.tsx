"use client";

import { useState } from "react";
import { Check, Copy, Moon, Sun } from "lucide-react";
import { clsx } from "clsx";
import { useCopy } from "../../_hooks/use-copy";
import type { ColorToken, ColorGroup } from "../../_data/colors";

interface ColorSwatchProps {
  token: ColorToken;
}

/**
 * Individual color swatch component.
 * Displays color value, variable name, and supports dark mode preview.
 */
export function ColorSwatch({ token }: ColorSwatchProps) {
  const { copied, copy } = useCopy();
  const [showDark, setShowDark] = useState(false);

  const currentHex = showDark && token.darkHex ? token.darkHex : token.lightHex;

  return (
    <div className="group flex flex-col">
      {/* Color preview */}
      <div
        className="rounded-card shadow-subtle relative mb-3 aspect-square w-full overflow-hidden"
        style={{ backgroundColor: currentHex }}
      >
        {/* Dark mode toggle (only if dark value exists) */}
        {token.darkHex && (
          <button
            onClick={() => setShowDark(!showDark)}
            className={clsx(
              "rounded-badge absolute top-2 right-2 p-1.5 transition-opacity",
              "bg-white/20 backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "focus-ring"
            )}
            aria-label={showDark ? "Show light mode" : "Show dark mode"}
          >
            {showDark ? (
              <Sun className="h-4 w-4 text-white" />
            ) : (
              <Moon className="h-4 w-4 text-white" />
            )}
          </button>
        )}

        {/* Dark mode indicator */}
        {token.darkHex && showDark && (
          <span className="rounded-badge absolute bottom-2 left-2 bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Dark Mode
          </span>
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-body text-sm font-medium">{token.name}</h4>
          <button
            onClick={() => copy(`var(${token.variable})`)}
            className="text-muted hover:text-body focus-ring rounded p-1 transition-colors"
            aria-label="Copy CSS variable"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* CSS variable */}
        <button
          onClick={() => copy(`var(${token.variable})`)}
          className="text-muted hover:text-body w-full truncate text-left font-mono text-xs transition-colors"
        >
          {token.variable}
        </button>

        {/* Hex value */}
        <button
          onClick={() => copy(currentHex)}
          className="text-muted hover:text-body font-mono text-xs uppercase transition-colors"
        >
          {currentHex}
        </button>

        {/* Description */}
        <p className="text-muted text-xs">{token.description}</p>
      </div>
    </div>
  );
}

interface ColorGroupDisplayProps {
  group: ColorGroup;
}

/**
 * Display a group of related color tokens.
 */
export function ColorGroupDisplay({ group }: ColorGroupDisplayProps) {
  return (
    <div className="mt-8 first:mt-0">
      <div className="mb-4">
        <h3 className="text-body font-sans text-lg font-medium">
          {group.name}
        </h3>
        <p className="text-muted text-sm">{group.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {group.tokens.map((token) => (
          <ColorSwatch key={token.variable} token={token} />
        ))}
      </div>
    </div>
  );
}
