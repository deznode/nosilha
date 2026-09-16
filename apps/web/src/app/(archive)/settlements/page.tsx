import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { SettlementsContent } from "@/components/settlements/settlements-content";
import { parseSettlementFilter } from "@/components/settlements/settlements-copy";
import { ArchiveSkeleton } from "@/components/ui/archive-skeleton";
import { getTownStatusSummary } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Settlements",
  description:
    "Every settlement named on Brava Island, and how much of each one the archive actually holds.",
  path: "/settlements",
  keywords: [
    "Brava Island settlements",
    "Cape Verde villages",
    "Nova Sintra",
    "Fajã d'Água",
    "Brava towns",
  ],
  baseUrl: siteConfig.url,
  siteName: siteConfig.name,
  defaultImage: siteConfig.ogImage,
});

interface SettlementsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

/**
 * The `searchParams` read happens below a boundary, so everything above it — the
 * chrome, the footer — still prerenders as a static shell.
 */
export default function SettlementsPage({
  searchParams,
}: SettlementsPageProps) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <SettlementsForFilter searchParams={searchParams} />
    </Suspense>
  );
}

async function SettlementsForFilter({ searchParams }: SettlementsPageProps) {
  const { filter } = await searchParams;
  return cachedSettlements(filter);
}

/**
 * The list is the same for everyone; only the chosen chip differs, and that is a
 * primitive, so it can safely key the cache.
 */
async function cachedSettlements(filter: string | undefined) {
  "use cache";
  cacheLife("content");
  cacheTag("towns");

  const towns = await getTownStatusSummary();

  return (
    <SettlementsContent
      towns={towns}
      initialFilter={parseSettlementFilter(filter)}
    />
  );
}
