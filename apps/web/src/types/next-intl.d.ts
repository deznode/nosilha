import type { Locale } from "@/i18n/config";
import type { formats } from "@/i18n/formats";
import type messages from "../../messages/en.json";

// Narrows what `getLocale()` and `useLocale()` return from `string` to the routed
// locales, so a locale can be passed on without a cast. English messages are the
// source of truth, so a key or argument missing from `en.json` is a type error.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
