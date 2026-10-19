import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { openingWords, words } from "@/lib/copy/number-words";
import type { Town, TownStatusSummary } from "@/types/town";

/**
 * A settlement's page in prose. Spec 034 FR-008.
 *
 * The panel is the point of the screen: it says how many records sit here, that none
 * of them carries a photograph, and how many photographs the archive already holds
 * whose coordinates fall inside the settlement but which nobody has confirmed. Three
 * facts, three live numbers.
 *
 * Each sentence shape is one message in the `town` namespace (spec 041), with counts
 * as plurals and number words passed in, so a language can agree and reorder them.
 */

export type TownTranslator = Translator<"town">;

function recorded(value: string | null | undefined): boolean {
  return !!value?.trim();
}

/** "Five place records · no photograph of the town itself" */
export function settlementSubLine(
  t: TownTranslator,
  locale: Locale,
  summary: TownStatusSummary
): string {
  return t("subLine", {
    records: summary.entryCount,
    recordWords: openingWords(summary.entryCount, locale),
    photos: summary.photographCount,
    photoWords: words(summary.photographCount, locale, "feminine"),
  });
}

export interface PhotographPanel {
  eyebrow: string;
  heading: string;
  body: string;
  giveLabel: string;
  /** Null when there is nothing unconfirmed to look at. */
  unconfirmedLabel: string | null;
}

export function photographPanel(
  t: TownTranslator,
  locale: Locale,
  summary: TownStatusSummary
): PhotographPanel {
  const { name, entryCount, photographCount, unconfirmedPhotographCount } =
    summary;
  const recordArgs = {
    records: entryCount,
    recordWords: openingWords(entryCount, locale),
  };

  const sentences: string[] = [];
  if (entryCount === 0) {
    sentences.push(t("panel.noRecords"));
  } else if (photographCount === 0) {
    sentences.push(t("panel.recordsWithoutPhotograph", recordArgs));
  } else {
    sentences.push(t("panel.records", recordArgs));
  }

  if (unconfirmedPhotographCount > 0) {
    sentences.push(
      t("panel.unconfirmed", {
        count: unconfirmedPhotographCount,
        words: openingWords(unconfirmedPhotographCount, locale, "feminine"),
        name,
      })
    );
  }

  return {
    eyebrow: t("panel.eyebrow", { name }),
    heading: t("panel.heading", {
      count: photographCount,
      words: openingWords(photographCount, locale, "feminine"),
    }),
    body: sentences.join(" "),
    giveLabel: t("panel.give", { name }),
    unconfirmedLabel:
      unconfirmedPhotographCount > 0
        ? t("panel.seeUnconfirmed", {
            count: unconfirmedPhotographCount,
            words: words(unconfirmedPhotographCount, locale, "feminine"),
          })
        : null,
  };
}

/** The unconfirmed photographs are a region filter on the photographs screen. */
export function unconfirmedLink(summary: TownStatusSummary): string {
  return `/photographs?region=${encodeURIComponent(summary.slug)}`;
}

export interface SettlementQuestion {
  /** The town field the question is about, sent with the suggestion. */
  field: string;
  question: string;
}

/**
 * One question per field the settlement does not record.
 *
 * A question about something already recorded would read as though the archive had
 * not looked, so the list shrinks as the settlement fills in. `population` and
 * `elevation` live on the status summary, the rest on the settlement itself.
 */
export function settlementQuestions(
  t: TownTranslator,
  town: Town,
  summary: TownStatusSummary
): SettlementQuestion[] {
  const questions: SettlementQuestion[] = [];

  if (!recorded(summary.population)) {
    questions.push({
      field: "population",
      question: t("questions.population", { name: summary.name }),
    });
  }
  if (!recorded(summary.elevation)) {
    questions.push({
      field: "elevation",
      question: t("questions.elevation"),
    });
  }
  if (!recorded(town.founded)) {
    questions.push({
      field: "founded",
      question: t("questions.founded"),
    });
  }
  if (town.highlights.filter((h) => recorded(h)).length === 0) {
    questions.push({
      field: "highlights",
      question: t("questions.highlights"),
    });
  }

  return questions;
}
