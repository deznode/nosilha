"use client";

import Image from "next/image";
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
      <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm">
        <div className="bg-surface-alt mb-4 h-6 w-36 animate-pulse rounded" />
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex animate-pulse items-center justify-between"
            >
              <div className="flex items-center">
                <div className="bg-surface-alt mr-3 h-8 w-8 rounded-full" />
                <div>
                  <div className="bg-surface-alt mb-1 h-4 w-24 rounded" />
                  <div className="bg-surface-alt h-3 w-16 rounded" />
                </div>
              </div>
              <div className="bg-surface-alt h-6 w-12 rounded" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="border-hairline bg-surface rounded-lg border p-6 shadow-sm">
      <h3 className="text-body mb-4 flex items-center text-lg font-bold">
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
              <div className="bg-surface-alt relative mr-3 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-[var(--color-ocean-blue)]">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-body font-medium">{user.name}</p>
                <p className="text-muted text-xs">{user.role}</p>
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
