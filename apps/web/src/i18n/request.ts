import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import type { Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isEnabledLocale } from "./config";

/** Named date formats, so every date on the site is written one way per language. */
export const formats = {
  dateTime: {
    monthYear: { month: "long", year: "numeric" },
    longDate: { day: "numeric", month: "long", year: "numeric" },
  },
} satisfies Formats;

/**
 * The locale comes from the `[locale]` root segment, not from headers, so this can
 * run inside `"use cache"` and the locale joins the cache key.
 *
 * The time zone is fixed: a date rendered on the server and again in the browser
 * must not move across midnight with the visitor's clock.
 */
export default getRequestConfig(async () => {
  // `(admin)` is a root layout of its own with no `[locale]` segment, so the param
  // is undefined there. The admin area is English.
  const locale = (await rootLocale()) ?? DEFAULT_LOCALE;
  if (!isEnabledLocale(locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "UTC",
    formats,
  };
});
