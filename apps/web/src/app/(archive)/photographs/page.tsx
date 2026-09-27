import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";

import { PhotographsImmersion } from "@/components/photographs/immersion/photographs-immersion";
import { ArchiveSkeleton } from "@/components/ui/archive-skeleton";
import { getGalleryMedia } from "@/lib/api";
import {
  featureOfDay,
  legacyPlaceParam,
  photographsHref,
} from "@/lib/archive-photographs";
import { FILMS_FETCH_SIZE, promotableFilms, toFilms } from "@/lib/films";
import { getArchivePhotographs } from "@/lib/get-archive-photographs";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Photographs",
  description:
    "Photographs of Brava Island from the archive, by the place they were taken near, and the films contributed alongside them.",
  path: "/photographs",
  keywords: [
    "Brava Island photographs",
    "Cape Verde archive photos",
    "historical photographs Brava",
    "Cape Verdean visual archive",
  ],
});

/** How many films the band under the photographs shows (FR-013). */
const FILMS_BAND_SIZE = 4;

interface PhotographsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The photographs index (1a). Spec 038 FR-010 to FR-013.
 *
 * The archive render is cached once per archive state; the place filter is applied
 * in the browser from `?place=`, over the whole dataset, so it never splits the
 * cache. Reading the search params here renders the page per request, so the grid
 * arrives in the HTML rather than after hydration.
 */
export default function PhotographsPage({
  searchParams,
}: PhotographsPageProps) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <PhotographsForRequest searchParams={searchParams} />
    </Suspense>
  );
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

async function PhotographsForRequest({ searchParams }: PhotographsPageProps) {
  const params = await searchParams;
  // A spec 034 link (`?filter=`, `?region=`) lands on its nearest place filter.
  if (!first(params.place)) {
    const legacy = legacyPlaceParam({
      filter: first(params.filter),
      region: first(params.region),
    });
    if (legacy !== null) redirect(photographsHref(legacy));
  }
  return <CachedPhotographs />;
}

async function CachedPhotographs() {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");
  cacheTag("towns");

  // No `catch` here: a swallowed failure would be cached as an empty archive for an
  // hour, and "nothing recorded" is a claim, not a degraded state.
  const [{ photos, settlements }, filmPage] = await Promise.all([
    getArchivePhotographs(),
    getGalleryMedia({ mediaType: "VIDEO", size: FILMS_FETCH_SIZE }),
  ]);

  // Chosen here, inside the cache, so every reader sees the same photograph today.
  const feature = featureOfDay(photos, new Date());
  const films = promotableFilms(toFilms(filmPage.items, settlements)).slice(
    0,
    FILMS_BAND_SIZE
  );

  return (
    <PhotographsImmersion
      photos={photos}
      featureId={feature?.id ?? null}
      films={films}
    />
  );
}
