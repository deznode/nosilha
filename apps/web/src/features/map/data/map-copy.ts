import { capitalise, countSentence, toWords } from "@/lib/copy/number-words";
import { STATUS_CONFIG, type DocumentationStatus } from "@/lib/status";
import type { MapItem, MapMode } from "./types";

/**
 * Every sentence the map explorer prints, as functions over live items and counts.
 * Spec 034 FR-005, FR-011.
 *
 * The prototype's footers describe its extract ("Twenty-two are named in this
 * extract"); those halves are not ported — production shows the whole archive.
 */

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** A settlement's photographs as a phrase. A hero turns the dot green without being counted. */
function settlementPhotoPhrase(item: MapItem): string {
  if (!item.hasPhotograph) return "no photograph";
  const n = item.photographCount ?? 0;
  if (n === 0) return "a photograph";
  return `${toWords(n)} ${plural(n, "photograph", "photographs")}`;
}

/** The gaps in a located photograph's record, in the prototype's order. */
function photoGaps(item: MapItem): string[] {
  const gaps: string[] = [];
  if (!item.placeName) gaps.push("no place name");
  if (!item.credit) gaps.push("no photographer");
  return gaps;
}

/** The line under a name in the sidebar list. */
export function listStatusLine(item: MapItem): string {
  switch (item.kind) {
    case "settlement": {
      const n = item.recordCount ?? 0;
      if (n === 0) return STATUS_CONFIG.name.line;
      return `${capitalise(toWords(n))} ${plural(n, "record", "records")}, ${settlementPhotoPhrase(item)}`;
    }
    case "record":
      return item.status === "documented" ? "one photograph" : "no photograph";
    case "photo": {
      const gaps = photoGaps(item);
      if (gaps.length > 0) return gaps.join(", ");
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

const NOTHING_RECORDED =
  "Nothing is recorded here beyond the name and the point. If you know this place, the archive is listening.";

const PRIMARY_LABEL: Record<MapItem["kind"], string> = {
  settlement: "Open settlement",
  record: "Open record",
  photo: "Open photograph",
};

function selectionStatus(item: MapItem): string {
  switch (item.kind) {
    case "settlement": {
      const n = item.recordCount ?? 0;
      if (n === 0) return "name only · nothing recorded here yet";
      return `${capitalise(toWords(n))} place ${plural(n, "record", "records")} · ${settlementPhotoPhrase(item)}`;
    }
    case "record":
      return item.status === "documented"
        ? "documented · one photograph"
        : "no photograph recorded";
    case "photo":
      return `coordinates from the file · ${item.placeName ?? "no place name"}`;
  }
}

function selectionDescription(item: MapItem): string {
  const written = item.description.trim();
  if (written) return written;
  if (item.kind !== "photo") return NOTHING_RECORDED;

  const gaps = photoGaps(item);
  const tail = gaps.length > 0 ? ` ${capitalise(gaps.join(", "))}.` : "";
  return `Coordinates read from the file.${tail}`;
}

/** The floating card for the selected pin. */
export function selectionCard(item: MapItem): SelectionCardCopy {
  return {
    eyebrow:
      item.kind === "photo" && item.filename
        ? `${item.eyebrow} · ${item.filename}`
        : item.eyebrow,
    name: item.name,
    status: selectionStatus(item),
    description: selectionDescription(item),
    primaryLabel: PRIMARY_LABEL[item.kind],
  };
}

/** The legend's word for a photograph pin, when every pin earns it. */
const PHOTO_PIN_LABEL = "coordinates, no place name";

export interface PopupCopy {
  image: string | null;
  title: string;
  sub: { kind: "file" | "eyebrow"; text: string } | null;
  status: DocumentationStatus;
  statusLabel: string;
}

/** The hover preview. */
export function popupContent(item: MapItem): PopupCopy {
  if (item.kind === "photo") {
    return {
      image: item.image ?? null,
      title: item.name,
      sub: item.filename ? { kind: "file", text: item.filename } : null,
      status: item.status,
      statusLabel: item.placeName
        ? "coordinates from the file"
        : PHOTO_PIN_LABEL,
    };
  }

  return {
    image: null,
    title: item.name,
    sub: { kind: "eyebrow", text: item.eyebrow },
    status: item.status,
    statusLabel: STATUS_CONFIG[item.status].label,
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
  mode: MapMode,
  counts: Record<DocumentationStatus, number>,
  photos: MapItem[],
  unlocated: number
): LegendRow[] {
  if (mode === "photographs") {
    const allUnnamed = photos.every((photo) => !photo.placeName);
    return [
      {
        status: "partial",
        label: allUnnamed ? PHOTO_PIN_LABEL : "coordinates from the file",
        count: photos.length,
      },
      { status: "name", label: "no coordinates", count: unlocated },
    ];
  }

  return (["documented", "partial", "name"] as const).map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: counts[status],
  }));
}

const coordinateKey = (item: MapItem) =>
  `${item.coordinates.lng},${item.coordinates.lat}`;

function recordsFooter(records: MapItem[]): string {
  const total = records.length;
  if (total === 0) return "No place record carries coordinates yet.";

  const byPoint = new Map<string, MapItem[]>();
  for (const record of records) {
    const key = coordinateKey(record);
    byPoint.set(key, [...(byPoint.get(key) ?? []), record]);
  }
  const shared = [...byPoint.values()].filter((group) => group.length > 1);

  if (shared.length === 0) {
    return countSentence(total, {
      one: "{n} place record carries coordinates.",
      many: "{n} place records carry coordinates.",
      zero: "",
    });
  }

  const sharing = shared.reduce((sum, group) => sum + group.length, 0);
  const head = `${capitalise(toWords(sharing))} of the ${toWords(total)}`;
  const town = shared.length === 1 ? shared[0][0].townName : undefined;

  return town
    ? `${head} share one coordinate at ${town}.`
    : `${head} share a coordinate with another record.`;
}

/** The note under the list. */
export function listFooter(mode: MapMode, items: MapItem[]): string {
  switch (mode) {
    case "settlements": {
      const recorded = countSentence(items.length, {
        one: "{n} settlement is recorded.",
        many: "{n} settlements are recorded.",
        zero: "No settlement is recorded yet.",
      });
      if (items.length === 0) return recorded;

      const holding = items.filter((item) => item.hasRecords).length;
      const records = countSentence(holding, {
        one: "{n} holds place records.",
        many: "{n} hold place records.",
        zero: "None holds a place record yet.",
      });
      return `${recorded} ${records}`;
    }
    case "records":
      return recordsFooter(items);
    case "photographs":
      return countSentence(items.length, {
        one: "{n} photograph carries coordinates.",
        many: "{n} photographs carry coordinates.",
        zero: "No photograph carries coordinates yet.",
      });
  }
}

/** Photographs mode's dashed note; null when nothing is missing from the map. */
export function photographsNote(unlocated: number): string | null {
  if (unlocated === 0) return null;
  return countSentence(unlocated, {
    one: "{n} photograph carries no coordinates and cannot appear here.",
    many: "{n} photographs carry no coordinates and cannot appear here.",
    zero: "",
  });
}

/**
 * Legend, selection-card and photographs-note bottoms, in pixels (SPECS §3).
 *
 * The prototype puts the note at the card's 62px, where on a wide screen it covers
 * MapLibre's zoom buttons and attribution in the same corner (112px tall). The note
 * clears them instead. On a narrow screen the sheet already covers that corner.
 */
export function overlayOffsets(
  narrow: boolean,
  sheetOpen: boolean
): { legend: number; card: number; note: number } {
  if (!narrow) return { legend: 14, card: 62, note: 122 };
  return sheetOpen
    ? { legend: 14, card: 14, note: 14 }
    : { legend: 146, card: 196, note: 196 };
}
