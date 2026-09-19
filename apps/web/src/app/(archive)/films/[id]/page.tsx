import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { FilmsScreen } from "@/components/films/film-chrome";
import { FilmPage } from "@/components/films/film-page";
import { getGalleryMedia, getGalleryMediaById } from "@/lib/api";
import { FILMS_FETCH_SIZE, filmMetaTitle, toFilm, toFilms } from "@/lib/films";
import { generatePageMetadata } from "@/lib/metadata";

/**
 * Blocking rather than streaming a shell, so an unknown id answers 404 rather than 200
 * with a 404 page inside it.
 */
export const instant = false;

/** Gallery ids are UUIDs; anything else is not a film and should not reach the API. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface FilmRouteProps {
  params: Promise<{ id: string }>;
}

async function findFilm(id: string) {
  if (!UUID.test(id)) return null;
  const media = await getGalleryMediaById(id);
  return media ? toFilm(media) : null;
}

export async function generateMetadata({
  params,
}: FilmRouteProps): Promise<Metadata> {
  const { id } = await params;
  const film = await findFilm(id).catch(() => null);
  if (!film) return {};

  return generatePageMetadata({
    title: filmMetaTitle(film),
    description:
      "A film in the Brava Island archive, played in place, with what its record is still missing.",
    path: `/films/${film.id}`,
    keywords: ["Brava Island", "Cape Verde", "archive film"],
  });
}

export default async function FilmRoute({ params }: FilmRouteProps) {
  const { id } = await params;
  return cachedFilm(id);
}

/** Spec 035 FR-005. */
async function cachedFilm(id: string) {
  "use cache";
  cacheLife("entry");
  cacheTag("gallery");

  // Both requests start together, but the 404 is settled on the film alone. "More
  // films" is optional, so a failed list request drops the section instead of
  // turning a film that exists into a 500.
  const filmPromise = findFilm(id);
  const othersPromise = getGalleryMedia({
    mediaType: "VIDEO",
    size: FILMS_FETCH_SIZE,
  })
    .then((list) => toFilms(list.items))
    .catch(() => []);

  const film = await filmPromise;
  if (!film) notFound();

  const others = (await othersPromise).filter((f) => f.id !== film.id);

  return (
    <FilmsScreen>
      <FilmPage film={film} others={others} />
    </FilmsScreen>
  );
}
