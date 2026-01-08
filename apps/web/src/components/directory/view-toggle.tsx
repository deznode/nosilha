"use client";

import { Grid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="bg-background-tertiary flex rounded-md p-1">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "grid"
            ? "bg-background-primary text-ocean-blue shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="Grid view"
      >
        <Grid size={18} />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "list"
            ? "bg-background-primary text-ocean-blue shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="List view"
      >
        <List size={18} />
      </button>
    </div>
  );
}
