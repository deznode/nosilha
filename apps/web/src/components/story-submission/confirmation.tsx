"use client";

import { Send } from "lucide-react";
import Link from "next/link";

interface ConfirmationProps {
  onReset?: () => void;
}

export function Confirmation({ onReset }: ConfirmationProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="border-hairline bg-canvas w-full max-w-md rounded-lg border p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Send className="h-8 w-8 text-[var(--color-valley-green)]" />
        </div>
        <h2 className="text-body mb-2 text-2xl font-bold">Obrigado!</h2>
        <p className="text-muted mb-6">
          Your submission has been received and will be reviewed shortly.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {onReset && (
            <button
              onClick={onReset}
              className="bg-surface text-body hover:bg-surface-alt rounded-md px-4 py-2 font-medium transition"
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
