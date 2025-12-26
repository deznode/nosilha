"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Settings, Bell, Globe, Moon, Shield, UserCircle } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { session } = useAuth();

  const settingsCategories = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Email preferences and alerts",
      comingSoon: true,
    },
    {
      icon: Globe,
      title: "Language",
      description: "Display language and regional settings",
      comingSoon: true,
    },
    {
      icon: Moon,
      title: "Appearance",
      description: "Theme and display preferences",
      comingSoon: true,
    },
    {
      icon: Shield,
      title: "Privacy",
      description: "Account privacy and data settings",
      comingSoon: true,
    },
  ];

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Settings"
          subtitle="Customize your Nos Ilha experience"
        />

        <div className="mt-12">
          <div className="mx-auto max-w-2xl">
            {session ? (
              <>
                <div className="bg-background-primary rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Settings className="text-ocean-blue h-6 w-6" />
                    <h2 className="text-text-primary text-lg font-bold">
                      Account Settings
                    </h2>
                  </div>

                  <div className="mt-6 space-y-4">
                    {settingsCategories.map((category) => (
                      <div
                        key={category.title}
                        className="border-border-primary flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg">
                            <category.icon className="text-text-secondary h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-text-primary font-medium">
                              {category.title}
                            </h3>
                            <p className="text-text-secondary text-sm">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        {category.comingSoon && (
                          <span className="bg-sobrado-ochre/20 text-sobrado-ochre rounded-full px-3 py-1 text-xs font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-sobrado-ochre/10 border-sobrado-ochre/20 mt-6 rounded-xl border p-6">
                  <h3 className="text-text-primary font-semibold">
                    Settings Features Coming Soon
                  </h3>
                  <p className="text-text-secondary mt-2 text-sm">
                    We&apos;re working on comprehensive settings including
                    notification preferences, language selection, appearance
                    customization, and privacy controls. These features will be
                    available in a future update.
                  </p>
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
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
