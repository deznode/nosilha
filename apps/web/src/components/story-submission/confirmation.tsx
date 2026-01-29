"use client";

import { Send } from "lucide-react";
import Link from "next/link";

interface ConfirmationProps {
  onReset?: () => void;
}

export function Confirmation({ onReset }: ConfirmationProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="border-hairline bg-canvas rounded-card shadow-lift w-full max-w-md border p-8 text-center">
        <div className="bg-valley-green/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Send className="text-valley-green h-8 w-8" />
        </div>
        <h2 className="text-body mb-2 text-2xl font-bold">Obrigado!</h2>
        <p className="text-muted mb-6">
          Your submission has been received and will be reviewed shortly.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {onReset && (
            <button
              onClick={onReset}
              className="bg-surface text-body hover:bg-surface-alt rounded-button px-4 py-2 font-medium transition"
            >
              Submit Another
            </button>
          )}
          <Link
            href="/"
            className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button px-6 py-2 font-medium text-white transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
