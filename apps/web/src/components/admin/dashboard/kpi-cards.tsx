"use client";

import {
  MessageSquare,
  FileText,
  Users,
  Map,
  Image as ImageIcon,
} from "lucide-react";
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
    <div className="border-hairline bg-surface rounded-card shadow-subtle overflow-hidden border p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${colorClass}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-muted truncate text-sm font-medium">{label}</dt>
            <dd className="text-body text-2xl font-bold">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="border-hairline bg-surface rounded-card shadow-subtle animate-pulse overflow-hidden border p-5">
      <div className="flex items-center">
        <div className="bg-surface-alt h-12 w-12 flex-shrink-0 rounded-md p-3" />
        <div className="ml-5 w-0 flex-1">
          <div className="bg-surface-alt mb-2 h-4 w-24 rounded" />
          <div className="bg-surface-alt h-8 w-12 rounded" />
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
        icon={<MessageSquare className="text-ocean-blue h-6 w-6" />}
        colorClass="bg-ocean-blue/10"
      />
      <KPICard
        label="Story Submissions"
        value={stats.storySubmissions}
        icon={<FileText className="text-bougainvillea-pink h-6 w-6" />}
        colorClass="bg-bougainvillea-pink/10"
      />
      <KPICard
        label="Media Pending"
        value={stats.mediaPending}
        icon={<ImageIcon className="text-sunny-yellow h-6 w-6" />}
        colorClass="bg-sunny-yellow/10"
      />
      <KPICard
        label="Active Users"
        value={stats.activeUsers}
        icon={<Users className="text-valley-green h-6 w-6" />}
        colorClass="bg-valley-green/10"
      />
      <KPICard
        label="Locations Covered"
        value={stats.locationsCovered}
        icon={<Map className="text-sobrado-ochre h-6 w-6" />}
        colorClass="bg-sobrado-ochre/10"
      />
    </div>
  );
}
