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
 * No `catch`: the caller caches the result, and a swallowed failure would be cached
 * as an empty archive.
 */
export async function getArchivePhotographs(): Promise<{
  photos: ArchivePhoto[];
  settlements: TownStatusSummary[];
}> {
  const settlementsPromise = getTownStatusSummary();
  const media: PublicGalleryMedia[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await getGalleryMedia({
      mediaType: "IMAGE",
      size: PAGE_SIZE,
      page,
    });
    media.push(...result.items);
    if (page + 1 >= result.totalPages || result.items.length === 0) break;
  }
  const settlements = await settlementsPromise;
  return {
    photos: toArchivePhotos(media, settlements),
    settlements,
  };
}
