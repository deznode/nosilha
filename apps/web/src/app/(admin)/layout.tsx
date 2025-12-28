"use client";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Admin Layout - Admin/Sandbox pages with Header and Footer
 *
 * This layout wraps all routes in the (admin) route group,
 * providing the standard site chrome for admin and sandbox pages.
 * Requires authentication to access.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and no session
    if (!loading && !session) {
      router.push("/login?redirect=/admin");
    }
  }, [session, loading, router]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header className="print:hidden" />
        <main id="main-content" className="flex-grow pt-16">
          <div className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-text-primary text-3xl font-bold tracking-tight">
                  Loading...
                </h2>
                <p className="text-text-secondary mt-2 text-lg">
                  Checking authentication status.
                </p>
              </div>
            </div>
          </div>
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header className="print:hidden" />
      <main id="main-content" className="animate-fade-in flex-grow pt-16">
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
