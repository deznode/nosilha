"use client";

import clsx from "clsx";
import Link from "next/link";

import { Button } from "@/components/catalyst-ui/button";
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
 * The `<header>` all three top bars are.
 *
 * Sticky, in-flow, `--chrome-top-bar-height` tall, hairline-bottomed, hidden in
 * print — the recipe was pasted into three files, so "the three bars are one
 * chrome" was asserted in five docstrings and enforced nowhere, and a change to
 * the shared surface was three edits a reviewer had to diff by eye.
 *
 * `display` is deliberately not set here, and neither is the ground: the caller
 * passes both. `SiteChrome` owns which width each bar appears at, and an
 * unprefixed `flex` here against its `hidden lg:flex` would be two `display`
 * declarations at equal specificity, resolved by stylesheet order rather than by
 * the prop.
 */
export function ChromeBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <header
      className={clsx(
        "border-hairline sticky top-0 z-40 h-(--chrome-top-bar-height) items-center border-b print:hidden",
        className
      )}
    >
      {children}
    </header>
  );
}

/**
 * The Contribute call to action, in the two bars and the More sheet.
 *
 * The three carried byte-identical `href`, `size` and `color`; only the layout
 * utility differs, which is why that is the prop.
 */
export function ContributeAction({
  className = "shrink-0",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      href="/contribute/story"
      size="lg"
      color="blue"
      className={className}
      onClick={onClick}
    >
      Contribute
    </Button>
  );
}

/**
 * The account affordance shared by the mobile and tablet bars.
 *
 * `AuthUser` carries no display name, so initials come from the email local part.
 * Signed out renders a "Sign in" link rather than nothing: the slot must not
 * collapse, or the bar reflows the moment a visitor signs in. Spec 037 FR-002.
 */
export function useChromeAccount() {
  const { session, user } = useAuth();

  const email = user?.email ?? session?.user?.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  const initials = localPart.slice(0, 2).toUpperCase() || "NI";

  return {
    signedIn: Boolean(session),
    initials,
    displayName: localPart || "Your account",
  };
}

export function AccountSlot() {
  const { signedIn, initials } = useChromeAccount();

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
      {/* `onDark` is static: the avatar's dark pair is applied by the `dark:`
          variant, on the same ground as the bar it sits in. */}
      <Avatar initials={initials} size="md" onDark />
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
 *
 * `variant="auto"` rather than `useResolvedTheme()` picking between `default` and
 * `light`: the hook's own contract is "surfaces CSS cannot reach", and a logo's
 * colours are not one. Reading it here made both bars re-render on every theme
 * change and, since `useMediaQuery` answers `false` on the server, served the
 * light-mode mark to dark-mode visitors until hydration.
 */
export function ChromeLogoLink({
  instanceId,
  className,
}: {
  instanceId: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={clsx("flex items-center", className)}
      aria-label="Nos Ilha home"
    >
      <NosilhaLogo
        size="sidebar"
        variant="auto"
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
