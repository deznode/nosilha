import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { categoryLabel, type CategoryTranslator } from "@/lib/category-label";
import { capitalise, toWords } from "@/lib/copy/number-words";
import type { DirectoryEntry } from "@/types/directory";

export { categoryLabel };

/**
 * A place record in prose. Spec 034 FR-013.
 *
 * The record's own gaps are the page's subject, so each sentence names one: the
 * photograph it does not have, the settlement it is alone in, the rating its category
 * will never carry.
 *
 * The wording lives in the `entry` messages (spec 041); category names come from the
 * `categories` messages.
 */

export type EntryTranslator = Translator<"entry">;

/** A credit that answers the question without naming anyone. */
const CREDIT_NOT_KNOWN = "not known";

/** "Nossa Senhora do Monte · Heritage" */
export function heroEyebrow(
  tCategories: CategoryTranslator,
  entry: DirectoryEntry
): string {
  const town = entry.town?.trim();
  const category = categoryLabel(entry.category, tCategories);
  return town ? `${town} · ${category}` : category;
}

/**
 * The chip over the hero. A record with no hero has nothing to credit, so there is no
 * chip rather than a chip about an absent photograph.
 */
export function heroCredit(
  t: EntryTranslator,
  entry: DirectoryEntry
): string | null {
  if (!entry.heroImage) return null;

  const credit = entry.heroImage.photographerCredit?.trim();
  if (!credit || credit.toLowerCase() === CREDIT_NOT_KNOWN) {
    return t("noPhotographer");
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
  t: EntryTranslator,
  locale: Locale,
  entry: DirectoryEntry,
  count: number
): PhotographsNote {
  if (count > 0) {
    return {
      note: t("photographs.count", {
        count,
        // `fotografia` is feminine in Portuguese.
        words: capitalise(
          toWords(count, { locale, gender: "feminine" }),
          locale
        ),
      }),
      showEmptyState: false,
      prompt: t("photographs.promptAnother", { name: entry.name }),
    };
  }

  return {
    note: entry.heroImage ? t("photographs.heroOnly") : null,
    showEmptyState: true,
    prompt: t("photographs.prompt", { name: entry.name }),
  };
}

export interface AlsoRecorded {
  heading: string;
  /** Present only when there is nothing else in the settlement. */
  emptyNote: string | null;
}

export function alsoRecorded(
  t: EntryTranslator,
  entry: DirectoryEntry,
  siblingCount: number
): AlsoRecorded {
  const town = entry.town?.trim();

  return {
    heading: town
      ? t("alsoRecorded.inTown", { town })
      : t("alsoRecorded.nearby"),
    emptyNote: siblingCount === 0 ? t("alsoRecorded.onlyRecord") : null,
  };
}

/**
 * Why this record shows no rating. Accommodation is the only surface that carries
 * one, so every other category gets the sentence instead of a silent gap.
 */
export function ratingNote(
  t: EntryTranslator,
  tCategories: CategoryTranslator,
  entry: DirectoryEntry
): string | null {
  if (entry.category === "Hotel") return null;

  return t("ratingNote", {
    category: categoryLabel(entry.category, tCategories),
  });
}
