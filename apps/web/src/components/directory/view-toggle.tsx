"use client";

import { Grid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-md bg-slate-100 p-1 dark:bg-slate-700">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "grid"
            ? "bg-white text-[var(--color-ocean-blue)] shadow-sm dark:bg-slate-600"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
        aria-label="Grid view"
      >
        <Grid size={18} />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "list"
            ? "bg-white text-[var(--color-ocean-blue)] shadow-sm dark:bg-slate-600"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
        aria-label="List view"
      >
        <List size={18} />
      </button>
    </div>
  );
}
