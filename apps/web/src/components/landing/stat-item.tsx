import type { StatItemData } from "@/types/landing";

/**
 * StatItem - Individual stat display
 *
 * Displays a value and label in a vertical layout.
 * Used in the Community Stats section.
 */
export function StatItem({ value, label }: StatItemData) {
  return (
    <div className="px-4 text-center">
      <div className="text-ocean-blue font-serif text-3xl font-bold">
        {value}
      </div>
      <div className="text-basalt-500 mt-1 text-xs tracking-wider uppercase">
        {label}
      </div>
    </div>
  );
}
