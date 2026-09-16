import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { StayContent } from "@/components/stay/stay-content";
import { getEntriesByCategory, getTownStatusSummary } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";

const STAY_PAGE_SIZE = 100;

export const metadata: Metadata = generatePageMetadata({
  title: "Stay",
  description:
    "Every recorded place to stay on Brava Island, Cape Verde — and what the archive still does not know about them.",
  path: "/stay",
  keywords: [
    "Brava Island accommodation",
    "Cape Verde guesthouse",
    "where to stay Brava",
    "pensão Brava",
  ],
  baseUrl: siteConfig.url,
  siteName: siteConfig.name,
  defaultImage: siteConfig.ogImage,
});

export default async function StayPage() {
  "use cache";
  cacheLife("content");
  cacheTag("directory");
  cacheTag("towns");

  // No `catch` here: a swallowed failure would be cached as an empty archive for an
  // hour, and "nothing recorded" is a claim, not a degraded state.
  const [stays, towns] = await Promise.all([
    getEntriesByCategory("Hotel", 0, STAY_PAGE_SIZE),
    getTownStatusSummary(),
  ]);

  const townSlugs = Object.fromEntries(
    towns.flatMap((town) => (town.id ? [[town.id, town.slug] as const] : []))
  );

  return <StayContent stays={stays.items} townSlugs={townSlugs} />;
}
