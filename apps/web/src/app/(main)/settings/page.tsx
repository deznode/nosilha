"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Settings, Bell, Globe, Moon, Shield, UserCircle } from "lucide-react";
import Link from "next/link";
import { getProfile, updateProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type {
  ProfileDto,
  ProfileUpdateRequest,
  PreferredLanguage,
  NotificationPreferences,
} from "@/types/profile";

export default function SettingsPage() {
  const { session } = useAuth();
  const toast = useToast();

  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  // Form states
  const [preferredLanguage, setPreferredLanguage] =
    useState<PreferredLanguage>("EN");
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      storyPublished: true,
      suggestionApproved: true,
      weeklyDigest: false,
    });

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      if (!session) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const profileData = await getProfile();
        setProfile(profileData);
        setPreferredLanguage(profileData.preferredLanguage);
        setNotificationPrefs(profileData.notificationPreferences);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.showError("Failed to load your settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session, toast]);

  // Handle save changes
  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const updateRequest: ProfileUpdateRequest = {
        preferredLanguage,
        notificationPreferences: notificationPrefs,
      };

      const updatedProfile = await updateProfile(updateRequest);
      setProfile(updatedProfile);
      toast.showSuccess("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.showError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Not logged in state
  if (!session) {
    return (
      <div className="bg-background-secondary min-h-screen font-sans">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <PageHeader
            title="Settings"
            subtitle="Customize your Nos Ilha experience"
          />

          <div className="mx-auto mt-12 max-w-2xl">
            <div className="bg-background-primary rounded-xl p-8 text-center shadow-sm">
              <Settings className="text-text-tertiary mx-auto h-16 w-16" />
              <h2 className="text-text-primary mt-4 text-xl font-bold">
                Sign in to access settings
              </h2>
              <p className="text-text-secondary mt-2">
                Create an account or sign in to customize your Nos Ilha
                experience.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue/10 rounded-md border px-6 py-2 text-sm font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Settings"
          subtitle="Customize your Nos Ilha experience"
        />

        <div className="mt-12">
          <div className="mx-auto max-w-2xl">
            {isLoading ? (
              <div className="bg-background-primary rounded-xl p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="bg-background-secondary h-6 w-40 rounded" />
                  <div className="bg-background-secondary h-20 rounded" />
                  <div className="bg-background-secondary h-20 rounded" />
                  <div className="bg-background-secondary h-20 rounded" />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-background-primary rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Settings className="text-ocean-blue h-6 w-6" />
                    <h2 className="text-text-primary text-lg font-bold">
                      Account Settings
                    </h2>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Notifications Section */}
                    <div className="border-border-primary rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-background-secondary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                          <Bell className="text-text-secondary h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-text-primary font-medium">
                            Notifications
                          </h3>
                          <p className="text-text-secondary mb-4 text-sm">
                            Email preferences and alerts
                          </p>

                          <div className="space-y-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.storyPublished}
                                onChange={(e) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    storyPublished: e.target.checked,
                                  }))
                                }
                                className="text-ocean-blue focus:ring-ocean-blue rounded border-slate-300"
                              />
                              <span className="text-text-primary text-sm">
                                When my story is published
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.suggestionApproved}
                                onChange={(e) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    suggestionApproved: e.target.checked,
                                  }))
                                }
                                className="text-ocean-blue focus:ring-ocean-blue rounded border-slate-300"
                              />
                              <span className="text-text-primary text-sm">
                                When my suggestion is approved
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.weeklyDigest}
                                onChange={(e) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    weeklyDigest: e.target.checked,
                                  }))
                                }
                                className="text-ocean-blue focus:ring-ocean-blue rounded border-slate-300"
                              />
                              <span className="text-text-primary text-sm">
                                Weekly community digest
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language Section */}
                    <div className="border-border-primary rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-background-secondary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                          <Globe className="text-text-secondary h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-text-primary font-medium">
                            Language
                          </h3>
                          <p className="text-text-secondary mb-4 text-sm">
                            Display language and regional settings
                          </p>

                          <div className="relative">
                            <Globe className="text-text-tertiary pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
                            <select
                              value={preferredLanguage}
                              onChange={(e) =>
                                setPreferredLanguage(
                                  e.target.value as PreferredLanguage
                                )
                              }
                              className="border-border-primary bg-background-primary text-text-primary focus:border-ocean-blue focus:ring-ocean-blue w-full appearance-none rounded-md border py-2 pr-3 pl-10"
                            >
                              <option value="EN">English</option>
                              <option value="PT">Portugues</option>
                              <option value="KEA">Kriolu</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appearance Section (localStorage only) */}
                    <div className="border-border-primary rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg">
                          <Moon className="text-text-secondary h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-text-primary font-medium">
                            Appearance
                          </h3>
                          <p className="text-text-secondary text-sm">
                            Theme preferences managed by browser
                          </p>
                        </div>
                        <span className="bg-sobrado-ochre/20 text-sobrado-ochre rounded-full px-3 py-1 text-xs font-medium">
                          Local Only
                        </span>
                      </div>
                    </div>

                    {/* Privacy Section (Coming Soon) */}
                    <div className="border-border-primary rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg">
                          <Shield className="text-text-secondary h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-text-primary font-medium">
                            Privacy
                          </h3>
                          <p className="text-text-secondary text-sm">
                            Account privacy and data settings
                          </p>
                        </div>
                        <span className="bg-sobrado-ochre/20 text-sobrado-ochre rounded-full px-3 py-1 text-xs font-medium">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                      href="/profile"
                      className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/profile"
                    className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <UserCircle className="h-4 w-4" />
                    Back to Profile
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
