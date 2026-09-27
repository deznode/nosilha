import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { FilmTheatre } from "@/components/films/theatre/film-theatre";
import { getGalleryMedia, getGalleryMediaById } from "@/lib/api";
import {
  FILMS_FETCH_SIZE,
  toFilm,
  toFilms,
  type FilmSettlement,
} from "@/lib/films";
import { getArchivePhotographs } from "@/lib/get-archive-photographs";
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
  searchParams: Promise<{ play?: string }>;
}

async function findFilm(
  id: string,
  settlements: readonly FilmSettlement[] = []
) {
  if (!UUID.test(id)) return null;
  const media = await getGalleryMediaById(id);
  return media ? toFilm(media, settlements) : null;
}

export async function generateMetadata({
  params,
}: FilmRouteProps): Promise<Metadata> {
  const { id } = await params;
  const film = await findFilm(id).catch(() => null);
  if (!film) return {};

  return generatePageMetadata({
    title: film.displayTitle,
    description:
      film.description ??
      "A film of Brava Island from the archive, played in place.",
    path: `/films/${film.id}`,
    keywords: ["Brava Island", "Cape Verde", "archive film"],
  });
}

export default async function FilmRoute({
  params,
  searchParams,
}: FilmRouteProps) {
  const [{ id }, { play }] = await Promise.all([params, searchParams]);
  return cachedFilm(id, play === "1");
}

/** Spec 038 FR-040 to FR-043. */
async function cachedFilm(id: string, autoStart: boolean) {
  "use cache";
  cacheLife("entry");
  cacheTag("gallery");
  cacheTag("towns");

  // The photograph dataset names the film's settlement and says whether it has
  // photographs. The 404 is settled on the film alone: Up next and "Photographs from
  // here" are optional, so a failed list request drops them instead of turning a film
  // that exists into a 500.
  const archivePromise = getArchivePhotographs().catch(() => null);
  const othersPromise = getGalleryMedia({
    mediaType: "VIDEO",
    size: FILMS_FETCH_SIZE,
  })
    .then((list) => list.items)
    .catch(() => []);

  const archive = await archivePromise;
  const settlements = archive?.settlements ?? [];
  const film = await findFilm(id, settlements);
  if (!film) notFound();

  const films = toFilms(await othersPromise, settlements);
  const all = films.some((f) => f.id === film.id) ? films : [film, ...films];
  const hasPlacePhotos =
    !!film.place &&
    !!archive?.photos.some((p) => p.near?.slug === film.place?.slug);

  return (
    <FilmTheatre
      film={film}
      films={all}
      hasPlacePhotos={hasPlacePhotos}
      autoStart={autoStart}
    />
  );
}
