"use client";

import { MessageSquare, FileText, Users, Map, Image } from "lucide-react";
import type { AdminStats } from "@/types/admin";

interface KPICardsProps {
  stats: AdminStats;
  isLoading?: boolean;
}

interface KPICardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

function KPICard({ label, value, icon, colorClass }: KPICardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClass}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center">
        <div className="h-12 w-12 flex-shrink-0 rounded-md bg-slate-200 p-3 dark:bg-slate-700" />
        <div className="ml-5 w-0 flex-1">
          <div className="mb-2 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export function KPICards({ stats, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
      <KPICard
        label="New Suggestions"
        value={stats.newSuggestions}
        icon={
          <MessageSquare className="h-6 w-6 text-[var(--color-ocean-blue)]" />
        }
        colorClass="bg-[var(--color-ocean-blue)]/10"
      />
      <KPICard
        label="Story Submissions"
        value={stats.storySubmissions}
        icon={
          <FileText className="h-6 w-6 text-[var(--color-bougainvillea)]" />
        }
        colorClass="bg-[var(--color-bougainvillea)]/10"
      />
      <KPICard
        label="Media Pending"
        value={stats.mediaPending}
        icon={
          <Image className="h-6 w-6 text-[var(--color-sunny-yellow)]" />
        }
        colorClass="bg-[var(--color-sunny-yellow)]/10"
      />
      <KPICard
        label="Active Users"
        value={stats.activeUsers}
        icon={<Users className="h-6 w-6 text-[var(--color-valley-green)]" />}
        colorClass="bg-[var(--color-valley-green)]/10"
      />
      <KPICard
        label="Locations Covered"
        value={stats.locationsCovered}
        icon={<Map className="h-6 w-6 text-[var(--color-sobrado)]" />}
        colorClass="bg-[var(--color-sobrado)]/10"
      />
    </div>
  );
}
