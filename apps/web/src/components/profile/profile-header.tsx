"use client";

import { User, MapPin, Calendar, Edit2 } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  profile: UserProfile;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

function ProfileHeaderSkeleton() {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative h-32 animate-pulse bg-slate-200 dark:bg-slate-700">
        <div className="absolute -bottom-12 left-8">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
      <div className="px-8 pt-16 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-700">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-1 h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mx-auto h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileHeader({
  profile,
  isLoading,
  onEditProfile,
}: ProfileHeaderProps) {
  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Cover Image */}
      <div className="relative h-32 bg-[var(--color-ocean-blue)]">
        <div className="absolute -bottom-12 left-8">
          <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md dark:bg-slate-800">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                <User size={40} />
              </div>
            )}
          </div>
        </div>
        <button className="absolute top-4 right-4 flex items-center rounded bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/30">
          <Edit2 size={14} className="mr-1" /> Edit Cover
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-8 pt-16 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.displayName}
            </h1>
            <div className="mt-1 flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
              {profile.location && (
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" /> {profile.location}
                </span>
              )}
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" /> Member since{" "}
                {profile.joinedDate}
              </span>
            </div>
          </div>
          <button
            onClick={onEditProfile}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-[var(--color-ocean-blue)] dark:border-slate-600 dark:text-slate-400 dark:hover:text-[var(--color-ocean-blue)]"
          >
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-700">
          <div className="text-center">
            <span className="block text-2xl font-bold text-[var(--color-ocean-blue)]">
              {profile.stats.storiesSubmitted}
            </span>
            <span className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Stories
            </span>
          </div>
          <div className="border-l border-slate-200 text-center dark:border-slate-700">
            <span className="block text-2xl font-bold text-[var(--color-bougainvillea)]">
              {profile.stats.suggestionsMade}
            </span>
            <span className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Suggestions
            </span>
          </div>
          <div className="border-l border-slate-200 text-center dark:border-slate-700">
            <span className="block text-2xl font-bold text-[var(--color-valley-green)]">
              {profile.stats.reactionsGiven}
            </span>
            <span className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Reactions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
