"use client";

import {
  KPICards,
  ActivityChart,
  CoverageChart,
  TopContributors,
} from "@/components/admin/dashboard";
import { useAdminStats, useAdminContributors } from "@/hooks/queries/admin";
import type { AdminStats } from "@/types/admin";

const defaultStats: AdminStats = {
  newSuggestions: 0,
  storySubmissions: 0,
  contactInquiries: 0,
  directorySubmissions: 0,
  mediaPending: 0,
  activeUsers: 0,
  locationsCovered: 0,
  weeklyActivity: [],
  coverageByTown: [],
};

export default function AdminDashboardPage() {
  const statsQuery = useAdminStats();
  const contributorsQuery = useAdminContributors();

  const stats = statsQuery.data ?? defaultStats;
  const contributors = contributorsQuery.data ?? [];
  const isLoading = statsQuery.isLoading;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* KPI Cards */}
        <KPICards stats={stats} isLoading={isLoading} />

        {/* Analytics Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ActivityChart data={stats.weeklyActivity} isLoading={isLoading} />

          <div className="space-y-6">
            <CoverageChart data={stats.coverageByTown} isLoading={isLoading} />
            <TopContributors
              contributors={contributors}
              isLoading={contributorsQuery.isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
