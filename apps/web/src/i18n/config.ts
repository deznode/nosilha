/**
 * The languages the public site is routed in. Spec 041.
 *
 * Content languages (`en`/`pt`/`kea`/`fr` in `lib/content/translations.ts`) are a
 * separate, wider list: a language can have articles without having a route.
 */
export const LOCALES = ["en", "pt"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Portuguese is merged before it is reviewed, so it ships switched off (FR-009).
 * `NEXT_PUBLIC_*` values are inlined at build time: turning this on is a rebuild.
 */
export const PORTUGUESE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PT === "true";

/**
 * The locales that have addresses right now. Typed as the full `Locale` list on
 * purpose: narrowing it to `["en"]` makes every comparison against `"pt"` a type
 * error while the flag is off.
 */
export function enabledLocales(
  portugueseEnabled: boolean = PORTUGUESE_ENABLED
): readonly Locale[] {
  return portugueseEnabled ? LOCALES : [DEFAULT_LOCALE];
}

export function isEnabledLocale(
  value: unknown,
  portugueseEnabled: boolean = PORTUGUESE_ENABLED
): value is Locale {
  return enabledLocales(portugueseEnabled).some((locale) => locale === value);
}

/** BCP 47 tags for `Intl` formatting and `hreflang`. */
export const BCP47_TAGS: Record<Locale, string> = {
  en: "en-US",
  pt: "pt-PT",
};

/** The `<html lang>` value. English stays `en`, as it was before the locale segment. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  pt: "pt-PT",
};

/** Open Graph spells its locales with an underscore. */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  pt: "pt_PT",
};

/** Remembers an explicit language choice; read by the proxy only, for `/`. */
export const LOCALE_COOKIE = "nosilha-lang";
