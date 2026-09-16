import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { PhotographsContent } from "@/components/photographs/photographs-content";
import {
  onlyFilms,
  parsePhotographFilter,
  resolveRegion,
} from "@/components/photographs/photographs-copy";
import {
  PHOTOGRAPHS_PAGE_SIZE,
  photographsQueryFn,
  photographsQueryKey,
} from "@/hooks/queries/usePhotographsQuery";
import { ArchiveSkeleton } from "@/components/ui/archive-skeleton";
import {
  getGalleryFacets,
  getGalleryMedia,
  getTownStatusSummary,
} from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = generatePageMetadata({
  title: "Photographs",
  description:
    "Every photograph and film in the Brava Island archive, with what each record is still missing.",
  path: "/photographs",
  keywords: [
    "Brava Island photographs",
    "Cape Verde archive photos",
    "historical photographs Brava",
    "Cape Verdean visual archive",
  ],
  baseUrl: siteConfig.url,
  siteName: siteConfig.name,
  defaultImage: siteConfig.ogImage,
});

interface PhotographsPageProps {
  searchParams: Promise<{ filter?: string; region?: string }>;
}

export default function PhotographsPage({
  searchParams,
}: PhotographsPageProps) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <PhotographsForFilter searchParams={searchParams} />
    </Suspense>
  );
}

async function PhotographsForFilter({ searchParams }: PhotographsPageProps) {
  const { filter, region } = await searchParams;
  return cachedPhotographs(filter, region);
}

async function cachedPhotographs(
  filterParam: string | undefined,
  regionParam: string | undefined
) {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");
  cacheTag("towns");

  const filter = parsePhotographFilter(filterParam);

  // No `catch` here: a swallowed failure would be cached as an empty archive for an
  // hour, and "nothing recorded" is a claim, not a degraded state.
  const [facets, towns, unlocated, films] = await Promise.all([
    getGalleryFacets(),
    getTownStatusSummary(),
    // The tray lists every unlocated record, not the page the grid happens to show.
    getGalleryMedia({ hasPlace: false, size: PHOTOGRAPHS_PAGE_SIZE }),
    getGalleryMedia({ mediaType: "VIDEO", size: PHOTOGRAPHS_PAGE_SIZE }),
  ]);

  const region = resolveRegion(regionParam, towns);

  // Seeds the client cache for the exact key the grid will ask for, so the first
  // paint is the real list rather than a spinner.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: photographsQueryKey(filter, region),
    queryFn: photographsQueryFn(filter, region),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PhotographsContent
        facets={facets}
        towns={towns}
        unlocated={unlocated.items}
        films={onlyFilms(films.items)}
        initialFilter={filter}
        initialRegion={region?.slug}
      />
    </HydrationBoundary>
  );
}
