import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { openingWords, words } from "@/lib/copy/number-words";
import type { TownStatusSummary } from "@/types/town";

/**
 * The settlements index in prose. Spec 034 FR-007.
 *
 * Every number here is counted from the status summary the backend derives, never
 * written down: the archive's whole argument is that the gaps are real, and a
 * hard-coded total would be the first thing to go stale.
 *
 * The wording lives in the `settlements` messages (spec 041), one message per
 * sentence, with number words passed in as arguments.
 */

export type SettlementsTranslator = Translator<"settlements">;

/** The filter chips, in order; each label is `filters.<key>` in the messages. */
export const SETTLEMENT_FILTERS = ["all", "has", "none"] as const;

export type SettlementFilterKey = (typeof SETTLEMENT_FILTERS)[number];

const FILTER_KEYS = new Set<string>(SETTLEMENT_FILTERS);

/** An unknown or absent `?filter=` shows everything rather than nothing. */
export function parseSettlementFilter(
  value: string | undefined
): SettlementFilterKey {
  return value && FILTER_KEYS.has(value)
    ? (value as SettlementFilterKey)
    : "all";
}

export function filterSettlements(
  towns: TownStatusSummary[],
  filter: SettlementFilterKey
): TownStatusSummary[] {
  if (filter === "has") return towns.filter((t) => t.entryCount > 0);
  if (filter === "none") return towns.filter((t) => t.entryCount === 0);
  return towns;
}

export type SettlementChipCounts = Record<SettlementFilterKey, number>;

export function settlementChipCounts(
  towns: TownStatusSummary[]
): SettlementChipCounts {
  const has = towns.filter((t) => t.entryCount > 0).length;
  return { all: towns.length, has, none: towns.length - has };
}

/**
 * The standfirst: how many names the island carries, then how the three states
 * divide them.
 */
export function settlementStandfirst(
  t: SettlementsTranslator,
  locale: Locale,
  towns: TownStatusSummary[]
): string {
  if (towns.length === 0) return t("standfirst.empty");

  const count = (status: TownStatusSummary["status"]) =>
    towns.filter((town) => town.status === status).length;
  const documented = count("DOCUMENTED");
  const partial = count("PARTIAL");
  const nameOnly = count("NAME_ONLY");

  // Every count here is of settlements: `localidade` is feminine in Portuguese.
  return t("standfirst.counts", {
    total: towns.length,
    totalWords: openingWords(towns.length, locale, "feminine"),
    documented,
    documentedWords: openingWords(documented, locale, "feminine"),
    partial,
    partialWords: words(partial, locale, "feminine"),
    nameOnly,
    nameOnlyWords: words(nameOnly, locale, "feminine"),
  });
}

export interface SettlementStatusLine {
  text: string;
  /** Ochre marks a settlement the archive holds nothing about. */
  ochre: boolean;
}

/**
 * The line under a settlement's name.
 *
 * `photographCount` counts archive photographs inside the settlement's records; a
 * record's own hero is not one of them, so a settlement can have a photograph without
 * a count. That case says "a photograph" rather than inventing a number.
 */
export function settlementStatusLine(
  t: SettlementsTranslator,
  locale: Locale,
  town: TownStatusSummary
): SettlementStatusLine {
  if (town.entryCount === 0) {
    return { text: t("statusLine.nameOnly"), ochre: true };
  }

  return {
    text: t("statusLine.records", {
      records: town.entryCount,
      recordWords: openingWords(town.entryCount, locale),
      photoState:
        town.photographCount > 0
          ? "counted"
          : town.hasPhotograph
            ? "hero"
            : "none",
      photos: town.photographCount,
      photoWords: words(town.photographCount, locale, "feminine"),
    }),
    ochre: false,
  };
}

/** Population and elevation as recorded, or the sentence saying they are not. */
export function settlementMetaRow(
  t: SettlementsTranslator,
  town: TownStatusSummary
): [string, string] {
  return [
    town.population?.trim() || t("meta.populationNotRecorded"),
    town.elevation?.trim() || t("meta.elevationNotRecorded"),
  ];
}

/**
 * Where a settlement card goes.
 *
 * A settlement with records has a page worth opening. One that is only a name has
 * nothing to show, so the card goes to the map with the pin selected — the only place
 * that name means anything yet.
 */
export function settlementCardLink(town: TownStatusSummary): string {
  if (town.entryCount > 0) return `/${town.slug}`;

  const params = new URLSearchParams({
    mode: "settlements",
    sel: `s:${town.slug}`,
  });
  return `/map?${params.toString()}`;
}
