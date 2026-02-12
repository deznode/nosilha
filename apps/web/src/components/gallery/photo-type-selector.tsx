"use client";

/**
 * Photo Type Selector
 *
 * Radio button group for selecting photo type which determines GPS privacy handling.
 * Mobile-friendly with large touch targets.
 */

import { clsx } from "clsx";
import { MapPin, Users, Lock } from "lucide-react";
import type { PhotoType } from "@/types/media";

interface PhotoTypeSelectorProps {
  value: PhotoType;
  onChange: (type: PhotoType) => void;
  disabled?: boolean;
}

const PHOTO_TYPES: {
  value: PhotoType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}[] = [
  {
    value: "CULTURAL_SITE",
    label: "Cultural Site",
    description: "Full GPS for heritage locations",
    icon: MapPin,
    color: "text-valley-green",
  },
  {
    value: "COMMUNITY_EVENT",
    label: "Community Event",
    description: "Location rounded to ~100m",
    icon: Users,
    color: "text-ocean-blue",
  },
  {
    value: "PERSONAL",
    label: "Personal",
    description: "Location removed entirely",
    icon: Lock,
    color: "text-bougainvillea-pink",
  },
];

export function PhotoTypeSelector({
  value,
  onChange,
  disabled = false,
}: PhotoTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
        Photo Type
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PHOTO_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              disabled={disabled}
              className={clsx(
                "rounded-card flex min-h-[60px] items-center gap-3 border-2 p-4 text-left transition-all",
                isSelected
                  ? ["bg-surface shadow-subtle border-current", type.color]
                  : "border-hairline hover:bg-surface/50 hover:border-current",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              )}
              aria-pressed={isSelected}
            >
              <Icon
                size={20}
                className={isSelected ? type.color : "text-muted"}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-semibold ${isSelected ? type.color : "text-body"}`}
                >
                  {type.label}
                </div>
                <div className="text-muted truncate text-xs">
                  {type.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
