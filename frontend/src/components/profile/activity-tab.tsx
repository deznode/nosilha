"use client";

import { FileText, Clock } from "lucide-react";
import type { UserActivityItem } from "@/types/user-profile";

interface ActivityTabProps {
  activities: UserActivityItem[];
  isLoading?: boolean;
}

function ActivityItemSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div className="mb-2 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function getStatusStyles(status: UserActivityItem["status"]) {
  switch (status) {
    case "APPROVED":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-[var(--color-valley-green)]",
        badge:
          "bg-green-100 text-[var(--color-valley-green)] dark:bg-green-900/30",
      };
    case "PENDING":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-[var(--color-sobrado)]",
        badge:
          "bg-yellow-100 text-[var(--color-sobrado)] dark:bg-yellow-900/30",
      };
    case "REJECTED":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      };
  }
}

function getTypeIcon(type: UserActivityItem["type"]) {
  switch (type) {
    case "story":
      return <FileText size={20} />;
    case "suggestion":
      return <FileText size={20} />;
    case "reaction":
      return <FileText size={20} />;
  }
}

export function ActivityTab({ activities, isLoading }: ActivityTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Recent Contributions
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No activity yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start contributing to see your activity here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        Recent Contributions
      </h3>
      {activities.map((activity) => {
        const styles = getStatusStyles(activity.status);
        return (
          <div
            key={activity.id}
            className="flex gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
            >
              {getTypeIcon(activity.type)}
            </div>
            <div className="min-w-0 flex-grow">
              <div className="flex items-start justify-between gap-2">
                <h4 className="truncate font-bold text-slate-900 dark:text-white">
                  {activity.title}
                </h4>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                >
                  {activity.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" /> Submitted{" "}
                  {activity.timestamp}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
