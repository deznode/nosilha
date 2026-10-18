import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { capitalise, toWords } from "@/lib/copy/number-words";
import {
  statusLabel,
  statusLine,
  type DocumentationStatus,
  type StatusTranslator,
} from "@/lib/status";
import type { MapItem, MapMode } from "./types";

/**
 * Every sentence the map explorer prints, as functions over live items and counts.
 * Spec 034 FR-005, FR-011; the wording lives in the `map` messages (spec 041).
 *
 * Each sentence is one message, with counts passed as plurals and number words as
 * arguments, so a language can reorder or agree them without code changes.
 *
 * The prototype's footers describe its extract ("Twenty-two are named in this
 * extract"); those halves are not ported — production shows the whole archive.
 */

export type MapTranslator = Translator<"map">;

/** Number words for a count. Photographs are feminine in Portuguese (`uma fotografia`). */
function words(
  n: number,
  locale: Locale,
  gender: "masculine" | "feminine" = "masculine"
): string {
  return toWords(n, { locale, gender });
}

/**
 * The word above a name: a settlement and a photograph are named by the map; a
 * record carries its category label from the adapter.
 */
export function itemEyebrow(t: MapTranslator, item: MapItem): string {
  switch (item.kind) {
    case "settlement":
      return t("copy.eyebrow.settlement");
    case "photo":
      return t("copy.eyebrow.photograph");
    case "record":
      return item.eyebrow ?? "";
  }
}

/** A settlement's photographs, as the arguments of a sentence that names them. */
function settlementPhotoArgs(item: MapItem, locale: Locale) {
  // A hero turns the dot green without being counted.
  const photos = item.photographCount ?? 0;
  return {
    photoState: !item.hasPhotograph
      ? "none"
      : photos === 0
        ? "hero"
        : "counted",
    photos,
    photoWords: words(photos, locale, "feminine"),
  };
}

/** The gaps in a located photograph's record, in the prototype's order. */
function photoGaps(item: MapItem): "both" | "place" | "credit" | "none" {
  if (!item.placeName && !item.credit) return "both";
  if (!item.placeName) return "place";
  if (!item.credit) return "credit";
  return "none";
}

/** The line under a name in the sidebar list. */
export function listStatusLine(
  t: MapTranslator,
  locale: Locale,
  item: MapItem,
  tStatus: StatusTranslator
): string {
  switch (item.kind) {
    case "settlement": {
      const n = item.recordCount ?? 0;
      if (n === 0) return statusLine("name", tStatus);
      return t("copy.settlementLine", {
        records: n,
        recordWords: capitalise(words(n, locale), locale),
        ...settlementPhotoArgs(item, locale),
      });
    }
    case "record":
      return t("copy.recordLine", {
        documented: item.status === "documented" ? "yes" : "no",
      });
    case "photo": {
      const gaps = photoGaps(item);
      if (gaps !== "none") return t("copy.photoGaps", { gaps });
      return [item.placeName, item.credit].join(" · ");
    }
  }
}

export interface SelectionCardCopy {
  eyebrow: string;
  name: string;
  status: string;
  description: string;
  primaryLabel: string;
}

function selectionStatus(
  t: MapTranslator,
  locale: Locale,
  item: MapItem
): string {
  switch (item.kind) {
    case "settlement": {
      const n = item.recordCount ?? 0;
      return t("copy.settlementStatus", {
        records: n,
        recordWords: capitalise(words(n, locale), locale),
        ...settlementPhotoArgs(item, locale),
      });
    }
    case "record":
      return t("copy.recordStatus", {
        documented: item.status === "documented" ? "yes" : "no",
      });
    case "photo":
      return t("copy.photoStatus", {
        named: item.placeName ? "yes" : "no",
        placeName: item.placeName ?? "",
      });
  }
}

function selectionDescription(t: MapTranslator, item: MapItem): string {
  const written = item.description.trim();
  if (written) return written;
  if (item.kind !== "photo") return t("copy.nothingRecorded");
  return t("copy.photoDescription", { gaps: photoGaps(item) });
}

/** The floating card for the selected pin. */
export function selectionCard(
  t: MapTranslator,
  locale: Locale,
  item: MapItem
): SelectionCardCopy {
  return {
    eyebrow: itemEyebrow(t, item),
    name: item.name,
    status: selectionStatus(t, locale, item),
    description: selectionDescription(t, item),
    primaryLabel: t(`copy.primary.${item.kind}`),
  };
}

export interface PopupCopy {
  image: string | null;
  title: string;
  /** The small caps line under the title; a photograph has none. */
  eyebrow: string | null;
  status: DocumentationStatus;
  statusLabel: string;
}

/** The hover preview. */
export function popupContent(
  t: MapTranslator,
  item: MapItem,
  tStatus: StatusTranslator
): PopupCopy {
  if (item.kind === "photo") {
    return {
      image: item.image ?? null,
      title: item.name,
      eyebrow: null,
      status: item.status,
      statusLabel: item.placeName
        ? t("copy.photoPin.named")
        : t("copy.photoPin.unnamed"),
    };
  }

  return {
    image: null,
    title: item.name,
    eyebrow: itemEyebrow(t, item),
    status: item.status,
    statusLabel: statusLabel(
      item.status,
      tStatus,
      item.kind === "record" ? "record" : "settlement"
    ),
  };
}

export interface LegendRow {
  status: DocumentationStatus;
  label: string;
  count: number;
}

/**
 * The pin key. Places are keyed by the three states; photographs by what their
 * coordinates tell — the ochre row counts what the map cannot show at all.
 */
export function legendRows(
  t: MapTranslator,
  mode: MapMode,
  counts: Record<DocumentationStatus, number>,
  photos: MapItem[],
  unlocated: number,
  tStatus: StatusTranslator
): LegendRow[] {
  if (mode === "photographs") {
    const allUnnamed = photos.every((photo) => !photo.placeName);
    return [
      {
        status: "partial",
        // The legend's word for a photograph pin, when every pin earns it.
        label: allUnnamed
          ? t("copy.photoPin.unnamed")
          : t("copy.photoPin.named"),
        count: photos.length,
      },
      { status: "name", label: t("copy.noCoordinates"), count: unlocated },
    ];
  }

  return (["documented", "partial", "name"] as const).map((status) => ({
    status,
    label: statusLabel(
      status,
      tStatus,
      mode === "records" ? "record" : "settlement"
    ),
    count: counts[status],
  }));
}

const coordinateKey = (item: MapItem) =>
  `${item.coordinates.lng},${item.coordinates.lat}`;

function recordsFooter(
  t: MapTranslator,
  locale: Locale,
  records: MapItem[]
): string {
  const total = records.length;

  const byPoint = new Map<string, MapItem[]>();
  for (const record of records) {
    const key = coordinateKey(record);
    byPoint.set(key, [...(byPoint.get(key) ?? []), record]);
  }
  const shared = [...byPoint.values()].filter((group) => group.length > 1);

  if (shared.length === 0) {
    return t("copy.recordsFooter", {
      count: total,
      words: capitalise(words(total, locale), locale),
    });
  }

  const sharing = shared.reduce((sum, group) => sum + group.length, 0);
  const args = {
    sharingWords: capitalise(words(sharing, locale), locale),
    totalWords: words(total, locale),
  };
  const town = shared.length === 1 ? shared[0][0].townName : undefined;

  return town
    ? t("copy.recordsShareAtTown", { ...args, town })
    : t("copy.recordsShare", args);
}

/** The note under the list. */
export function listFooter(
  t: MapTranslator,
  locale: Locale,
  mode: MapMode,
  items: MapItem[]
): string {
  switch (mode) {
    case "settlements": {
      // `localidade` is feminine in Portuguese.
      const recorded = t("copy.settlementsRecorded", {
        count: items.length,
        words: capitalise(words(items.length, locale, "feminine"), locale),
      });
      if (items.length === 0) return recorded;

      const holding = items.filter((item) => item.hasRecords).length;
      const records = t("copy.settlementsHolding", {
        count: holding,
        words: capitalise(words(holding, locale, "feminine"), locale),
      });
      return `${recorded} ${records}`;
    }
    case "records":
      return recordsFooter(t, locale, items);
    case "photographs":
      return t("copy.photographsFooter", {
        count: items.length,
        words: capitalise(words(items.length, locale, "feminine"), locale),
      });
  }
}

/** Photographs mode's dashed note; null when nothing is missing from the map. */
export function photographsNote(
  t: MapTranslator,
  locale: Locale,
  unlocated: number
): string | null {
  if (unlocated === 0) return null;
  return t("copy.photographsNote", {
    count: unlocated,
    words: capitalise(words(unlocated, locale, "feminine"), locale),
  });
}
