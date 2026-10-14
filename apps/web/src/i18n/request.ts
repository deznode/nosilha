import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isEnabledLocale } from "./config";
import { formats, TIME_ZONE } from "./formats";

/**
 * The locale comes from the `[locale]` root segment, not from headers, so this can
 * run inside `"use cache"` and the locale joins the cache key.
 */
export default getRequestConfig(async () => {
  // `(admin)` is a root layout of its own with no `[locale]` segment, so the param
  // is undefined there. The admin area is English.
  const locale = (await rootLocale()) ?? DEFAULT_LOCALE;
  if (!isEnabledLocale(locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: TIME_ZONE,
    formats,
  };
});
