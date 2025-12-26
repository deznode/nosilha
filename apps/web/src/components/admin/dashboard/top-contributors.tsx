"use client";

import { Users } from "lucide-react";
import type { Contributor } from "@/types/admin";

interface TopContributorsProps {
  contributors: Contributor[];
  isLoading?: boolean;
}

export function TopContributors({
  contributors,
  isLoading,
}: TopContributorsProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 h-6 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex animate-pulse items-center justify-between"
            >
              <div className="flex items-center">
                <div className="mr-3 h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="mb-1 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="h-6 w-12 rounded bg-slate-200 dark:bg-slate-700" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 flex items-center text-lg font-bold text-slate-900 dark:text-white">
        <Users size={20} className="mr-2 text-[var(--color-ocean-blue)]" />
        Top Contributors
      </h3>
      <ul className="space-y-3">
        {contributors.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[var(--color-ocean-blue)] dark:bg-slate-700">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-[var(--color-valley-green)] dark:bg-green-900/20">
              {user.points} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
