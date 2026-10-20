import {
  DEFAULT_LOCALE,
  enabledLocales,
  LOCALE_SEGMENTS,
  type Locale,
} from "./config";

/**
 * Reads the locale back out of an address, for code that only has `location.pathname`.
 * Building a prefixed address goes through `getPathname` in `@/i18n/navigation`.
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
