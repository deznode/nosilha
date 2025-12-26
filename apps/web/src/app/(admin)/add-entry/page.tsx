"use client";

import { AddEntryForm } from "@/components/admin/add-entry-form";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddEntryPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and no session
    if (!loading && !session) {
      router.push("/login?redirect=/add-entry");
    }
  }, [session, loading, router]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
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
    );
  }

  if (!session) {
    return (
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-text-primary text-3xl font-bold tracking-tight">
              Authentication Required
            </h2>
            <p className="text-text-secondary mt-2 text-lg">
              Please log in to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Add New Directory Entry"
          subtitle="Fill out the form below to add a new location to the Nosilha.com database."
        />
        <div className="mt-12">
          <AddEntryForm />
        </div>
      </div>
    </div>
  );
}
