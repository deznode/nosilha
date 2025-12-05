"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { UserCircle, Settings, Mail } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { session, user } = useAuth();

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Your Profile"
          subtitle="Manage your account and preferences"
        />

        <div className="mt-12">
          <div className="bg-background-primary mx-auto max-w-2xl rounded-xl p-8 shadow-sm">
            {session ? (
              <>
                <div className="border-border-primary flex items-center gap-4 border-b pb-6">
                  <div className="bg-ocean-blue/10 flex h-16 w-16 items-center justify-center rounded-full">
                    <UserCircle className="text-ocean-blue h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-text-primary text-xl font-bold">
                      {user?.email || session.user.email}
                    </h2>
                    <p className="text-text-secondary text-sm">
                      {user?.role || "Member"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-text-tertiary h-5 w-5" />
                    <span className="text-text-primary">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <div className="bg-sobrado-ochre/10 border-sobrado-ochre/20 mt-8 rounded-lg border p-4">
                  <h3 className="text-text-primary font-semibold">
                    Profile Features Coming Soon
                  </h3>
                  <p className="text-text-secondary mt-1 text-sm">
                    We&apos;re working on profile customization, contribution
                    history, and saved places. Stay tuned!
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/settings"
                    className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    Go to Settings
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <UserCircle className="text-text-tertiary mx-auto h-16 w-16" />
                <h2 className="text-text-primary mt-4 text-xl font-bold">
                  Sign in to view your profile
                </h2>
                <p className="text-text-secondary mt-2">
                  Create an account or sign in to access your profile and
                  contribute to Nos Ilha.
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
