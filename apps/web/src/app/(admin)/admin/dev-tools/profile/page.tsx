"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import type { ProfileTabType } from "@/components/profile/profile-tabs";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import { Language } from "@/types/user-profile";
import type { UserProfile } from "@/types/user-profile";

const mockProfile: UserProfile = {
  id: "user-demo-001",
  displayName: "Maria da Graça Silva",
  email: "maria.silva@example.com",
  location: "Nova Sintra, Brava",
  joinedDate: "2023-09-15T00:00:00Z",
  preferredLanguage: Language.PT,
  stats: {
    storiesSubmitted: 7,
    suggestionsMade: 14,
    reactionsGiven: 52,
    bookmarksCount: 23,
  },
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  bio: "Born in Brava, now living in Providence, RI. Passionate about preserving our island's cultural heritage and sharing stories from the diaspora.",
};

export default function ProfileDevPage() {
  const [activeTab, setActiveTab] = useState<ProfileTabType>("activity");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">User Profile</h1>
      <p className="text-muted mb-8">
        ProfileHeader with skeleton loading, ProfileTabs, and InlineAuthPrompt.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="bg-surface-alt text-muted hover:text-body rounded-button px-4 py-2 text-sm font-medium transition-colors"
        >
          Toggle Loading: {isLoading ? "ON" : "OFF"}
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">ProfileHeader</h2>
        <ProfileHeader
          profile={mockProfile}
          isLoading={isLoading}
          onEditProfile={() => console.log("Edit profile clicked")}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">ProfileTabs</h2>
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="bg-surface border-hairline rounded-card mt-4 border p-6">
          <p className="text-muted text-sm">
            Active tab: <strong className="text-body">{activeTab}</strong>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          InlineAuthPrompt
        </h2>
        <div className="max-w-md">
          <InlineAuthPrompt
            returnUrl="/admin/dev-tools/profile"
            title="Sign in to view your profile"
            description="Create an account or sign in to track your contributions and saved places."
          />
        </div>
      </section>
    </div>
  );
}
