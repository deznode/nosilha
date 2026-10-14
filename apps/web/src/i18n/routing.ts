import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, enabledLocales, type Locale } from "./config";

/**
 * English keeps its unprefixed addresses; Portuguese lives under `/pt`.
 *
 * Only enabled locales are routed. While Portuguese is off, `/pt` is not a locale
 * prefix at all, so `/pt/...` falls through to the English tree and is refused there
 * as a reserved settlement slug, exactly as before spec 041.
 *
 * Nothing is detected or remembered by the library: the only remembered choice is the
 * `nosilha-lang` cookie, read in `proxy.ts`. `hreflang` comes from page metadata, so
 * the library's `Link` response headers are off too.
 */
export const routing = defineRouting({
  locales: enabledLocales() as Locale[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});
