import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { FilmsScreen } from "@/components/films/film-chrome";
import { FilmsIndex } from "@/components/films/films-index";
import { getGalleryMedia } from "@/lib/api";
import { FILMS_FETCH_SIZE, toFilms } from "@/lib/films";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Films",
  description:
    "Every film in the Brava Island archive, played in place, with what each record is still missing.",
  path: "/films",
  keywords: [
    "Brava Island films",
    "Cape Verde video archive",
    "Brava Island video",
    "Cape Verdean films",
  ],
});

/** Spec 035 FR-002 – FR-004. */
export default async function FilmsPage() {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");

  // No `catch`: a swallowed failure would be cached as "No films in the archive yet"
  // for an hour, and that is a claim about the archive, not a degraded state.
  const page = await getGalleryMedia({
    mediaType: "VIDEO",
    size: FILMS_FETCH_SIZE,
  });

  return (
    <FilmsScreen>
      <FilmsIndex films={toFilms(page.items)} />
    </FilmsScreen>
  );
}
