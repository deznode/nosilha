import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { StayContent } from "@/components/stay/stay-content";
import { getEntriesByCategory, getTownStatusSummary } from "@/lib/api";
import { generatePageMetadata } from "@/lib/metadata";
import { townSlugsById } from "@/lib/place-path";

const STAY_PAGE_SIZE = 100;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.stay");
  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/stay",
    locale: await getLocale(),
    keywords: [
      "Brava Island accommodation",
      "Cape Verde guesthouse",
      "where to stay Brava",
      "pensão Brava",
    ],
  });
}

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

  return <StayContent stays={stays.items} townSlugs={townSlugsById(towns)} />;
}
