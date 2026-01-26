"use client";

import Link from "next/link";
import clsx from "clsx";
import { LogIn } from "lucide-react";

interface InlineAuthPromptProps {
  /** Title displayed in the prompt (e.g., "Sign in to Share Videos") */
  title?: string;
  /** Description explaining why authentication is needed */
  description?: string;
  /** URL to return to after successful login */
  returnUrl: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Inline authentication prompt component following the Lazy Registration pattern.
 *
 * UX Best Practice: Shows users the form/content first, then prompts for login
 * when needed. This reduces friction and increases conversion by:
 * - Preserving user context (no jarring redirects)
 * - Demonstrating value before asking for commitment
 * - Leveraging loss aversion (users don't want to lose their progress)
 *
 * @see https://ui-patterns.com/patterns/LazyRegistration
 */
export function InlineAuthPrompt({
  title = "Sign in to Continue",
  description = "Please sign in to complete this action.",
  returnUrl,
  className,
}: InlineAuthPromptProps) {
  const encodedReturnUrl = encodeURIComponent(returnUrl);

  return (
    <div
      className={clsx(
        "rounded-card border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20",
        className
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/30">
        <LogIn className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="text-body mb-2 font-medium">{title}</h3>
      <p className="text-muted mb-4 text-sm">{description}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/login?returnUrl=${encodedReturnUrl}`}
          className="rounded-button inline-flex items-center justify-center bg-(--color-ocean-blue) px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>
        <Link
          href={`/signup?returnUrl=${encodedReturnUrl}`}
          className="rounded-button border-hairline bg-canvas text-body hover:bg-surface inline-flex items-center justify-center border px-4 py-2 text-sm font-medium"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
