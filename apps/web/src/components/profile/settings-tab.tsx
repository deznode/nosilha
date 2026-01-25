"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import type {
  UserProfile,
  UserNotificationPreferences,
  Language,
} from "@/types/user-profile";
import { useToast } from "@/hooks/use-toast";

interface SettingsTabProps {
  profile: UserProfile;
  notifications: UserNotificationPreferences;
  isLoading?: boolean;
  onSave?: (updates: {
    displayName?: string;
    location?: string;
    preferredLanguage?: Language;
    notifications?: Partial<UserNotificationPreferences>;
  }) => void;
}

export function SettingsTab({
  profile,
  notifications,
  isLoading,
  onSave,
}: SettingsTabProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [location, setLocation] = useState(profile.location || "");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(
    profile.preferredLanguage
  );
  const [notificationPrefs, setNotificationPrefs] = useState(notifications);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        displayName,
        location,
        preferredLanguage,
        notifications: notificationPrefs,
      });
      toast.success("Settings saved").show();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.").show();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md animate-pulse">
        <div className="mb-6 h-6 w-40 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
        Account Preferences
      </h3>

      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900 dark:text-white">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900 dark:text-white">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New Bedford, MA"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Preferred Language */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900 dark:text-white">
            Preferred Language
          </label>
          <div className="relative">
            <Globe className="absolute top-2.5 left-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as Language)}
              className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pr-3 pl-10 text-slate-900 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="EN">English</option>
              <option value="PT">Português</option>
              <option value="KEA">Kriolu</option>
            </select>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
          <h4 className="mb-3 text-sm font-medium text-slate-900 dark:text-white">
            Email Notifications
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notificationPrefs.storyPublished}
                onChange={(e) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    storyPublished: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                When my story is published
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notificationPrefs.suggestionApproved}
                onChange={(e) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    suggestionApproved: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                When my suggestion is approved
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={notificationPrefs.weeklyDigest}
                onChange={(e) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    weeklyDigest: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Weekly community digest
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-[var(--color-ocean-blue)] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
