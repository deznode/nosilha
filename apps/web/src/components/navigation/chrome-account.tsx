"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";

/**
 * The account affordance shared by the mobile and tablet bars.
 *
 * `AuthUser` carries no display name, so initials come from the email local part.
 * Signed out renders a "Sign in" link rather than nothing: the slot must not
 * collapse, or the bar reflows the moment a visitor signs in. Spec 037 FR-002.
 */
export function useChromeAccount() {
  const { session, user } = useAuth();
  const resolvedTheme = useResolvedTheme();

  const email = user?.email ?? session?.user?.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  const initials = localPart.slice(0, 2).toUpperCase() || "NI";

  return {
    signedIn: Boolean(session),
    initials,
    displayName: localPart || "Your account",
    onDark: resolvedTheme === "dark",
  };
}

export function AccountSlot() {
  const { signedIn, initials, onDark } = useChromeAccount();

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="text-ocean-blue shrink-0 px-2 py-[11px] text-sm font-medium transition-colors duration-150"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      className="focus-ring shrink-0 rounded-full"
    >
      <Avatar initials={initials} size="md" onDark={onDark} />
    </Link>
  );
}
