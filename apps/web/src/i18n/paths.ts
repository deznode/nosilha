import {
  DEFAULT_LOCALE,
  enabledLocales,
  LOCALE_SEGMENTS,
  type Locale,
} from "./config";

/**
 * Address helpers for the few places that cannot use the `Link` or router wrappers:
 * `history.replaceState`, a full-page `location` change, and paths handed to a route
 * handler. Everything else should go through `@/i18n/navigation`.
 */

/** `/pt/map` → `{ locale: "pt-PT", pathname: "/map" }`. Unprefixed addresses are English. */
export function splitLocalePath(
  pathname: string,
  locales: readonly Locale[] = enabledLocales()
): { locale: Locale; pathname: string } {
  for (const locale of locales) {
    if (locale === DEFAULT_LOCALE) continue;
    const segment = LOCALE_SEGMENTS[locale];
    if (pathname === `/${segment}`) return { locale, pathname: "/" };
    if (pathname.startsWith(`/${segment}/`)) {
      return { locale, pathname: pathname.slice(segment.length + 1) };
    }
  }
  return { locale: DEFAULT_LOCALE, pathname };
}

/** `/map?mode=records` → `/pt/map?mode=records` for Portuguese; unchanged for English. */
export function withLocale(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;
  const segment = LOCALE_SEGMENTS[locale];
  return href === "/" ? `/${segment}` : `/${segment}${href}`;
}
