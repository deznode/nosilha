import {
  capitalise,
  countSentence,
  plural,
  toWords,
} from "@/lib/copy/number-words";
import { formatDuration } from "@/lib/format-duration";
import { resolveExternalThumbnail } from "@/lib/gallery-mappers";
import { trimmed } from "@/lib/text";
import {
  isPublicExternalMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";
import type { MediaItem } from "@/types/media";

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
  title: string | null;
  source: FilmSource | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  place: string | null;
  filmmaker: string | null;
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

const UNTITLED_LABEL = "Title not recorded";
const UNKNOWN_SOURCE_LABEL = "Source not recorded";
export const NOT_RECORDED = "Not recorded";

/** Grid page size. The footer promises pagination at exactly this count. */
export const FILMS_PAGE_SIZE = 24;

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

/** A gallery record as a film, or null when it is not one. */
export function toFilm(media: PublicGalleryMedia): Film | null {
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

  return {
    id: media.id,
    title: trimmed(media.title),
    source,
    thumbnailUrl: resolveExternalThumbnail(
      media.thumbnailUrl,
      media.platform,
      hostId ?? media.externalId
    ),
    durationSeconds: media.durationSeconds ?? null,
    // The public external record carries no place or maker. They join here when the
    // archive stores them — never from `author`.
    place: null,
    filmmaker: null,
    featured: media.featured === true,
    identifiablePerson: media.identifiablePerson === true,
    playback,
    watchUrl,
  };
}

/** Every film in a page of gallery records, in the order given. */
export function toFilms(media: readonly PublicGalleryMedia[]): Film[] {
  return media.flatMap((m) => {
    const film = toFilm(m);
    return film ? [film] : [];
  });
}

export function filmTitleLabel(film: Film): string {
  return film.title ?? UNTITLED_LABEL;
}

function filmSourceLabel(film: Film): string {
  return film.source ?? UNKNOWN_SOURCE_LABEL;
}

/**
 * The card shape `VideoGrid` and `CompactVideoCard` read. The card's own fallback
 * draws the missing thumbnail, so none is invented here.
 */
export function filmToMediaItem(film: Film): MediaItem {
  return {
    id: film.id,
    type: "VIDEO",
    url: "",
    title: filmTitleLabel(film),
    thumbnailUrl: film.thumbnailUrl ?? undefined,
    category: "Film",
    author: filmSourceLabel(film),
    duration: film.durationSeconds ?? undefined,
  };
}

// ─── Facets, search and sorts ───────────────────────────────────────────────

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

/** Case-insensitive substring match over the title and source as displayed. */
export function searchFilms(films: readonly Film[], query: string): Film[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...films];
  return films.filter(
    (f) =>
      filmTitleLabel(f).toLowerCase().includes(q) ||
      filmSourceLabel(f).toLowerCase().includes(q)
  );
}

export type FilmSortKey = "title" | "needs" | "source";

export const FILM_SORT_OPTIONS: readonly {
  value: FilmSortKey;
  label: string;
}[] = [
  { value: "title", label: "Title A–Z" },
  { value: "needs", label: "Needs a title first" },
  { value: "source", label: "Source" },
];

const byTitle = (a: Film, b: Film) =>
  filmTitleLabel(a).localeCompare(filmTitleLabel(b));
const untitled = (f: Film) => (f.title === null ? 1 : 0);

/**
 * Orders the archive can actually answer. No film carries a date, so date sorts would
 * be inert controls.
 */
const FILM_SORTS: Record<FilmSortKey, (a: Film, b: Film) => number> = {
  title: (a, b) => untitled(a) - untitled(b) || byTitle(a, b),
  needs: (a, b) => untitled(b) - untitled(a) || byTitle(a, b),
  source: (a, b) =>
    filmSourceLabel(a).localeCompare(filmSourceLabel(b)) || byTitle(a, b),
};

export function sortFilms(films: readonly Film[], sort: FilmSortKey): Film[] {
  return [...films].sort(FILM_SORTS[sort]);
}

/**
 * The films a promotional slot (the featured player, the home strip) may show: never
 * one flagged as showing an unvouched-for person (spec 034 FR-022).
 */
export function promotableFilms(films: readonly Film[]): Film[] {
  return films.filter((f) => !f.identifiablePerson);
}

/** The film the index plays on arrival: the curated one, else the first in `sort`. */
export function pickFeatured(
  films: readonly Film[],
  sort: FilmSortKey = "title"
): Film | null {
  const candidates = promotableFilms(films);
  return (
    candidates.find((f) => f.featured) ?? sortFilms(candidates, sort)[0] ?? null
  );
}

// ─── Display values ─────────────────────────────────────────────────────────

/** YouTube and archive files are ocean blue, Vimeo valley green, unknown ochre. */
export function sourceDotColor(source: FilmSource | null): string {
  if (source === "Vimeo") return "var(--brand-valley-green)";
  if (source === null) return "var(--brand-sobrado-ochre)";
  return "var(--brand-ocean-blue)";
}

export function formatFilmLength(seconds: number | null): string | null {
  return seconds != null && seconds > 0 ? formatDuration(seconds) : null;
}

/** The source pill over the film page's player. */
export function playerNote(film: Film): string {
  if (film.source === "Archive file") return "Archive file · plays here";
  if (film.source) return `Embedded from ${film.source} · plays here`;
  return UNKNOWN_SOURCE_LABEL;
}

/** The film page's `<title>`. */
export function filmMetaTitle(film: Film): string {
  return film.title ?? "An untitled film of Brava";
}

// ─── Copy ───────────────────────────────────────────────────────────────────
//
// The handoff's sentences were written for its fixture (four titled of nine, no
// lengths). Each builder keeps that voice but says only what is true of the data it
// is given; with the fixture it returns the handoff's exact wording.

function joinClauses(clauses: string[]): string {
  if (clauses.length <= 1) return clauses.join("");
  return `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`;
}

/** "four carry a title", "one carries a title", "none carries a title". */
function titledClause(titled: number): string {
  if (titled === 0) return "none carries a title";
  return `${toWords(titled)} ${plural(titled, "carries", "carry")} a title`;
}

/**
 * The index intro: "Nine films in the archive. Four carry a title, none records a
 * length, and the collection grows as footage is contributed."
 */
export function filmsIntro(films: readonly Film[]): string {
  const total = films.length;
  const head = countSentence(total, {
    one: "{n} film in the archive.",
    many: "{n} films in the archive.",
    zero: "No films in the archive yet.",
  });

  const titled = films.filter((f) => f.title !== null).length;
  const clauses: string[] = [];
  if (total > 0 && titled < total) clauses.push(titledClause(titled));
  if (
    total > 0 &&
    films.every((f) => formatFilmLength(f.durationSeconds) === null)
  ) {
    clauses.push(
      total === 1 ? "it records no length" : "none records a length"
    );
  }
  clauses.push("the collection grows as footage is contributed");

  return `${head} ${capitalise(joinClauses(clauses))}.`;
}

/**
 * The home strip's sub-line: "Footage contributed to the archive." plus, only when
 * some films are untitled, "Four carry a title; the rest are waiting on the sync."
 */
export function filmsStripNote(
  films: readonly Film[],
  /** The archive's film count. When the list is shorter, titles go uncounted. */
  total: number = films.length
): string {
  const base = "Footage contributed to the archive.";
  // A partial list cannot say how many carry a title; saying nothing is true.
  if (films.length < total || films.length === 0) return base;
  const titled = films.filter((f) => f.title !== null).length;
  if (titled === films.length) return base;
  if (titled === 0) return `${base} None carries a title yet.`;
  return `${base} ${capitalise(titledClause(titled))}; the rest are waiting on the sync.`;
}

export function othersLine(others: number): string {
  return `${others} ${plural(others, "other", "others")} in the archive`;
}

export function archiveCountLine(total: number): string {
  return `${total} in the archive`;
}

/** Shown under the grid only while every film fits on one page. */
export const ONE_PAGE_LINE = `Every film fits on one page today. Pagination starts past ${toWords(FILMS_PAGE_SIZE)}.`;
