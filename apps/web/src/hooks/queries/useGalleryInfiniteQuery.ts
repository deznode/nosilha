import { useInfiniteQuery } from "@tanstack/react-query";
import { getGalleryMedia } from "@/lib/api";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import type { MediaItem } from "@/types/media";

export const GALLERY_PAGE_SIZE = 24;

interface GalleryPage {
  items: MediaItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface UseGalleryInfiniteQueryOptions {
  initialData?: GalleryPage;
}

export function useGalleryInfiniteQuery({
  initialData,
}: UseGalleryInfiniteQueryOptions = {}) {
  const query = useInfiniteQuery<GalleryPage>({
    queryKey: ["gallery", "infinite", GALLERY_PAGE_SIZE],
    queryFn: async ({ pageParam }) => {
      const response = await getGalleryMedia({
        page: pageParam as number,
        size: GALLERY_PAGE_SIZE,
      });
      return {
        items: response.items.map(mapGalleryMediaToMediaItem),
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    },
    initialData: initialData
      ? { pages: [initialData], pageParams: [0] }
      : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const allItems = query.data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = query.data?.pages[0]?.totalItems ?? 0;

  return {
    items: allItems,
    totalItems,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
  };
}
