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
        <h1 className="font-serif text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-50">
          Desculpa, algo deu errado
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
          Ocorreu um erro inesperado. Por favor, tente novamente ou volte à
          página inicial.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mx-auto mt-4 max-w-lg rounded-lg bg-slate-100 p-4 text-left dark:bg-slate-800">
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-1 font-mono text-xs text-slate-500">
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
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
