import { capitalise, countSentence, toWords } from "@/lib/copy/number-words";
import {
  isPublicExternalMedia,
  type GalleryFacets,
  type GalleryQueryParams,
  type PublicExternalMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

/**
 * The photographs screen's filters and prose. Spec 034 FR-009, FR-018.
 *
 * Every count here comes from `/api/v1/gallery/facets` — the whole archive — never from the
 * page that happens to be loaded. A chip counting its own results would say "No place
 * 6" while fifteen records have no place, which is the exact misreading the redesign
 * exists to prevent.
 */

export type PhotographFilterKey = "place" | "noplace" | "nodate" | "films";

export interface PhotographFilter {
  key: PhotographFilterKey;
  label: string;
  /** Which facet counts this chip. */
  facet: keyof GalleryFacets;
  /** What the list endpoint is asked for. */
  query: GalleryQueryParams;
}

/**
 * Four chips, one always active. The archive has no "everything" view on purpose:
 * located photographs, unlocated ones and films are different kinds of record, and a
 * single stream of all three sorts by nothing meaningful.
 */
export const PHOTOGRAPH_FILTERS: readonly PhotographFilter[] = [
  {
    key: "place",
    label: "With a place",
    facet: "withPlace",
    query: { hasPlace: true },
  },
  {
    key: "noplace",
    label: "No place",
    facet: "withoutPlace",
    query: { hasPlace: false },
  },
  {
    key: "nodate",
    label: "No date",
    facet: "withoutDate",
    query: { hasDate: false },
  },
  {
    key: "films",
    label: "Films",
    facet: "films",
    query: { mediaType: "VIDEO" },
  },
] as const;

export const DEFAULT_PHOTOGRAPH_FILTER: PhotographFilterKey = "place";

const FILTER_KEYS = new Set<string>(PHOTOGRAPH_FILTERS.map((f) => f.key));

export function parsePhotographFilter(
  value: string | undefined
): PhotographFilterKey {
  return value && FILTER_KEYS.has(value)
    ? (value as PhotographFilterKey)
    : DEFAULT_PHOTOGRAPH_FILTER;
}

export function photographFilter(key: PhotographFilterKey): PhotographFilter {
  return PHOTOGRAPH_FILTERS.find((f) => f.key === key)!;
}

/**
 * A region is a settlement slug in the URL; the API takes coordinates. Resolving here
 * rather than server-side keeps the slug in the link people share.
 */
export interface ResolvedRegion {
  slug: string;
  name: string;
  nearLat: number;
  nearLng: number;
}

export function resolveRegion(
  slug: string | undefined,
  towns: TownStatusSummary[]
): ResolvedRegion | null {
  if (!slug) return null;

  const town = towns.find((item) => item.slug === slug);
  if (!town) return null;

  return {
    slug: town.slug,
    name: town.name,
    nearLat: town.latitude,
    nearLng: town.longitude,
  };
}

/** The query the list endpoint is asked for, given a chip and an optional region. */
export function photographQuery(
  key: PhotographFilterKey,
  region: ResolvedRegion | null,
  size: number
): GalleryQueryParams {
  const params: GalleryQueryParams = {
    ...photographFilter(key).query,
    size,
  };

  if (region) {
    params.nearLat = region.nearLat;
    params.nearLng = region.nearLng;
  }

  return params;
}

/**
 * "Twenty-six records: seventeen photographs and nine films. Eleven carry
 * coordinates read from the file. None carries a photographer."
 */
export function photographsStandfirst(facets: GalleryFacets): string {
  if (facets.total === 0) return "The archive holds no records yet.";

  const total = countSentence(facets.total, {
    one: "{n} record",
    many: "{n} records",
    zero: "",
  });
  const split = `${toWords(facets.photographs)} ${
    facets.photographs === 1 ? "photograph" : "photographs"
  } and ${toWords(facets.films)} ${facets.films === 1 ? "film" : "films"}`;

  const located = `${capitalise(toWords(facets.withPlace))} ${
    facets.withPlace === 1 ? "carries" : "carry"
  } coordinates read from the file.`;

  const credited =
    facets.uncredited === facets.total
      ? "None carries a photographer."
      : `${capitalise(toWords(facets.uncredited))} ${
          facets.uncredited === 1 ? "carries" : "carry"
        } no photographer.`;

  return `${total}: ${split}. ${located} ${credited}`;
}

/** "Showing 8 of 11", plus the region when one narrows it. */
export function showingLine(
  shown: number,
  total: number,
  region: ResolvedRegion | null
): string {
  return `Showing ${shown} of ${total}${region ? ` near ${region.name}` : ""}`;
}

/**
 * What the empty state says when a filter matches nothing.
 *
 * The prototype's films line points the reader at the section below, because there the
 * Films chip emptied the grid and the section did the showing. Here the chip filters
 * the grid *to* the films and the section stands down, so an empty films grid means
 * the archive holds no film at all — and "listed below" would point at nothing.
 */
export function emptyLine(
  key: PhotographFilterKey,
  region: ResolvedRegion | null
): string {
  if (key === "films") return "No film has been synced from YouTube yet.";
  return region
    ? "Try another filter, or clear the area."
    : "Try another filter.";
}

/** The ochre tray's heading and its explanation. */
export function unlocatedTray(
  facets: GalleryFacets,
  shown: number
): { heading: string; body: string } {
  const heading = countSentence(facets.withoutPlace, {
    one: "{n} photograph carries no coordinates",
    many: "{n} photographs carry no coordinates",
    zero: "Every photograph carries coordinates",
  });

  // The archive number first, then the extract number if they differ: an extract
  // count standing alone would read as a fact about the archive.
  const body =
    shown < facets.withoutPlace
      ? `${capitalise(toWords(shown))} of them ${
          shown === 1 ? "is" : "are"
        } shown below. None can appear on the map. If you recognise one, tell us where it was taken and it joins the island.`
      : "None of them can appear on the map. If you recognise one, tell us where it was taken and it joins the island.";

  return { heading, body };
}

/** "Nine, synced from YouTube. None records a length." */
export function filmsNote(films: { durationSeconds?: number }[]): string {
  if (films.length === 0) return "None yet.";

  const timed = films.filter((film) => !!film.durationSeconds).length;
  const lengths =
    timed === 0
      ? "None records a length."
      : `${capitalise(toWords(timed))} of them ${
          timed === 1 ? "records" : "record"
        } a length.`;

  return `${capitalise(toWords(films.length))}, synced from YouTube. ${lengths}`;
}

/**
 * Narrows a mixed archive page to the films in it.
 *
 * Lives here rather than beside the screen it feeds: the page calls it on the server,
 * and a function exported from a `"use client"` module cannot be called there.
 */
export function onlyFilms(items: PublicGalleryMedia[]): PublicExternalMedia[] {
  return items.filter(
    (item): item is PublicExternalMedia =>
      isPublicExternalMedia(item) && item.mediaType === "VIDEO"
  );
}
