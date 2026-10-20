import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { openingWords, words } from "@/lib/copy/number-words";
import type { DirectoryEntry } from "@/types/directory";

/**
 * The Stay screen in prose. Spec 034 FR-014.
 *
 * "Stay" is a display label; the category is `Hotel`, and it is the only one that may
 * carry a rating. The standfirst says so, because an archive that shows ratings
 * nowhere else owes the reader an explanation of where they went.
 *
 * The wording lives in the `stay` messages (spec 041), one message per sentence.
 */

export type StayTranslator = Translator<"stay">;

export function stayStandfirst(
  t: StayTranslator,
  locale: Locale,
  stays: DirectoryEntry[]
): string {
  const total = stays.length;
  if (total === 0) return t("standfirst.empty");

  const rated = stays.filter((entry) => entry.rating != null).length;
  // "none of the one has been rated" is technically true and unreadable; a single
  // record gets a pronoun instead of a fraction. The message carries both shapes.
  return t("standfirst.counts", {
    total,
    totalWords: words(total, locale),
    openingWords: openingWords(total, locale),
    rated,
    ratedWords: words(rated, locale),
  });
}

/** The rating as printed, or the ochre sentence that stands in for it. */
export function stayRating(
  t: StayTranslator,
  entry: DirectoryEntry
): {
  text: string;
  ochre: boolean;
} {
  return entry.rating != null
    ? { text: `${entry.rating}`, ochre: false }
    : { text: t("notYetRated"), ochre: true };
}
