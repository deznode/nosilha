"use client";

import { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ProfileHeader,
  ProfileTabs,
  ActivityTab,
  SavedPlacesTab,
  SettingsTab,
  type ProfileTabType,
} from "@/components/profile";
import { getProfile } from "@/lib/api";
import { useUpdateProfile } from "@/hooks/queries/use-update-profile";
import { useToast } from "@/hooks/use-toast";
import type {
  UserProfile,
  UserNotificationPreferences,
  UserProfileUpdateData,
} from "@/types/user-profile";
import { Language } from "@/types/user-profile";
import type { PreferredLanguage } from "@/types/profile";

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTabType>("activity");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] =
    useState<UserNotificationPreferences>({
      storyPublished: true,
      suggestionApproved: true,
      weeklyDigest: false,
    });

  // Load data on mount (excluding activities and saved places - now handled by their respective tabs)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Backend returns profile with notificationPreferences included
        const profileData = await getProfile();

        // Map backend ProfileDto to frontend UserProfile type
        setProfile({
          id: profileData.id,
          displayName: profileData.displayName || session?.user.email || "User",
          email: session?.user.email || "",
          joinedDate: new Date(profileData.createdAt).toLocaleDateString(),
          preferredLanguage: profileData.preferredLanguage as Language,
          location: profileData.location ?? undefined,
          stats: {
            // Stats come from contributions API, use defaults for now
            storiesSubmitted: 0,
            suggestionsMade: 0,
            reactionsGiven: 0,
          },
        });
        setNotifications(profileData.notificationPreferences);
      } catch (error) {
        console.error("Failed to load profile data:", error);
        toast.error("Failed to load profile. Please refresh the page.").show();
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [session, toast]);

  // Use the update profile mutation hook
  const { mutate: updateProfileMutation } = useUpdateProfile();

  const handleSaveSettings = (
    updates: UserProfileUpdateData & {
      notifications?: Partial<UserNotificationPreferences>;
    }
  ) => {
    const { notifications: notifUpdates, ...profileUpdates } = updates;

    updateProfileMutation(
      {
        displayName: profileUpdates.displayName,
        location: profileUpdates.location,
        preferredLanguage: profileUpdates.preferredLanguage as
          | PreferredLanguage
          | undefined,
        notificationPreferences: notifUpdates
          ? {
              storyPublished:
                notifUpdates.storyPublished ?? notifications.storyPublished,
              suggestionApproved:
                notifUpdates.suggestionApproved ??
                notifications.suggestionApproved,
              weeklyDigest:
                notifUpdates.weeklyDigest ?? notifications.weeklyDigest,
            }
          : undefined,
      },
      {
        onSuccess: (updatedProfile) => {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  displayName:
                    updatedProfile.displayName ||
                    session?.user.email ||
                    prev.displayName,
                  location: updatedProfile.location ?? undefined,
                  preferredLanguage:
                    updatedProfile.preferredLanguage as Language,
                }
              : prev
          );
          setNotifications(updatedProfile.notificationPreferences);
        },
        onError: (error) => {
          console.error("Failed to save settings:", error);
        },
      }
    );
  };

  // Auth loading state - skeleton mimics actual profile layout (UX best practice)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Profile header skeleton */}
          <div className="animate-pulse rounded-xl bg-canvas p-6 shadow-sm">
            <div className="h-24 rounded-lg bg-surface-alt" />
            <div className="mt-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-surface-alt" />
              <div className="flex-1">
                <div className="h-6 w-48 rounded bg-surface-alt" />
                <div className="mt-2 h-4 w-32 rounded bg-surface-alt" />
              </div>
            </div>
          </div>
          {/* Tabs skeleton */}
          <div className="mt-6 animate-pulse rounded-lg border border-hairline bg-canvas shadow-sm">
            <div className="flex gap-4 border-b border-hairline p-4">
              <div className="h-8 w-24 rounded bg-surface-alt" />
              <div className="h-8 w-24 rounded bg-surface-alt" />
              <div className="h-8 w-24 rounded bg-surface-alt" />
            </div>
            <div className="p-6">
              <div className="h-32 rounded bg-surface-alt" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-screen bg-canvas py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-canvas p-8 text-center shadow-sm">
            <UserCircle className="mx-auto h-16 w-16 text-muted" />
            <h2 className="mt-4 text-xl font-bold text-body">
              Sign in to view your profile
            </h2>
            <p className="mt-2 text-muted">
              Create an account or sign in to access your profile and contribute
              to Nos Ilha.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-md bg-[var(--color-ocean-blue)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-ocean-blue)]/90"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-[var(--color-ocean-blue)] px-6 py-2 text-sm font-semibold text-[var(--color-ocean-blue)] transition-colors hover:bg-[var(--color-ocean-blue)]/10"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default profile while loading
  const displayProfile: UserProfile = profile || {
    id: "",
    displayName: session.user.email || "User",
    email: session.user.email || "",
    joinedDate: "Recently",
    preferredLanguage: Language.EN,
    stats: {
      storiesSubmitted: 0,
      suggestionsMade: 0,
      reactionsGiven: 0,
    },
  };

  return (
    <div className="min-h-screen bg-canvas py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={displayProfile}
          isLoading={isLoading}
          onEditProfile={() => setActiveTab("settings")}
        />

        {/* Tabs and Content */}
        <div className="min-h-[400px] rounded-lg border border-hairline bg-canvas shadow-sm">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === "activity" && <ActivityTab />}

            {activeTab === "saved" && <SavedPlacesTab />}

            {activeTab === "settings" && (
              <SettingsTab
                profile={displayProfile}
                notifications={notifications}
                isLoading={isLoading}
                onSave={handleSaveSettings}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
