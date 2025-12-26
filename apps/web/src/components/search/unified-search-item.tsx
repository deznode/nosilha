"use client";

import Link from "next/link";
import {
  MapPin,
  Utensils,
  Hotel,
  Umbrella,
  Landmark,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { UnifiedSearchResult, DirectoryCategory } from "@/types/search";

interface UnifiedSearchItemProps {
  result: UnifiedSearchResult;
  onSelect?: () => void;
}

/** Category icon mapping */
const CATEGORY_ICONS: Record<DirectoryCategory, LucideIcon> = {
  Restaurant: Utensils,
  Hotel: Hotel,
  Beach: Umbrella,
  Landmark: Landmark,
};

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
    const Icon = CATEGORY_ICONS[result.category] || MapPin;

    return (
      <li>
        <Link
          href={result.url}
          onClick={onSelect}
          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Icon size={16} className="text-amber-200" aria-hidden="true" />
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
              dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }}
            />
          )}
        </div>
      </Link>
    </li>
  );
}
