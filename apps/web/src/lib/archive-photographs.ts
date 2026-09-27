import { capitalise, plural, toWords } from "@/lib/copy/number-words";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { nearestSettlement } from "@/lib/nearest-settlement";
import { photoCredit, photoDateLabel } from "@/lib/photo-facts";
import { trimmed } from "@/lib/text";
import {
  isPublicUserUploadMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

/**
 * The photograph archive as the immersion screens read it. Spec 038 FR-003, FR-010 to
 * FR-013, FR-020 to FR-026.
 *
 * One server-side dataset feeds the index, the viewer and the film page, so the
 * nearest settlement, the heading and what is missing are decided once. The archive is
 * small (16 photographs in production), so filtering by place happens over this list
 * in the browser rather than in the API.
 */

export interface PlaceRef {
  slug: string;
  name: string;
}

export interface ArchivePhoto {
  id: string;
  src: string | null;
  alt: string;
  title: string | null;
  description: string | null;
  /** The settlement within ~2 km of the coordinates, or null. */
  near: PlaceRef | null;
  /** "July 2024", else an approximate date as written, else null. */
  monthYear: string | null;
  /** "July 12, 2024", else an approximate date as written, else null. */
  dateLabel: string | null;
  camera: string | null;
  category: string | null;
  width: number | null;
  height: number | null;
  identifiablePerson: boolean;
  missing: { photographer: boolean; place: boolean; date: boolean };
}

/** `all`, a settlement slug, or `unplaced`. */
export type PlaceFilter = string;
export const ALL_PLACES = "all";
export const UNPLACED = "unplaced";

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

function monthYearLabel(media: PublicGalleryMedia): string | null {
  if (!isPublicUserUploadMedia(media)) return null;
  const taken = trimmed(media.dateTaken);
  if (taken) {
    const parsed = new Date(taken);
    if (!Number.isNaN(parsed.getTime())) return MONTH_YEAR.format(parsed);
  }
  return trimmed(media.approximateDate);
}

/** One gallery record as an archive photograph. */
export function toArchivePhoto(
  media: PublicGalleryMedia,
  settlements: readonly TownStatusSummary[]
): ArchivePhoto {
  const upload = isPublicUserUploadMedia(media) ? media : null;
  const town = nearestSettlement(
    upload?.latitude,
    upload?.longitude,
    settlements
  );
  const near = town ? { slug: town.slug, name: town.name } : null;
  const title = trimmed(media.title);
  const monthYear = monthYearLabel(media);
  const dateLabel = photoDateLabel(media);
  const camera =
    [trimmed(upload?.cameraMake), trimmed(upload?.cameraModel)]
      .filter(Boolean)
      .join(" ") || null;
  const width = upload?.width && upload.width > 0 ? upload.width : null;
  const height = upload?.height && upload.height > 0 ? upload.height : null;

  const photo: ArchivePhoto = {
    id: media.id,
    src: resolvePublicImageUrl(media),
    alt: "",
    title,
    description: trimmed(media.description),
    near,
    monthYear,
    dateLabel,
    camera,
    category: trimmed(media.category),
    width,
    height,
    identifiablePerson: media.identifiablePerson === true,
    missing: {
      photographer: photoCredit(media) === null,
      place: near === null,
      date: dateLabel === null,
    },
  };
  photo.alt = trimmed(media.altText) ?? photoHeading(photo);
  return photo;
}

export function toArchivePhotos(
  media: readonly PublicGalleryMedia[],
  settlements: readonly TownStatusSummary[]
): ArchivePhoto[] {
  return media
    .filter(
      (m) =>
        isPublicUserUploadMedia(m) ||
        ("mediaType" in m && m.mediaType === "IMAGE")
    )
    .map((m) => toArchivePhoto(m, settlements));
}

// ─── Place filter ───────────────────────────────────────────────────────────

export interface PlaceChip {
  key: PlaceFilter;
  label: string;
  count: number;
}

/**
 * `All N`, then each settlement with photographs by count (ties by name), then
 * `Not yet placed N`. Settlements with none are left out; Not yet placed always shows,
 * as in the handoff, so a zero reads as an achievement rather than an absence.
 */
export function placeChips(photos: readonly ArchivePhoto[]): PlaceChip[] {
  const bySlug = new Map<string, PlaceChip>();
  let unplaced = 0;
  for (const photo of photos) {
    if (!photo.near) {
      unplaced++;
      continue;
    }
    const chip = bySlug.get(photo.near.slug);
    if (chip) chip.count++;
    else
      bySlug.set(photo.near.slug, {
        key: photo.near.slug,
        label: photo.near.name,
        count: 1,
      });
  }
  const settlements = [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );

  return [
    { key: ALL_PLACES, label: "All", count: photos.length },
    ...settlements,
    { key: UNPLACED, label: "Not yet placed", count: unplaced },
  ];
}

export function filterByPlace<T extends Pick<ArchivePhoto, "near">>(
  photos: readonly T[],
  place: PlaceFilter
): T[] {
  if (place === ALL_PLACES) return [...photos];
  if (place === UNPLACED) return photos.filter((p) => !p.near);
  return photos.filter((p) => p.near?.slug === place);
}

/** A `?place=` value this dataset can answer, else `all`. */
export function parsePlaceParam(
  value: string | null | undefined,
  photos: readonly ArchivePhoto[]
): PlaceFilter {
  if (!value || value === ALL_PLACES) return ALL_PLACES;
  if (value === UNPLACED) return UNPLACED;
  return photos.some((p) => p.near?.slug === value) ? value : ALL_PLACES;
}

/**
 * The `?place=` equivalent of a spec 034 link (`?filter=` and `?region=`), or null
 * when the URL carries neither. A region wins over a filter: it is the narrower ask.
 */
export function legacyPlaceParam(params: {
  filter?: string | null;
  region?: string | null;
}): PlaceFilter | null {
  const region = trimmed(params.region);
  if (region) return region;
  const filter = trimmed(params.filter);
  if (!filter) return null;
  return filter === "noplace" ? UNPLACED : ALL_PLACES;
}

/** The filter's name as the viewer and the back link show it; empty for all. */
export function placeLabel(
  place: PlaceFilter,
  photos: readonly ArchivePhoto[]
): string {
  if (place === ALL_PLACES) return "";
  if (place === UNPLACED) return "Not yet placed";
  return photos.find((p) => p.near?.slug === place)?.near?.name ?? "";
}

/** The index URL for a place filter; `all` is the default and omitted. */
export function photographsHref(place: PlaceFilter): string {
  return place === ALL_PLACES
    ? "/photographs"
    : `/photographs?place=${encodeURIComponent(place)}`;
}

/** A photograph's URL, carrying the filter it was opened under. */
export function photographHref(id: string, place: PlaceFilter): string {
  return place === ALL_PLACES
    ? `/photographs/${id}`
    : `/photographs/${id}?place=${encodeURIComponent(place)}`;
}

// ─── Selection and stepping ─────────────────────────────────────────────────

/** Day of the year (1–366), in UTC so the server and every reader agree. */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return Math.floor((today - start) / 86_400_000);
}

/**
 * Today's photograph: rotates daily through those with a caption of their own and a
 * settlement, else any located one, else any. A photograph showing an unvouched-for
 * person never takes the slot (spec 034 FR-022).
 */
export function featureOfDay(
  photos: readonly ArchivePhoto[],
  date: Date
): ArchivePhoto | null {
  const eligible = photos.filter((p) => !p.identifiablePerson);
  const described = eligible.filter((p) => photoCaption(p) && p.near);
  const located = eligible.filter((p) => p.near);
  const pool = described.length
    ? described
    : located.length
      ? located
      : eligible;
  if (pool.length === 0) return null;
  return pool[dayOfYear(date) % pool.length];
}

/** The photograph `dir` steps from `id`, wrapping at the ends. */
export function stepWithin<T extends { id: string }>(
  list: readonly T[],
  id: string,
  dir: 1 | -1
): T | null {
  if (list.length === 0) return null;
  const index = Math.max(
    0,
    list.findIndex((p) => p.id === id)
  );
  return list[(index + dir + list.length) % list.length];
}

/** Up to six others from the same settlement, or other unplaced photographs. */
export function moreFrom(
  photo: ArchivePhoto,
  photos: readonly ArchivePhoto[],
  limit = 6
): ArchivePhoto[] {
  return photos
    .filter(
      (p) =>
        p.id !== photo.id &&
        (photo.near ? p.near?.slug === photo.near.slug : !p.near)
    )
    .slice(0, limit);
}

export function moreFromTitle(photo: ArchivePhoto): string {
  return photo.near
    ? `More from ${photo.near.name}`
    : "Also waiting for a place";
}

// ─── Copy ───────────────────────────────────────────────────────────────────

/** The title, else `Near X`, else `A photograph of Brava`. */
export function photoHeading(
  photo: Pick<ArchivePhoto, "title" | "near">
): string {
  return (
    photo.title ??
    (photo.near ? `Near ${photo.near.name}` : "A photograph of Brava")
  );
}

/** The description, unless it only repeats the title. */
export function photoCaption(
  photo: Pick<ArchivePhoto, "title" | "description">
): string | null {
  if (!photo.description) return null;
  return photo.description === photo.title ? null : photo.description;
}

/** `Near X · Month YYYY`; either part may be absent; null when both are. */
export function photoLine(
  photo: Pick<ArchivePhoto, "near" | "monthYear">
): string | null {
  return (
    [photo.near ? `Near ${photo.near.name}` : null, photo.monthYear]
      .filter(Boolean)
      .join(" · ") || null
  );
}

/** `<date> · <camera>`, or null when neither is recorded. */
export function photoMeta(
  photo: Pick<ArchivePhoto, "dateLabel" | "camera">
): string | null {
  return [photo.dateLabel, photo.camera].filter(Boolean).join(" · ") || null;
}

/** `Photograph · Landscape`, or `Photograph`. */
export function photoEyebrow(photo: Pick<ArchivePhoto, "category">): string {
  return ["Photograph", photo.category].filter(Boolean).join(" · ");
}

function joinAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * `Not yet recorded: who took it, where and when.`, naming only what is missing; null
 * when the record is complete.
 */
export function viewerHelpLine(photo: ArchivePhoto): string | null {
  const missing: string[] = [];
  if (photo.missing.photographer) missing.push("who took it");
  if (photo.missing.place) missing.push("where");
  if (photo.missing.date) missing.push("when");
  return missing.length ? `Not yet recorded: ${joinAnd(missing)}.` : null;
}

/** Which field the viewer's help link asks about first. */
export function firstMissingField(
  photo: ArchivePhoto
): "photographer" | "place" | "date" | null {
  if (photo.missing.photographer) return "photographer";
  if (photo.missing.place) return "place";
  if (photo.missing.date) return "date";
  return null;
}

/**
 * The index's one invitation to help:
 * `Every photograph here is still missing its photographer, and six have no place.
 * Recognise one?` Each clause follows the real counts; null when nothing is missing.
 */
export function indexHelpLine(photos: readonly ArchivePhoto[]): string | null {
  const total = photos.length;
  if (total === 0) return null;
  const uncredited = photos.filter((p) => p.missing.photographer).length;
  const unplaced = photos.filter((p) => !p.near).length;

  const placeClause = (lead: boolean) => {
    const verb = plural(unplaced, "has", "have");
    const n = lead ? capitalise(toWords(unplaced)) : toWords(unplaced);
    return lead
      ? `${n} ${plural(unplaced, "photograph", "photographs")} ${verb} no place yet`
      : `${n} ${verb} no place`;
  };

  let sentence: string;
  if (uncredited === total) {
    sentence = "Every photograph here is still missing its photographer";
    if (unplaced > 0) sentence += `, and ${placeClause(false)}`;
  } else if (uncredited > 0) {
    sentence = `${capitalise(toWords(uncredited))} ${plural(
      uncredited,
      "photograph is",
      "photographs are"
    )} still missing a photographer`;
    if (unplaced > 0) sentence += `, and ${placeClause(false)}`;
  } else if (unplaced > 0) {
    sentence = placeClause(true);
  } else {
    return null;
  }
  return `${sentence}. Recognise one?`;
}

/**
 * The photographs `Show me one that needs help` picks from: the unplaced ones when
 * there are any (opened under `?place=unplaced`), else any with something missing.
 */
export function needsHelpPool(photos: readonly ArchivePhoto[]): {
  photos: ArchivePhoto[];
  place: PlaceFilter;
} {
  const unplaced = photos.filter((p) => !p.near);
  if (unplaced.length) return { photos: unplaced, place: UNPLACED };
  return {
    photos: photos.filter((p) => p.missing.photographer || p.missing.date),
    place: ALL_PLACES,
  };
}
