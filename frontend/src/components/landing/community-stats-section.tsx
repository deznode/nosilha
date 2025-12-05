import { SectionHeader } from "./section-header";
import { StatItem } from "./stat-item";
import type { StatItemData } from "@/types/landing";

interface CommunityStatsSectionProps {
  stats?: StatItemData[];
}

const defaultStats: StatItemData[] = [
  { value: "20+", label: "Towns" },
  { value: "150+", label: "Sites" },
  { value: "500+", label: "Photos" },
  { value: "100%", label: "Community" },
];

/**
 * CommunityStatsSection - Archive statistics
 *
 * Displays key statistics about the heritage archive in a horizontal grid.
 */
export function CommunityStatsSection({
  stats = defaultStats,
}: CommunityStatsSectionProps) {
  return (
    <section className="border-hairline bg-surface border-y py-20">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          title="Our Growing Archive"
          subtitle="Documenting the heritage of Brava, one story at a time."
          centered
        />

        {/* Stats Bar */}
        <div className="divide-hairline grid grid-cols-2 divide-x md:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
