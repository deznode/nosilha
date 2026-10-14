import type { Formats } from "next-intl";

/**
 * Named date and number formats, so every date on the site is written one way per
 * language. Shared by the request config and the unit test setup.
 */
export const formats = {
  dateTime: {
    monthYear: { month: "long", year: "numeric" },
    longDate: { day: "numeric", month: "long", year: "numeric" },
    /** "Jul 12, 2024" */
    mediumDate: { day: "numeric", month: "short", year: "numeric" },
    /** "Jul 2024" */
    shortMonthYear: { month: "short", year: "numeric" },
  },
} satisfies Formats;

/**
 * Fixed rather than the visitor's: a date rendered on the server and again in the
 * browser must not move across midnight with the visitor's clock.
 */
export const TIME_ZONE = "UTC";
