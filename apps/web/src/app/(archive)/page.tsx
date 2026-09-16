import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { ArchiveHome } from "@/components/archive-home/archive-home";
import {
  pickHero,
  pickPhotographRow,
} from "@/components/archive-home/archive-home-copy";
import {
  getEntriesByCategory,
  getFeaturedPhoto,
  getGalleryFacets,
  getGalleryMedia,
  getTownStatusSummary,
} from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { PlaceSchema } from "@/types/metadata";

/** Enough records to find four showable photographs after the exclusions. */
const ROW_POOL_SIZE = 12;

export const metadata: Metadata = generatePageMetadata({
  title: "An archive of Brava, built from what people send us",
  description:
    "A community archive of Brava Island, Cape Verde: settlements, place records and photographs, with every gap stated rather than hidden.",
  path: "/",
  keywords: [
    "Brava Island cultural heritage",
    "Cape Verdean culture",
    "heritage preservation",
    "Cape Verdean diaspora",
    "island cultural hub",
    "cultural heritage platform",
    "Brava Island traditions",
    "Cape Verde heritage",
    "Atlantic islands culture",
    "Morna music",
    "Kriolu language",
    "Nova Sintra",
    "Fajã d'Agua",
    "Eugénio Tavares",
    "Brava tourism",
    "interactive heritage map",
  ],
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "Place",
      additionalType: "https://schema.org/LandmarksOrHistoricalBuildings",
      name: "Brava Island, Cape Verde",
      description:
        "The flower island of Cape Verde, a cultural heritage hub preserving Cape Verdean traditions, known for its lush landscapes, rich cultural memory, and authentic heritage experiences.",
      image: [`${siteConfig.url}/images/hero.jpg`],
      address: {
        "@type": "PostalAddress",
        addressCountry: "CV",
        addressLocality: "Brava Island",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 14.8676,
        longitude: -24.7098,
      },
    } as PlaceSchema,
  ],
  baseUrl: siteConfig.url,
  siteName: siteConfig.name,
  defaultImage: siteConfig.ogImage,
});

export default async function HomePage() {
  "use cache";
  cacheLife("content");
  cacheTag("towns");
  cacheTag("gallery");
  cacheTag("directory");

  // Nothing here is wrapped in a `catch`, and that is the point. Every number on
  // this page is a claim about the archive, and a swallowed failure would not
  // degrade it — it would change "twenty-five settlements" into "no settlement" and
  // then `use cache` would hold that lie for an hour. An error the next request
  // retries is better than a confident wrong number nobody can see is wrong.
  const [towns, allEntries, facets, stays, featured, pool] = await Promise.all([
    getTownStatusSummary(),
    getEntriesByCategory("all", 0, 1),
    getGalleryFacets(),
    getEntriesByCategory("Hotel", 0, 100),
    getFeaturedPhoto(),
    getGalleryMedia({ mediaType: "IMAGE", size: ROW_POOL_SIZE }),
  ]);

  return (
    <ArchiveHome
      towns={towns}
      recordCount={
        allEntries.pagination?.totalElements ?? allEntries.items.length
      }
      facets={facets}
      stayCount={stays.pagination?.totalElements ?? stays.items.length}
      ratedStayCount={
        stays.items.filter((entry) => entry.rating != null).length
      }
      hero={pickHero(featured)}
      photographRow={pickPhotographRow(pool.items)}
    />
  );
}
