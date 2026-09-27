import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { FilmTheatre } from "@/components/films/theatre/film-theatre";
import {
  getGalleryMedia,
  getGalleryMediaById,
  getTownStatusSummary,
} from "@/lib/api";
import { FILMS_FETCH_SIZE, toFilm, toFilms } from "@/lib/films";
import { isMediaId } from "@/lib/gallery-mappers";
import { getArchivePhotographs } from "@/lib/get-archive-photographs";
import { generatePageMetadata } from "@/lib/metadata";
import { excerpt } from "@/lib/text";

/**
 * Blocking rather than streaming a shell, so an unknown id answers 404 rather than 200
 * with a 404 page inside it.
 */
export const instant = false;

interface FilmRouteProps {
  params: Promise<{ id: string }>;
}

/** Gallery ids are UUIDs; anything else is not a film and should not reach the API. */
function getFilmMedia(id: string) {
  return isMediaId(id) ? getGalleryMediaById(id) : Promise.resolve(null);
}

export async function generateMetadata({
  params,
}: FilmRouteProps): Promise<Metadata> {
  const { id } = await params;
  const media = await getFilmMedia(id).catch(() => null);
  const film = media ? toFilm(media) : null;
  if (!film) return {};

  return generatePageMetadata({
    title: film.displayTitle,
    description: film.description
      ? excerpt(film.description)
      : "A film of Brava Island from the archive, played in place.",
    path: `/films/${film.id}`,
    keywords: ["Brava Island", "Cape Verde", "archive film"],
  });
}

/**
 * `?play=1` is read by the player from the live URL, not here, so it stays out of the
 * cache key and a page Next re-shows (Activity) still starts when asked to.
 */
export default async function FilmRoute({ params }: FilmRouteProps) {
  const { id } = await params;
  return cachedFilm(id);
}

/** Spec 038 FR-040 to FR-043. */
async function cachedFilm(id: string) {
  "use cache";
  cacheLife("entry");
  cacheTag("gallery");
  cacheTag("towns");

  // Every request starts together, but the 404 is settled on the film alone.
  //
  // The settlements name the film's place, and a record that has one must not be
  // cached as missing it ("Not yet recorded: where it was filmed"), so they are not
  // caught: a failure is an error the next request retries. The film list is optional:
  // a failed request leaves Up next out rather than claiming there are no other films.
  // The photograph dataset only decides the optional "Photographs from here" link.
  const mediaPromise = getFilmMedia(id);
  const settlementsPromise = getTownStatusSummary();
  const othersPromise = getGalleryMedia({
    mediaType: "VIDEO",
    size: FILMS_FETCH_SIZE,
  })
    .then((list) => list.items)
    .catch(() => null);
  const archivePromise = getArchivePhotographs().catch(() => null);
  // `notFound()` leaves this scope before the settlements are awaited, so give the
  // rejection a handler now rather than letting it surface as unhandled.
  settlementsPromise.catch(() => undefined);

  const media = await mediaPromise;
  if (!media || !toFilm(media)) notFound();

  const [settlements, others, archive] = await Promise.all([
    settlementsPromise,
    othersPromise,
    archivePromise,
  ]);
  const film = toFilm(media, settlements);
  if (!film) notFound();

  const films = others === null ? null : toFilms(others, settlements);
  const hasPlacePhotos =
    !!film.place &&
    !!archive?.photos.some((p) => p.near?.slug === film.place?.slug);

  return (
    <FilmTheatre film={film} films={films} hasPlacePhotos={hasPlacePhotos} />
  );
}
