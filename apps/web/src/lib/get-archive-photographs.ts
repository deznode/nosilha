import { cacheLife, cacheTag } from "next/cache";
import { getFormatter, getTranslations } from "next-intl/server";

import { getGalleryMedia, getTownStatusSummary } from "@/lib/api";
import { toArchivePhotos, type ArchivePhoto } from "@/lib/archive-photographs";
import type { PublicGalleryMedia } from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

/**
 * Every archive photograph, with its nearest settlement. Pages the list (100 a page,
 * at most ten pages) so the dataset is whole, not the first page of it.
 *
 * Cached on its own, so the index, every photograph and every film page share one
 * computed dataset. No `catch`: a swallowed failure would be cached as an empty
 * archive.
 *
 * Each photograph carries its dates already written out (`monthYear`, `dateLabel`),
 * and its alt text where the record has none, so the locale (read by the request
 * config from the root param) joins the cache key: one list per language. Producing
 * those labels at render instead would mean handing a formatter to every consumer
 * of the list, including the client photo viewer and the share copy, for an archive
 * small enough that caching it twice costs nothing.
 */
export async function getArchivePhotographs(): Promise<{
  photos: ArchivePhoto[];
  settlements: TownStatusSummary[];
}> {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");
  cacheTag("towns");

  const [format, t] = await Promise.all([
    getFormatter(),
    getTranslations("photographs"),
  ]);
  const settlementsPromise = getTownStatusSummary();
  // A failed page leaves this scope before the settlements are awaited, so give the
  // rejection a handler now rather than letting it surface as unhandled.
  settlementsPromise.catch(() => undefined);
  const fetchPage = (page: number) =>
    getGalleryMedia({ mediaType: "IMAGE", size: PAGE_SIZE, page });

  // The first page says how many there are; the rest are fetched together.
  const first = await fetchPage(0);
  const pageCount = Math.min(first.totalPages, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, i) =>
      fetchPage(i + 1)
    )
  );
  const media: PublicGalleryMedia[] = [first, ...rest].flatMap(
    (result) => result.items
  );
  const settlements = await settlementsPromise;
  return {
    photos: toArchivePhotos(media, settlements, format, t),
    settlements,
  };
}
