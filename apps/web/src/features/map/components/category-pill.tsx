"use client";

import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface CategoryPillProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export function CategoryPill({
  label,
  icon: Icon,
  active,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "shadow-subtle flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap backdrop-blur-md transition-all duration-300",
        active
          ? "bg-ocean-blue border-ocean-blue shadow-ocean-blue/20 text-white"
          : "border-border-primary text-volcanic-gray hover:border-ocean-blue/50 hover:text-ocean-blue bg-white/80 hover:bg-white dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white"
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
