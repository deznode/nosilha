import { countSentence } from "@/lib/copy/number-words";
import { resolveExternalThumbnail } from "@/lib/gallery-mappers";
import { trimmed } from "@/lib/text";
import {
  isPublicExternalMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";

/** A settlement as a film names it. */
export interface FilmPlace {
  slug: string;
  name: string;
}

/** What `toFilm` needs to name a film's settlement from its `placeId`. */
export type FilmSettlement = FilmPlace & { id: string | null };

/**
 * The films section's single reading of a film record. Spec 035 FR-001.
 *
 * Every films surface — the index, the film page, the home strip — asks this module
 * what a film is and what is missing from it, so each absence is decided once. A value
 * the archive does not hold is `null` here and "Not recorded" on screen; nothing is
 * filled in from a field that means something else. `author`, in particular, is the
 * playlist owner the YouTube sync recorded, not the person who made the film.
 */

export type FilmSource = "YouTube" | "Vimeo" | "Archive file";

/** How the film plays in place. Null when nothing the record holds can play it. */
export type FilmPlayback =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file"; url: string }
  | null;

export interface Film {
  id: string;
  /** The curated title, else the host's; null when neither is recorded. */
  title: string | null;
  /** What every surface shows: the curated title, else the host's, else "Untitled film". */
  displayTitle: string;
  /** The host's own title ("Listed on YouTube as …"), kept when a curator renames it. */
  sourceTitle: string | null;
  /** The record's description, unless it only repeats the source title. */
  description: string | null;
  source: FilmSource | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  /** The settlement it was filmed near, resolved from `placeId`. Spec 038 FR-004. */
  place: FilmPlace | null;
  featured: boolean;
  /**
   * Shows an identifiable person nobody has vouched for (spec 034 FR-022): listed,
   * but kept out of the featured slot and the home strip.
   */
  identifiablePerson: boolean;
  playback: FilmPlayback;
  /** The host's own page — only offered when the embed refuses to play. */
  watchUrl: string | null;
}

const UNTITLED_FILM = "Untitled film";

/**
 * How many films a screen asks the API for: its page cap. The index filters, sorts
 * and pages in the browser; past this many films it moves to server paging.
 */
export const FILMS_FETCH_SIZE = 100;

const YOUTUBE_ID =
  /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/;

function firstMatch(
  pattern: RegExp,
  ...urls: (string | null)[]
): string | null {
  for (const url of urls) {
    const match = url?.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const SOURCE_BY_PLATFORM: Record<string, FilmSource> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  SELF_HOSTED: "Archive file",
};

/**
 * A gallery record as a film, or null when it is not one. `settlements` names the
 * film's place; without it, or when the id is unknown, the place is null.
 */
export function toFilm(
  media: PublicGalleryMedia,
  settlements: readonly FilmSettlement[] = []
): Film | null {
  if (!isPublicExternalMedia(media) || media.mediaType !== "VIDEO") return null;

  const source = SOURCE_BY_PLATFORM[media.platform] ?? null;
  const idPattern =
    source === "YouTube" ? YOUTUBE_ID : source === "Vimeo" ? VIMEO_ID : null;
  const hostId = idPattern
    ? (trimmed(media.externalId) ??
      firstMatch(idPattern, media.embedUrl, media.url))
    : null;
  const fileUrl = source === "Archive file" ? trimmed(media.url) : null;

  let playback: FilmPlayback = null;
  let watchUrl: string | null = null;

  if (hostId && source === "YouTube") {
    playback = { kind: "youtube", id: hostId };
    watchUrl = `https://www.youtube.com/watch?v=${hostId}`;
  } else if (hostId && source === "Vimeo") {
    playback = { kind: "vimeo", id: hostId };
    watchUrl = `https://vimeo.com/${hostId}`;
  } else if (fileUrl) {
    playback = { kind: "file", url: fileUrl };
  }

  const sourceTitle = trimmed(media.title);
  const curated = trimmed(media.displayTitle);
  const description = trimmed(media.description);
  const placeId = trimmed(media.placeId);
  const settlement = placeId
    ? settlements.find((s) => s.id === placeId)
    : undefined;

  return {
    id: media.id,
    title: curated ?? sourceTitle,
    displayTitle: curated ?? sourceTitle ?? UNTITLED_FILM,
    sourceTitle,
    description: description === sourceTitle ? null : description,
    source,
    thumbnailUrl: resolveExternalThumbnail(
      media.thumbnailUrl,
      media.platform,
      hostId ?? media.externalId
    ),
    durationSeconds: media.durationSeconds ?? null,
    place: settlement ? { slug: settlement.slug, name: settlement.name } : null,
    featured: media.featured === true,
    identifiablePerson: media.identifiablePerson === true,
    playback,
    watchUrl,
  };
}

/** Every film in a page of gallery records, in the order given. */
export function toFilms(
  media: readonly PublicGalleryMedia[],
  settlements: readonly FilmSettlement[] = []
): Film[] {
  return media.flatMap((m) => {
    const film = toFilm(m, settlements);
    return film ? [film] : [];
  });
}

/** A film's page; `play` starts it with sound on arrival. */
export function filmHref(id: string, { play = false } = {}): string {
  return play ? `/films/${id}?play=1` : `/films/${id}`;
}

/** Keeps a film that cannot play visibly set apart wherever its still shows. */
export const UNPLAYABLE_STILL_FILTER = "grayscale(.85) brightness(.6)";

// ─── Facets and order ───────────────────────────────────────────────────────

export type FilmFacetKey = "all" | "titled" | "youtube" | "vimeo" | "file";

export interface FilmFacet {
  key: FilmFacetKey;
  label: string;
  test: (film: Film) => boolean;
}

/**
 * Only the facets this data can answer. Place and year join when those fields are
 * populated; neither exists in the archive yet.
 */
export const FILM_FACETS: readonly FilmFacet[] = [
  { key: "all", label: "All films", test: () => true },
  { key: "titled", label: "Titled", test: (f) => f.title !== null },
  { key: "youtube", label: "YouTube", test: (f) => f.source === "YouTube" },
  { key: "vimeo", label: "Vimeo", test: (f) => f.source === "Vimeo" },
  {
    key: "file",
    label: "Archive file",
    test: (f) => f.source === "Archive file",
  },
];

export function filmFacet(key: FilmFacetKey): FilmFacet {
  return FILM_FACETS.find((f) => f.key === key) ?? FILM_FACETS[0];
}

/** Each facet's count over the whole list, zeros included. */
export function facetCounts(
  films: readonly Film[]
): Record<FilmFacetKey, number> {
  return Object.fromEntries(
    FILM_FACETS.map((facet) => [facet.key, films.filter(facet.test).length])
  ) as Record<FilmFacetKey, number>;
}

/** Titled films A–Z, then the untitled ones. */
function byTitle(a: Film, b: Film): number {
  if (a.title === null || b.title === null) {
    return (a.title === null ? 1 : 0) - (b.title === null ? 1 : 0);
  }
  return a.title.localeCompare(b.title);
}

/**
 * The films a promotional slot (the featured player, the home strip) may show: never
 * one flagged as showing an unvouched-for person (spec 034 FR-022).
 */
export function promotableFilms(films: readonly Film[]): Film[] {
  return films.filter((f) => !f.identifiablePerson);
}

/** The film the index plays on arrival: the curated one, else the first by title. */
export function pickFeatured(films: readonly Film[]): Film | null {
  const candidates = promotableFilms(films);
  return (
    candidates.find((f) => f.featured) ??
    [...candidates].sort(byTitle)[0] ??
    null
  );
}

// ─── Playback order (spec 038 FR-043) ───────────────────────────────────────

/** Whether anything the record holds can play it here. */
export function canPlay(film: Film): boolean {
  return film.playback !== null;
}

/**
 * The film page's Up next list: films from the same place first, then the other
 * playable films, then the ones that cannot play, each group in the order given.
 */
export function upNext(film: Film, films: readonly Film[]): Film[] {
  const others = films.filter((f) => f.id !== film.id);
  const same = others.filter(
    (f) => film.place !== null && f.place?.slug === film.place.slug
  );
  const rest = others.filter((f) => !same.includes(f));
  return [
    ...same,
    ...rest.filter((f) => canPlay(f)),
    ...rest.filter((f) => !canPlay(f)),
  ];
}

// ─── Immersion copy (spec 038) ──────────────────────────────────────────────

/** `Film · YouTube`, `Film · Vimeo`, `Film · Archive file`, or `Film`. */
export function filmEyebrow(film: Film): string {
  return film.source ? `Film · ${film.source}` : "Film";
}

/** `Filmed near Nova Sintra`, or null. */
export function filmedNear(film: Film): string | null {
  return film.place ? `Filmed near ${film.place.name}` : null;
}

function fileName(url: string): string {
  const path = url.split(/[?#]/)[0];
  const last = path.split("/").filter(Boolean).pop();
  try {
    return last ? decodeURIComponent(last) : url;
  } catch {
    return last ?? url;
  }
}

/**
 * `Listed on YouTube as “<source title>”`, or `Archive file: <filename>`; null when
 * the record holds neither.
 */
export function filmSourceLine(film: Film): string | null {
  if (film.playback?.kind === "file") {
    return `Archive file: ${fileName(film.playback.url)}`;
  }
  if (film.source && film.source !== "Archive file" && film.sourceTitle) {
    return `Listed on ${film.source} as “${film.sourceTitle}”`;
  }
  return null;
}

/**
 * `Not yet recorded: where it was filmed or who filmed it.`, naming only what is
 * missing. The archive stores no maker yet (never read it from `author`), so that
 * part always shows.
 */
export function filmHelpLine(film: Film): string {
  return film.place
    ? "Not yet recorded: who filmed it."
    : "Not yet recorded: where it was filmed or who filmed it.";
}

/** `Nine in the archive`, `One in the archive`, `None in the archive yet`. */
export function filmsCountWords(count: number): string {
  return countSentence(count, {
    one: "{n} in the archive",
    many: "{n} in the archive",
    zero: "None in the archive yet",
  });
}
