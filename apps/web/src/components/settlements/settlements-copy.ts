import {
  capitalise,
  countSentence,
  plural,
  toWords,
} from "@/lib/copy/number-words";
import type { TownStatusSummary } from "@/types/town";

/**
 * The settlements index in prose. Spec 034 FR-007.
 *
 * Every number here is counted from the status summary the backend derives, never
 * written down: the archive's whole argument is that the gaps are real, and a
 * hard-coded total would be the first thing to go stale.
 */

export type SettlementFilterKey = "all" | "has" | "none";

export interface SettlementFilter {
  key: SettlementFilterKey;
  label: string;
}

export const SETTLEMENT_FILTERS: readonly SettlementFilter[] = [
  { key: "all", label: "All settlements" },
  { key: "has", label: "Has records" },
  { key: "none", label: "Nothing yet" },
] as const;

const FILTER_KEYS = new Set<string>(SETTLEMENT_FILTERS.map((f) => f.key));

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

export interface SettlementChipCounts {
  all: number;
  has: number;
  none: number;
}

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
export function settlementStandfirst(towns: TownStatusSummary[]): string {
  if (towns.length === 0) return "No settlement carries a name on Brava yet.";

  const documented = towns.filter((t) => t.status === "DOCUMENTED").length;
  const partial = towns.filter((t) => t.status === "PARTIAL").length;
  const nameOnly = towns.filter((t) => t.status === "NAME_ONLY").length;

  const opening = countSentence(towns.length, {
    one: "{n} place carries a name on Brava",
    many: "{n} places carry a name on Brava",
    zero: "",
  });

  const split = [
    `${capitalise(toWords(documented))} ${plural(documented, "is", "are")} documented`,
    `${toWords(partial)} ${partial === 1 ? "holds" : "hold"} records without a photograph`,
    `and ${toWords(nameOnly)} ${plural(nameOnly, "is", "are")} a name and a coordinate`,
  ].join(", ");

  return `${opening}. ${split}.`;
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
  town: TownStatusSummary
): SettlementStatusLine {
  if (town.entryCount === 0) {
    return { text: "a name and a coordinate, nothing else", ochre: true };
  }

  const records = countSentence(town.entryCount, {
    one: "{n} record",
    many: "{n} records",
    zero: "",
  });

  let photographs: string;
  if (town.photographCount > 0) {
    photographs = countSentence(town.photographCount, {
      one: "{n} photograph",
      many: "{n} photographs",
      zero: "",
    }).toLowerCase();
  } else if (town.hasPhotograph) {
    photographs = "a photograph";
  } else {
    photographs = "no photograph";
  }

  return { text: `${records} · ${photographs}`, ochre: false };
}

/** Population and elevation as recorded, or the sentence saying they are not. */
export function settlementMetaRow(town: TownStatusSummary): [string, string] {
  return [
    town.population?.trim() || "population not recorded",
    town.elevation?.trim() || "elevation not recorded",
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
