import { DEFAULT_LOCALE, enabledLocales, type Locale } from "./config";

/**
 * Address helpers for the few places that cannot use the `Link` or router wrappers:
 * `history.replaceState`, a full-page `location` change, and paths handed to a route
 * handler. Everything else should go through `@/i18n/navigation`.
 */

/** `/pt/map` → `{ locale: "pt", pathname: "/map" }`. Unprefixed addresses are English. */
export function splitLocalePath(
  pathname: string,
  locales: readonly Locale[] = enabledLocales()
): { locale: Locale; pathname: string } {
  for (const locale of locales) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return { locale, pathname: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, pathname: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: DEFAULT_LOCALE, pathname };
}

/** `/map?mode=records` → `/pt/map?mode=records` for Portuguese; unchanged for English. */
export function withLocale(href: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}
