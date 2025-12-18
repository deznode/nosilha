"use client";

import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  className?: string;
}

export function BookmarkButton({
  isBookmarked,
  onToggle,
  className = "",
}: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`rounded-full p-2 backdrop-blur-md transition-all ${
        isBookmarked
          ? "bg-[var(--color-ocean-blue)] text-white"
          : "bg-white/70 text-slate-900 hover:bg-white dark:bg-slate-800/70 dark:text-white dark:hover:bg-slate-700"
      } ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
    </button>
  );
}
