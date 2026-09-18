import type { DirectoryEntry } from "@/types/directory";
import {
  isPublicUserUploadMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";
import { categoryLabel } from "@/lib/category-label";
import {
  photoCredit,
  photoFilename,
  photoIsIdentifiablePerson,
  photoIsLocated,
  photoTitle,
} from "@/lib/photo-facts";
import { trimmed } from "@/lib/text";
import {
  getEntryStatus,
  getTownStatus,
  type DocumentationStatus,
} from "@/lib/status";
import type { MapItem, StatusFilter } from "./types";

/**
 * API responses → map items, one builder per mode. Spec 034 FR-011.
 *
 * Status comes from the one status table (FR-002); the pin reads its colour from the
 * status token at render time, so nothing here holds a colour.
 */

/** Every settlement, pinned at its recorded coordinate. */
export function settlementItems(towns: TownStatusSummary[]): MapItem[] {
  return towns.map((town) => ({
    key: `s:${town.slug}`,
    kind: "settlement",
    name: town.name,
    eyebrow: "Settlement",
    description: town.description ?? "",
    coordinates: { lat: town.latitude, lng: town.longitude },
    status: getTownStatus(town).status,
    hasRecords: town.entryCount > 0,
    // A name-only settlement still has a page: it is where its questions are asked.
    href: `/${town.slug}`,
    regionSlug: town.slug,
    recordCount: town.entryCount,
    hasPhotograph: town.hasPhotograph,
    photographCount: town.photographCount,
  }));
}

/**
 * Every place record with coordinates.
 *
 * `townSlugs` maps a settlement id to its slug. The display name is not slugged here:
 * "Fajã d'Água" slugs to `faja-d-agua`, the settlement's slug is `faja-de-agua`.
 */
export function recordItems(
  entries: DirectoryEntry[],
  townSlugs: Record<string, string>
): MapItem[] {
  return entries
    .filter((entry) => entry.latitude != null && entry.longitude != null)
    .map((entry) => {
      const townSlug = entry.townId ? (townSlugs[entry.townId] ?? null) : null;

      return {
        key: `r:${entry.slug}`,
        kind: "record",
        name: entry.name,
        eyebrow: categoryLabel(entry.category),
        description: entry.description ?? "",
        coordinates: { lat: entry.latitude, lng: entry.longitude },
        status: getEntryStatus(entry).status,
        hasRecords: false,
        href: townSlug ? `/${townSlug}/${entry.slug}` : null,
        regionSlug: townSlug,
        townName: entry.town,
      };
    });
}

/** Squared distance is enough to rank settlements a few kilometres apart. */
function nearestSlug(
  lat: number,
  lng: number,
  towns: TownStatusSummary[]
): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const town of towns) {
    const distance = (town.latitude - lat) ** 2 + (town.longitude - lng) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = town.slug;
    }
  }
  return best;
}

/**
 * Every archive upload that carries coordinates. Films carry none by design.
 *
 * A record flagged as showing an identifiable person nobody has vouched for still
 * pins — its coordinates are a fact — but its thumbnail is not shown on the map's
 * pins and previews (FR-022).
 */
export function photoItems(
  media: PublicGalleryMedia[],
  towns: TownStatusSummary[]
): MapItem[] {
  const items: MapItem[] = [];

  for (const record of media) {
    if (!isPublicUserUploadMedia(record) || !photoIsLocated(record)) continue;

    const lat = record.latitude as number;
    const lng = record.longitude as number;
    const image =
      !photoIsIdentifiablePerson(record) && trimmed(record.publicUrl)
        ? (record.publicUrl as string)
        : undefined;

    items.push({
      key: `p:${record.id}`,
      kind: "photo",
      name: photoTitle(record).text,
      eyebrow: "Photograph",
      description: trimmed(record.description) ?? "",
      coordinates: { lat, lng },
      // A pin from a file's coordinates: records a point, not a documented place.
      status: "partial",
      hasRecords: false,
      href: `/photographs/${record.id}`,
      regionSlug: nearestSlug(lat, lng, towns),
      image,
      filename: photoFilename(record),
      placeName: trimmed(record.locationName),
      credit: photoCredit(record),
    });
  }

  return items;
}

/** Lower case, accents stripped, so "faja" finds "Fajã". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** The status chip and the search box, applied to one mode's items. */
export function filterItems(
  items: MapItem[],
  status: StatusFilter,
  query: string
): MapItem[] {
  const needle = fold(query);
  if (status === "all" && !needle) return items;

  return items.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (!needle || fold(item.name).includes(needle))
  );
}

/** How many items are in each state, zero included. */
export function statusCounts(
  items: MapItem[]
): Record<DocumentationStatus, number> {
  const counts: Record<DocumentationStatus, number> = {
    documented: 0,
    partial: 0,
    name: 0,
  };
  for (const item of items) counts[item.status] += 1;
  return counts;
}
