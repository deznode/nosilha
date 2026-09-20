import { categoryLabel } from "@/lib/category-label";
import { countSentence } from "@/lib/copy/number-words";
import type { DirectoryEntry } from "@/types/directory";

export { categoryLabel };

/**
 * A place record in prose. Spec 034 FR-013.
 *
 * The record's own gaps are the page's subject, so each sentence names one: the
 * photograph it does not have, the settlement it is alone in, the rating its category
 * will never carry.
 */

/** A credit that answers the question without naming anyone. */
const CREDIT_NOT_KNOWN = "not known";

/** "Nossa Senhora do Monte · Heritage" */
export function heroEyebrow(entry: DirectoryEntry): string {
  const town = entry.town?.trim();
  const category = categoryLabel(entry.category);
  return town ? `${town} · ${category}` : category;
}

/**
 * The chip over the hero. A record with no hero has nothing to credit, so there is no
 * chip rather than a chip about an absent photograph.
 */
export function heroCredit(entry: DirectoryEntry): string | null {
  if (!entry.heroImage) return null;

  const credit = entry.heroImage.photographerCredit?.trim();
  if (!credit || credit.toLowerCase() === CREDIT_NOT_KNOWN) {
    return "photographer not recorded";
  }

  const source = entry.heroImage.archiveSource?.trim();
  return source ? `${credit} · ${source}` : credit;
}

export interface PhotographsNote {
  /** The sentence under the heading, or null when the list speaks for itself. */
  note: string | null;
  /** The dashed panel appears only when there is nothing to show. */
  showEmptyState: boolean;
  /** The question the empty panel asks. */
  prompt: string;
}

/**
 * What to say about the record's photographs.
 *
 * The hero sentence exists because the distinction is real and invisible otherwise: a
 * hero is the image the record was created with, an archive record is a photograph
 * someone gave the archive. A record can have the first and none of the second, and
 * saying "none yet" without explaining the picture above it would read as a bug.
 */
export function photographsNote(
  entry: DirectoryEntry,
  count: number
): PhotographsNote {
  if (count > 0) {
    return {
      note: countSentence(count, {
        one: "{n} photograph of this place is in the archive.",
        many: "{n} photographs of this place are in the archive.",
        zero: "",
      }),
      showEmptyState: false,
      prompt: `Do you have another photograph of ${entry.name}?`,
    };
  }

  return {
    note: entry.heroImage
      ? "None yet. The photograph above came in as the record's hero image, not as an archive record."
      : null,
    showEmptyState: true,
    prompt: `Do you have a photograph of ${entry.name}?`,
  };
}

export interface AlsoRecorded {
  heading: string;
  /** Present only when there is nothing else in the settlement. */
  emptyNote: string | null;
}

export function alsoRecorded(
  entry: DirectoryEntry,
  siblingCount: number
): AlsoRecorded {
  const town = entry.town?.trim();

  return {
    heading: town ? `Also recorded in ${town}` : "Also recorded nearby",
    emptyNote:
      siblingCount === 0
        ? "Nothing else. This is the only record in the settlement."
        : null,
  };
}

/**
 * Why this record shows no rating. Accommodation is the only surface that carries
 * one, so every other category gets the sentence instead of a silent gap.
 */
export function ratingNote(entry: DirectoryEntry): string | null {
  if (entry.category === "Hotel") return null;

  return `${categoryLabel(entry.category)} records carry no rating. Ratings appear only where a visitor can stay.`;
}
