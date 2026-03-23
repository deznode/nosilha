"use client";

import Image from "next/image";
import { User, MapPin, Calendar, Edit2 } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  profile: UserProfile;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

function ProfileHeaderSkeleton() {
  return (
    <div className="border-hairline bg-surface shadow-subtle mb-6 overflow-hidden rounded-lg border">
      <div className="bg-surface-alt relative h-32 animate-pulse">
        <div className="absolute -bottom-12 left-8">
          <div className="bg-surface-alt h-24 w-24 animate-pulse rounded-full" />
        </div>
      </div>
      <div className="px-8 pt-16 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="bg-surface-alt mb-2 h-8 w-48 animate-pulse rounded" />
            <div className="bg-surface-alt h-4 w-64 animate-pulse rounded" />
          </div>
          <div className="bg-surface-alt h-10 w-24 animate-pulse rounded" />
        </div>
        <div className="border-hairline mt-8 grid grid-cols-3 gap-4 border-t pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="bg-surface-alt mx-auto mb-1 h-8 w-12 animate-pulse rounded" />
              <div className="bg-surface-alt mx-auto h-3 w-16 animate-pulse rounded" />
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
    <div className="border-hairline bg-surface shadow-subtle mb-6 overflow-hidden rounded-lg border">
      {/* Cover Image */}
      <div className="bg-ocean-blue relative h-32">
        <div className="absolute -bottom-12 left-8">
          <div className="bg-surface shadow-medium relative h-24 w-24 overflow-hidden rounded-full p-1">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="bg-surface-alt text-muted flex h-full w-full items-center justify-center rounded-full">
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
            <h1 className="text-body text-2xl font-bold">
              {profile.displayName}
            </h1>
            <div className="text-muted mt-1 flex items-center space-x-4 text-sm">
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
            className="border-hairline text-muted hover:text-ocean-blue rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="border-hairline mt-8 grid grid-cols-3 gap-4 border-t pt-6">
          <div className="text-center">
            <span className="text-ocean-blue block text-2xl font-bold">
              {profile.stats.storiesSubmitted}
            </span>
            <span className="text-muted text-xs tracking-wide uppercase">
              Stories
            </span>
          </div>
          <div className="border-hairline border-l text-center">
            <span className="text-bougainvillea-pink block text-2xl font-bold">
              {profile.stats.suggestionsMade}
            </span>
            <span className="text-muted text-xs tracking-wide uppercase">
              Suggestions
            </span>
          </div>
          <div className="border-hairline border-l text-center">
            <span className="text-valley-green block text-2xl font-bold">
              {profile.stats.reactionsGiven}
            </span>
            <span className="text-muted text-xs tracking-wide uppercase">
              Reactions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
