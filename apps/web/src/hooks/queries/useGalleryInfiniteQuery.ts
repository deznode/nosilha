import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { getGalleryMedia } from "@/lib/api";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import type { MediaItem } from "@/types/media";

export const GALLERY_PAGE_SIZE = 24;

export interface GalleryPage {
  items: MediaItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GalleryFilters {
  category?: string;
  decade?: string;
  q?: string;
}

/** Builds the query key used for gallery infinite queries. */
export function galleryQueryKey(filters?: GalleryFilters) {
  return [
    "gallery",
    "infinite",
    GALLERY_PAGE_SIZE,
    filters?.category ?? null,
    filters?.decade ?? null,
    filters?.q ?? null,
  ] as const;
}

/** Shared getNextPageParam for both prefetch and client-side use. */
export function galleryGetNextPageParam(lastPage: GalleryPage) {
  if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
  return lastPage.currentPage + 1;
}

/** Shared queryFn factory for both prefetch and client-side use. */
export function galleryQueryFn(filters?: GalleryFilters) {
  return async ({ pageParam }: { pageParam: unknown }) => {
    const response = await getGalleryMedia({
      page: pageParam as number,
      size: GALLERY_PAGE_SIZE,
      category: filters?.category,
      decade: filters?.decade,
      q: filters?.q,
    });
    return {
      items: response.items.map(mapGalleryMediaToMediaItem),
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
    };
  };
}

interface UseGalleryInfiniteQueryOptions {
  filters?: GalleryFilters;
}

export function useGalleryInfiniteQuery({
  filters,
}: UseGalleryInfiniteQueryOptions = {}) {
  const query = useInfiniteQuery<GalleryPage>({
    queryKey: galleryQueryKey(filters),
    queryFn: galleryQueryFn(filters),
    initialPageParam: 0,
    getNextPageParam: galleryGetNextPageParam,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const allItems = query.data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = query.data?.pages[0]?.totalItems ?? 0;

  return {
    items: allItems,
    totalItems,
    isLoading: query.isLoading,
    isPlaceholderData: query.isPlaceholderData,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
  };
}
