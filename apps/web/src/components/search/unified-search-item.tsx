"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { UnifiedSearchResult } from "@/types/search";
import { getCategoryIcon } from "@/lib/category-icons";

interface UnifiedSearchItemProps {
  result: UnifiedSearchResult;
  onSelect?: () => void;
}

/**
 * Sanitizes Pagefind search excerpts by stripping all HTML tags except <mark>.
 * Pagefind only uses <mark> tags for search term highlighting, so this strict
 * allowlist approach is safer than a general-purpose sanitizer for this use case.
 */
function sanitizeExcerpt(html: string): string {
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, "");
}

/** Get display label for category */
function getCategoryLabel(category: string): string {
  // For articles, capitalize first letter
  if (
    category === "music" ||
    category === "history" ||
    category === "traditions" ||
    category === "places" ||
    category === "people"
  ) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return category;
}

export function UnifiedSearchItem({
  result,
  onSelect,
}: UnifiedSearchItemProps) {
  if (result.type === "directory") {
    return (
      <li>
        <Link
          href={result.url}
          onClick={onSelect}
          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            {React.createElement(getCategoryIcon(result.category), {
              size: 16,
              className: "text-amber-200",
              "aria-hidden": true,
            })}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-white">
              {result.title}
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="truncate">{result.town}</span>
              <span className="text-stone-600">|</span>
              <span className="text-amber-200/70">{result.category}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  // Article result
  return (
    <li>
      <Link
        href={result.url}
        onClick={onSelect}
        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <FileText size={16} className="text-teal-200" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-white">{result.title}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-teal-200">
              {getCategoryLabel(result.category)}
            </span>
          </div>
          {result.highlightedExcerpt && (
            <p
              className="mt-1 line-clamp-2 text-sm text-stone-400"
              dangerouslySetInnerHTML={{
                __html: sanitizeExcerpt(result.highlightedExcerpt),
              }}
            />
          )}
        </div>
      </Link>
    </li>
  );
}
