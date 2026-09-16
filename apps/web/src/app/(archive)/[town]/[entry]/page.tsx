import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { PlaceRecord } from "@/components/place-record/place-record";
import {
  getEntries,
  getEntryBySlug,
  getMediaByEntry,
  getTownStatusSummary,
} from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { isReservedSlug } from "@/lib/reserved-slugs";

/**
 * Blocking rather than streaming a shell: a record under the wrong settlement, or one
 * that does not exist, must answer 404 rather than 200 with a 404 page inside it.
 * FR-013's last criterion is a status code, not a rendering.
 */
export const instant = false;

const SIBLING_PAGE_SIZE = 100;

interface PlacePageProps {
  params: Promise<{ town: string; entry: string }>;
}

export async function generateMetadata({
  params,
}: PlacePageProps): Promise<Metadata> {
  const { town: townSlug, entry: slug } = await params;
  if (isReservedSlug(townSlug)) return {};

  const entry = await getEntryBySlug(slug).catch(() => undefined);
  if (!entry) return {};

  // The same ownership test the page applies. Without it a record served under the
  // wrong settlement would still emit its title and its OG image, so a URL that 404s
  // would be indexed under the record's own name.
  const summaries = await getTownStatusSummary().catch(() => []);
  const town = summaries.find((item) => item.slug === townSlug);
  if (!town || !belongsTo(entry, town)) return {};

  return generatePageMetadata({
    title: entry.name,
    description:
      entry.description?.trim() ||
      `What the archive holds about ${entry.name} on Brava Island, Cape Verde.`,
    path: `/${town.slug}/${entry.slug}`,
    keywords: [entry.name, entry.category, "Brava Island", "Cape Verde"],
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { town, entry } = await params;
  if (isReservedSlug(town)) notFound();

  return cachedPlaceRecord(town, entry);
}

async function cachedPlaceRecord(townSlug: string, entrySlug: string) {
  "use cache";
  cacheLife("entry");
  cacheTag("directory");
  cacheTag("gallery");

  const [entry, summaries] = await Promise.all([
    getEntryBySlug(entrySlug),
    getTownStatusSummary(),
  ]);
  if (!entry) notFound();

  const town = summaries.find((item) => item.slug === townSlug);
  if (!town) notFound();

  // One record has one settlement. Serving it under a second URL would split its
  // links and its search ranking between two addresses for the same thing.
  if (!belongsTo(entry, town)) notFound();

  // Not caught: a failed read here would print "None yet" over a record that has
  // photographs, which is the one thing this page must never say wrongly.
  const [photographs, townEntries] = await Promise.all([
    getMediaByEntry(entry.id),
    town.id
      ? getEntries({ townId: town.id, size: SIBLING_PAGE_SIZE })
      : Promise.resolve(null),
  ]);

  return (
    <PlaceRecord
      entry={entry}
      townSlug={townSlug}
      photographs={photographs}
      siblings={(townEntries?.items ?? []).filter(
        (item) => item.id !== entry.id
      )}
    />
  );
}

/**
 * Whether this record belongs to this settlement.
 *
 * `townId` is the canonical answer; the name comparison is the fallback for records
 * whose settlement has not resolved yet, and it fails closed — a differently spelled
 * name 404s rather than rendering at an address that is not the record's own.
 */
function belongsTo(
  entry: { townId?: string | null; town: string },
  town: { id: string | null; name: string }
): boolean {
  return entry.townId
    ? entry.townId === town.id
    : entry.town?.trim().toLowerCase() === town.name.trim().toLowerCase();
}
