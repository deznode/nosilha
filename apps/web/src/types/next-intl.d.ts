import type { Locale } from "@/i18n/config";

// Narrows what `getLocale()` and `useLocale()` return from `string` to the routed
// locales, so a locale can be passed on without a cast.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
  }
}
