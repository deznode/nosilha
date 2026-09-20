import { countSentence, plural } from "@/lib/copy/number-words";
import type { Town, TownStatusSummary } from "@/types/town";

/**
 * A settlement's page in prose. Spec 034 FR-008.
 *
 * The panel is the point of the screen: it says how many records sit here, that none
 * of them carries a photograph, and how many photographs the archive already holds
 * whose coordinates fall inside the settlement but which nobody has confirmed. Three
 * facts, three live numbers.
 */

function recorded(value: string | null | undefined): boolean {
  return !!value?.trim();
}

function records(count: number): string {
  return countSentence(count, {
    one: "{n} record",
    many: "{n} records",
    zero: "No record",
  });
}

/** "Five place records · no photograph of the town itself" */
export function settlementSubLine(summary: TownStatusSummary): string {
  const placeRecords = countSentence(summary.entryCount, {
    one: "{n} place record",
    many: "{n} place records",
    zero: "No place record",
  });

  const photographs =
    summary.photographCount > 0
      ? countSentence(summary.photographCount, {
          one: "{n} photograph",
          many: "{n} photographs",
          zero: "",
        }).toLowerCase()
      : "no photograph of the town itself";

  return `${placeRecords} · ${photographs}`;
}

export interface PhotographPanel {
  eyebrow: string;
  heading: string;
  body: string;
  giveLabel: string;
  /** Null when there is nothing unconfirmed to look at. */
  unconfirmedLabel: string | null;
}

export function photographPanel(summary: TownStatusSummary): PhotographPanel {
  const { name, entryCount, photographCount, unconfirmedPhotographCount } =
    summary;

  const heading =
    photographCount > 0
      ? countSentence(photographCount, {
          one: "{n} photograph",
          many: "{n} photographs",
          zero: "",
        })
      : "None yet";

  const sentences: string[] = [];
  if (entryCount === 0) {
    sentences.push("No record sits in this town yet.");
  } else if (photographCount === 0) {
    const sit = plural(entryCount, "sits", "sit");
    const carries =
      entryCount === 1
        ? "it does not carry a photograph"
        : "not one of them carries a photograph";
    sentences.push(
      `${records(entryCount)} ${sit} in this town and ${carries}.`
    );
  } else {
    sentences.push(
      `${records(entryCount)} ${plural(entryCount, "sits", "sit")} in this town.`
    );
  }

  if (unconfirmedPhotographCount > 0) {
    const opening = countSentence(unconfirmedPhotographCount, {
      one: `{n} photograph in the archive has coordinates that fall inside ${name}`,
      many: `{n} photographs in the archive have coordinates that fall inside ${name}`,
      zero: "",
    });
    sentences.push(
      `${opening}, but nobody has confirmed the place, so ${plural(
        unconfirmedPhotographCount,
        "it is",
        "they are"
      )} not attached here.`
    );
  }

  return {
    eyebrow: `Photographs of ${name}`,
    heading,
    body: sentences.join(" "),
    giveLabel: `Give a photograph of ${name}`,
    unconfirmedLabel:
      unconfirmedPhotographCount > 0
        ? `${countSentence(unconfirmedPhotographCount, {
            one: "See the {n} unconfirmed photograph",
            many: "See the {n} unconfirmed photographs",
            zero: "",
          })}`
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
  town: Town,
  summary: TownStatusSummary
): SettlementQuestion[] {
  const questions: SettlementQuestion[] = [];

  if (!recorded(summary.population)) {
    questions.push({
      field: "population",
      question: `How many people live in ${summary.name}?`,
    });
  }
  if (!recorded(summary.elevation)) {
    questions.push({
      field: "elevation",
      question: "How high above the sea is it?",
    });
  }
  if (!recorded(town.founded)) {
    questions.push({
      field: "founded",
      question: "When was the town founded?",
    });
  }
  if (town.highlights.filter((h) => recorded(h)).length === 0) {
    questions.push({
      field: "highlights",
      question: "What should a visitor walk to first?",
    });
  }

  return questions;
}
