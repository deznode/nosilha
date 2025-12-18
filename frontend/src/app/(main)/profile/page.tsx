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
import { mockUserApi } from "@/lib/mocks";
import type {
  UserProfile,
  UserActivityItem,
  SavedPlace,
  UserNotificationPreferences,
  UserProfileUpdateData,
} from "@/types/user-profile";
import { Language } from "@/types/user-profile";

export default function ProfilePage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabType>("activity");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [notifications, setNotifications] =
    useState<UserNotificationPreferences>({
      storyPublished: true,
      suggestionApproved: true,
      weeklyDigest: false,
    });

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profileData, activityData, placesData, notifData] =
          await Promise.all([
            mockUserApi.getProfile(),
            mockUserApi.getActivity(),
            mockUserApi.getSavedPlaces(),
            mockUserApi.getNotificationPreferences(),
          ]);

        setProfile(profileData);
        setActivities(activityData);
        setSavedPlaces(placesData);
        setNotifications(notifData);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleRemoveBookmark = async (id: string) => {
    try {
      await mockUserApi.removeBookmark(id);
      setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  const handleSaveSettings = async (
    updates: UserProfileUpdateData & {
      notifications?: Partial<UserNotificationPreferences>;
    }
  ) => {
    try {
      const { notifications: notifUpdates, ...profileUpdates } = updates;
      const updatedProfile = await mockUserApi.updateProfile(profileUpdates);
      setProfile(updatedProfile);
      if (notifUpdates) {
        const updatedNotifs =
          await mockUserApi.updateNotificationPreferences(notifUpdates);
        setNotifications(updatedNotifs);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // Not logged in state
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
            <UserCircle className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Sign in to view your profile
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
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
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={displayProfile}
          isLoading={isLoading}
          onEditProfile={() => setActiveTab("settings")}
        />

        {/* Tabs and Content */}
        <div className="min-h-[400px] rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === "activity" && (
              <ActivityTab activities={activities} isLoading={isLoading} />
            )}

            {activeTab === "saved" && (
              <SavedPlacesTab
                places={savedPlaces}
                isLoading={isLoading}
                onRemove={handleRemoveBookmark}
              />
            )}

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
