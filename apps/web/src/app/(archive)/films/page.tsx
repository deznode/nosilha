import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { FilmsCinema } from "@/components/films/cinema/films-cinema";
import { getGalleryMedia, getTownStatusSummary } from "@/lib/api";
import { FILMS_FETCH_SIZE, canPlay, pickFeatured, toFilms } from "@/lib/films";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Films",
  description:
    "Films of Brava Island contributed to the archive, played in place.",
  path: "/films",
  keywords: [
    "Brava Island films",
    "Cape Verde video archive",
    "Brava Island video",
    "Cape Verdean films",
  ],
});

/** Spec 038 FR-030 to FR-032. */
export default async function FilmsPage() {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");
  cacheTag("towns");

  // No `catch` on the films: a swallowed failure would be cached as "None in the
  // archive yet" for an hour. The settlements only name places, so they may fail.
  const [page, settlements] = await Promise.all([
    getGalleryMedia({ mediaType: "VIDEO", size: FILMS_FETCH_SIZE }),
    getTownStatusSummary().catch(() => []),
  ]);
  const films = toFilms(page.items, settlements);

  // The hero plays on arrival, so it must be a film that can; with none, no hero.
  const featured = pickFeatured(films.filter(canPlay)) ?? pickFeatured(films);

  return <FilmsCinema films={films} featured={featured} />;
}
