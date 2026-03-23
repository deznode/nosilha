"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Settings, Bell, Globe, Moon, Shield, UserCircle } from "lucide-react";
import Link from "next/link";
import { getProfile, updateProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Checkbox, CheckboxField } from "@/components/catalyst-ui/checkbox";
import { Label } from "@/components/catalyst-ui/fieldset";
import type {
  ProfileDto,
  ProfileUpdateRequest,
  PreferredLanguage,
  NotificationPreferences,
} from "@/types/profile";

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth();
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
        toast.error("Failed to load your settings. Please try again.").show();
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
      toast.success("Settings saved successfully!").show();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.").show();
    } finally {
      setIsSaving(false);
    }
  };

  // Auth loading state - show skeleton while checking session
  if (authLoading) {
    return (
      <div className="bg-surface min-h-screen font-sans">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
          <PageHeader
            title="Settings"
            subtitle="Customize your Nos Ilha experience"
          />
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="bg-canvas rounded-card shadow-subtle animate-pulse p-6">
              <div className="bg-surface h-6 w-40 rounded" />
              <div className="bg-surface mt-4 h-20 rounded" />
              <div className="bg-surface mt-4 h-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div className="bg-surface min-h-screen font-sans">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
          <PageHeader
            title="Settings"
            subtitle="Customize your Nos Ilha experience"
          />

          <div className="mx-auto mt-12 max-w-2xl">
            <div className="bg-canvas rounded-card shadow-subtle p-8 text-center">
              <Settings
                className="text-muted mx-auto h-16 w-16"
                aria-hidden="true"
              />
              <h2 className="text-body mt-4 text-xl font-bold">
                Sign in to access settings
              </h2>
              <p className="text-muted mt-2">
                Create an account or sign in to customize your Nos Ilha
                experience.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button focus-visible:ring-ocean-blue px-6 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue/10 rounded-button focus-visible:ring-ocean-blue border px-6 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
    <div className="bg-surface min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader
          title="Settings"
          subtitle="Customize your Nos Ilha experience"
        />

        <div className="mt-6 sm:mt-12">
          <div className="mx-auto max-w-2xl">
            {isLoading ? (
              <div className="bg-canvas rounded-card shadow-subtle p-6">
                <div className="animate-pulse space-y-4">
                  <div className="bg-surface h-6 w-40 rounded" />
                  <div className="bg-surface h-20 rounded" />
                  <div className="bg-surface h-20 rounded" />
                  <div className="bg-surface h-20 rounded" />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-canvas rounded-card shadow-subtle p-6">
                  <div className="flex items-center gap-3">
                    <Settings
                      className="text-ocean-blue h-6 w-6"
                      aria-hidden="true"
                    />
                    <h2 className="text-body text-lg font-bold">
                      Account Settings
                    </h2>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Notifications Section */}
                    <div className="border-hairline rounded-card border p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-surface rounded-button flex h-10 w-10 flex-shrink-0 items-center justify-center">
                          <Bell
                            className="text-muted h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-body font-medium">
                            Notifications
                          </h3>
                          <p className="text-muted mb-4 text-sm">
                            Email preferences and alerts
                          </p>

                          <div className="space-y-3">
                            <CheckboxField>
                              <Checkbox
                                color="blue"
                                checked={notificationPrefs.storyPublished}
                                onChange={(checked) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    storyPublished: checked,
                                  }))
                                }
                              />
                              <Label className="text-body text-sm">
                                When my story is published
                              </Label>
                            </CheckboxField>
                            <CheckboxField>
                              <Checkbox
                                color="blue"
                                checked={notificationPrefs.suggestionApproved}
                                onChange={(checked) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    suggestionApproved: checked,
                                  }))
                                }
                              />
                              <Label className="text-body text-sm">
                                When my suggestion is approved
                              </Label>
                            </CheckboxField>
                            <CheckboxField>
                              <Checkbox
                                color="blue"
                                checked={notificationPrefs.weeklyDigest}
                                onChange={(checked) =>
                                  setNotificationPrefs((prev) => ({
                                    ...prev,
                                    weeklyDigest: checked,
                                  }))
                                }
                              />
                              <Label className="text-body text-sm">
                                Weekly community digest
                              </Label>
                            </CheckboxField>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language Section */}
                    <div className="border-hairline rounded-card border p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-surface rounded-button flex h-10 w-10 flex-shrink-0 items-center justify-center">
                          <Globe
                            className="text-muted h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-body font-medium">Language</h3>
                          <p className="text-muted mb-4 text-sm">
                            Display language and regional settings
                          </p>

                          <div className="relative">
                            <Globe
                              className="text-muted pointer-events-none absolute top-2.5 left-3 h-4 w-4"
                              aria-hidden="true"
                            />
                            <select
                              value={preferredLanguage}
                              onChange={(e) =>
                                setPreferredLanguage(
                                  e.target.value as PreferredLanguage
                                )
                              }
                              className="border-hairline bg-canvas text-body focus-visible:border-ocean-blue focus-visible:ring-ocean-blue rounded-button w-full appearance-none border py-2 pr-3 pl-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
                    <div className="border-hairline rounded-card border p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-surface rounded-button flex h-10 w-10 items-center justify-center">
                          <Moon
                            className="text-muted h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-body font-medium">Appearance</h3>
                          <p className="text-muted text-sm">
                            Theme preferences managed by browser
                          </p>
                        </div>
                        <span className="bg-sobrado-ochre/20 text-sobrado-ochre rounded-full px-3 py-1 text-xs font-medium">
                          Local Only
                        </span>
                      </div>
                    </div>

                    {/* Privacy Section (Coming Soon) */}
                    <div className="border-hairline rounded-card border p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-surface rounded-button flex h-10 w-10 items-center justify-center">
                          <Shield
                            className="text-muted h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-body font-medium">Privacy</h3>
                          <p className="text-muted text-sm">
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
                      className="text-muted hover:text-body focus-visible:ring-ocean-blue rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      Cancel
                    </Link>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button focus-visible:ring-ocean-blue px-6 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      aria-busy={isSaving}
                    >
                      {isSaving ? "Saving\u2026" : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/profile"
                    className="text-ocean-blue hover:text-ocean-blue/80 focus-visible:ring-ocean-blue inline-flex items-center gap-2 rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <UserCircle className="h-4 w-4" aria-hidden="true" />
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
