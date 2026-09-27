import type { Film } from "@/lib/films";

/** A playable YouTube film; `title` drives the display and source titles. */
export function makeFilm(id: string, overrides: Partial<Film> = {}): Film {
  const title = "title" in overrides ? (overrides.title ?? null) : `Film ${id}`;
  return {
    id,
    title,
    displayTitle: title ?? "Untitled film",
    sourceTitle: title,
    description: null,
    source: "YouTube",
    thumbnailUrl: null,
    durationSeconds: null,
    place: null,
    featured: false,
    identifiablePerson: false,
    playback: { kind: "youtube", id },
    watchUrl: null,
    ...overrides,
  };
}
