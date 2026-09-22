"use client";

import clsx from "clsx";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { NosilhaLogo } from "@/components/ui/logo";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { useUiStore } from "@/stores/uiStore";

import { currentLanguage } from "./nav-config";

/**
 * The parts the phone and tablet bars both render, and the phone sheet borrows.
 *
 * They live here rather than in whichever bar happened to need them first: the
 * two bars are meant to be one chrome, so the pieces most likely to change — the
 * brand mark and how it picks a theme variant, the account affordance, the locale
 * chip — are stated once. `LanguageChip` in particular used to be exported from
 * `tablet-top-bar.tsx` and imported by the phone-only `more-sheet.tsx`, which made
 * the tablet bar a module boundary it was never meant to be.
 */

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

/**
 * Brand mark and home link, identical in both bars.
 *
 * `instanceId` is required rather than defaulted: `NosilhaLogo` uses it to
 * namespace the SVG gradient ids, and two bars rendering the same id at once —
 * which they do, since both are mounted at every width and only hidden by CSS —
 * would have them collide.
 */
export function ChromeLogoLink({
  instanceId,
  className,
}: {
  instanceId: string;
  className?: string;
}) {
  const resolvedTheme = useResolvedTheme();

  return (
    <Link
      href="/"
      className={clsx("flex items-center", className)}
      aria-label="Nos Ilha home"
    >
      <NosilhaLogo
        size="sidebar"
        variant={resolvedTheme === "dark" ? "light" : "default"}
        showSubtitle={false}
        instanceId={instanceId}
      />
    </Link>
  );
}

/**
 * The current locale, shown but not switchable — `PT` and `CV` are disabled in
 * `languages`, and a disabled locale must not render as though it were available.
 *
 * Reads `currentLanguage` itself rather than taking it as a prop: there is only
 * one locale to show, and both call sites were computing `languages[0]` to pass
 * the same value in.
 */
export function LanguageChip({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "border-hairline text-muted dark:border-chrome-line dark:text-chrome-ink-muted flex h-11 items-center justify-center rounded-lg border font-mono text-[13px]",
        className
      )}
      title="English. Português and Kriolu are coming soon."
    >
      {currentLanguage.code}
    </span>
  );
}

/**
 * The archive wordmark: `NosIlha` set in the serif, with a spaced `ARCHIVE`
 * label. Restored for the desktop bar, whose previous style this is.
 *
 * Not `NosilhaLogo`: that lockup leads with the hibiscus mark and its
 * `showSubtitle` reads "Brava, Cabo Verde". This is a different, text-only
 * treatment, which is why it is its own small component rather than another
 * variant bolted onto the logo.
 */
export function ChromeWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={clsx(
        "focus-ring flex items-baseline gap-2 rounded-sm",
        className
      )}
      aria-label="Nos Ilha home"
    >
      <span className="font-serif text-[19px] font-normal tracking-[-0.01em]">
        <span className="text-body">Nos</span>
        <span className="text-ocean-blue">Ilha</span>
      </span>
      <span className="text-muted text-[9px] tracking-[0.18em] uppercase">
        Archive
      </span>
    </Link>
  );
}

/**
 * The theme control as the archive bar had it: a text pill naming the theme one
 * click away, rather than `ThemeToggle`'s icon that cycles light → dark → system.
 *
 * Two states, not three, and resolved first: from `system` on a dark OS the pill
 * reads "Light", so one click always lands on an explicit choice instead of
 * toggling within `system` and appearing to do nothing.
 */
export function ThemePill({ className }: { className?: string }) {
  const resolvedTheme = useResolvedTheme();
  const setTheme = useUiStore((state) => state.setTheme);

  const nextTheme = resolvedTheme === "light" ? "dark" : "light";
  const label = nextTheme === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to the ${nextTheme} theme`}
      // `uiStore` rehydrates from localStorage at module init, so with a stored
      // dark choice the first client render says "Light" while the prerendered
      // HTML says "Dark". The label is client state the server cannot know, and
      // React patches the text immediately.
      suppressHydrationWarning
      className={clsx(
        "border-hairline bg-surface text-muted hover:text-body focus-ring shrink-0 cursor-pointer rounded-full border px-[13px] py-[7px] text-xs transition-colors",
        className
      )}
    >
      {label}
    </button>
  );
}
