import type { Translator } from "@/i18n/types";

/**
 * How the archive names a category on screen. Spec 034 FR-014.
 *
 * `Hotel` is the category the data carries; "Stay" is what the archive calls it, on
 * the nav pill, the screen and the record. Every surface that prints a category name
 * reads from here, so a record's hero cannot say "Stay" while its field grid says
 * "Hotel".
 *
 * The words come from the `categories` namespace, keyed by the category the data
 * carries (spec 041 FR-004). Pass a translator for that namespace, from the hook or
 * from `getTranslations`. A category with no message is printed as
 * the data carries it.
 */
export type CategoryTranslator = Translator<"categories">;

/** Every category with a message in the `categories` namespace. */
const CATEGORY_KEYS = [
  "Restaurant",
  "Hotel",
  "Beach",
  "Heritage",
  "Nature",
  "Viewpoint",
  "Trail",
  "Church",
  "Port",
] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

function isCategoryKey(category: string): category is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(category);
}

export function categoryLabel(category: string, t: CategoryTranslator): string {
  return isCategoryKey(category) ? t(category) : category;
}
