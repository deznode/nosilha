"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
    // TODO: Log to error reporting service (Sentry, GA4, etc.)
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="bg-bougainvillea-pink/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-bougainvillea-pink h-8 w-8" />
        </div>

        <h1 className="text-body font-serif text-2xl font-bold md:text-3xl">
          Something went wrong
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md">
          An unexpected error occurred. Please try again or return to the
          homepage.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="bg-surface mx-auto mt-4 max-w-lg rounded-lg p-4 text-left">
            <p className="text-muted font-mono text-xs">{error.message}</p>
            {error.digest && (
              <p className="text-muted mt-1 font-mono text-xs">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="border-hairline bg-canvas text-body hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
