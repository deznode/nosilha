"use client";

import { Send } from "lucide-react";
import Link from "next/link";

interface ConfirmationProps {
  onReset?: () => void;
}

export function Confirmation({ onReset }: ConfirmationProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Send className="h-8 w-8 text-[var(--color-valley-green)]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Obrigado!
        </h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          Your submission has been received and will be reviewed shortly.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Submit Another
            </button>
          )}
          <Link
            href="/"
            className="rounded-md bg-[var(--color-ocean-blue)] px-6 py-2 font-medium text-white transition hover:bg-blue-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
