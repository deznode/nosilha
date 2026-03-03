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
    // Log error to console in development, or to analytics in production
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
    // TODO: Log to error reporting service (Sentry, GA4, etc.)
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Error Icon */}
        <div className="bg-bougainvillea-pink/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-bougainvillea-pink h-8 w-8" />
        </div>

        {/* Error Message */}
        <h1 className="text-body font-serif text-2xl font-bold md:text-3xl">
          Desculpa, algo deu errado
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-md">
          Ocorreu um erro inesperado. Por favor, tente novamente ou volte à
          página inicial.
        </p>

        {/* Error Details (development only) */}
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

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border-hairline bg-canvas text-body hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
