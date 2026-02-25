import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGalleryMediaById } from "@/lib/api";
import {
  isPublicUserUploadMedia,
  isPublicExternalMedia,
} from "@/types/gallery";
import { resolveExternalThumbnail } from "@/lib/gallery-mappers";
import { adminKeys } from "./keys";

/**
 * Hook for fetching gallery media by ID and resolving the image URL.
 *
 * Only fetches when mediaId is provided (enabled guard).
 *
 * @param mediaId Gallery media ID (null/undefined disables the query)
 * @returns TanStack Query result with resolved imageUrl
 */
export function useGalleryMediaById(mediaId: string | null | undefined) {
  const query = useQuery({
    queryKey: adminKeys.gallery.detail(mediaId!),
    queryFn: () => getGalleryMediaById(mediaId!),
    enabled: !!mediaId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const imageUrl = useMemo((): string | null => {
    if (!query.data) return null;
    if (isPublicUserUploadMedia(query.data)) return query.data.publicUrl;
    if (isPublicExternalMedia(query.data)) {
      return resolveExternalThumbnail(
        query.data.thumbnailUrl,
        query.data.platform,
        query.data.externalId
      );
    }
    return null;
  }, [query.data]);

  return { ...query, imageUrl };
}
