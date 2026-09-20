import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { SettlementDetail } from "@/components/settlements/settlement-detail/settlement-detail";
import { getEntries, getTownBySlug, getTownStatusSummary } from "@/lib/api";
import { generatePageMetadata } from "@/lib/metadata";
import { isReservedSlug } from "@/lib/reserved-slugs";

/**
 * A settlement that may not exist cannot have a useful static shell, and streaming one
 * commits HTTP 200 before `notFound()` runs — so an unknown slug would answer 200 with
 * a 404 page inside it, and a crawler would index it. Blocking here keeps the status
 * honest, which FR-008 and FR-015 require. `/settlements` and `/photographs` keep their
 * shells: their params only choose a filter, and no value of one is a missing page.
 */
export const instant = false;

/** A settlement holding more records than this would be a different archive. */
const ENTRY_PAGE_SIZE = 100;

interface SettlementPageProps {
  params: Promise<{ town: string }>;
}

export async function generateMetadata({
  params,
}: SettlementPageProps): Promise<Metadata> {
  const { town: slug } = await params;
  if (isReservedSlug(slug)) return {};

  const town = await getTownBySlug(slug).catch(() => undefined);
  if (!town) return {};

  return generatePageMetadata({
    title: town.name,
    description:
      town.description?.trim() ||
      `What the archive holds about ${town.name}, a settlement on Brava Island, Cape Verde.`,
    path: `/${town.slug}`,
    keywords: [town.name, "Brava Island", "Cape Verde", "settlement"],
  });
}

export default async function SettlementPage({ params }: SettlementPageProps) {
  const { town: slug } = await params;

  // `/[town]` competes with every static first segment in the app. A reserved slug
  // reaching here means the static route is gone, not that a settlement is named
  // "about" — either way this page has nothing to show.
  if (isReservedSlug(slug)) notFound();

  return cachedSettlement(slug);
}

async function cachedSettlement(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("towns");
  cacheTag("directory");

  const [town, summaries] = await Promise.all([
    getTownBySlug(slug),
    getTownStatusSummary(),
  ]);

  const summary = summaries.find((item) => item.slug === slug);
  if (!town || !summary) notFound();

  // The settlement's own id is the canonical filter; the free-text `town` column is
  // what the redesign is replacing.
  // Not caught: "Recorded here" vanishing would read as an empty settlement.
  const entries = summary.id
    ? await getEntries({ townId: summary.id, size: ENTRY_PAGE_SIZE })
    : null;

  return (
    <SettlementDetail
      town={town}
      summary={summary}
      entries={entries?.items ?? []}
    />
  );
}
