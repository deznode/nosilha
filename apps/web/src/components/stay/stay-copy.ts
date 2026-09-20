import { countSentence, plural, toWords } from "@/lib/copy/number-words";
import type { DirectoryEntry } from "@/types/directory";

/**
 * The Stay screen in prose. Spec 034 FR-014.
 *
 * "Stay" is a display label; the category is `Hotel`, and it is the only one that may
 * carry a rating. The standfirst says so, because an archive that shows ratings
 * nowhere else owes the reader an explanation of where they went.
 */

export function stayStandfirst(stays: DirectoryEntry[]): string {
  const total = stays.length;
  if (total === 0) return "No place to stay is recorded on Brava yet.";

  const rated = stays.filter((entry) => entry.rating != null).length;

  const opening = countSentence(total, {
    one: "{n} place to stay on Brava",
    many: "{n} places to stay on Brava",
    zero: "",
  });

  // "none of the one has been rated" is technically true and unreadable; a single
  // record gets a pronoun instead of a fraction.
  let ratings: string;
  if (total === 1) {
    ratings = rated === 0 ? "it has not been rated yet" : "it has been rated";
  } else if (rated === 0) {
    ratings = `none of the ${toWords(total)} has been rated yet`;
  } else {
    ratings = `${toWords(rated)} of the ${toWords(total)} ${plural(
      rated,
      "has",
      "have"
    )} been rated`;
  }

  return `${opening}. This is the only part of the archive where a rating belongs, and ${ratings}.`;
}

/** The rating as printed, or the ochre sentence that stands in for it. */
export function stayRating(entry: DirectoryEntry): {
  text: string;
  ochre: boolean;
} {
  return entry.rating != null
    ? { text: `${entry.rating}`, ochre: false }
    : { text: "Not yet rated", ochre: true };
}
