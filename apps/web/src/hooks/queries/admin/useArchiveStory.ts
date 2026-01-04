/**
 * TanStack Query mutation hook for archiving stories to MDX.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { archiveStoryToMDX } from "@/app/actions/archive-story";

interface ArchiveStoryParams {
  storyId: string;
  mdxContent: string;
  slug: string;
  title: string;
}

interface ArchiveStoryResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

/**
 * Mutation hook for archiving stories to MDX in GitHub repository.
 *
 * Invalidates all stories queries and stats on success to ensure
 * the UI reflects the archived state.
 *
 * @example
 * ```tsx
 * const archiveStory = useArchiveStory();
 *
 * const handleArchive = async () => {
 *   await archiveStory.mutateAsync({
 *     storyId: "story-123",
 *     mdxContent: "...",
 *     slug: "my-story",
 *     title: "My Story"
 *   });
 * };
 * ```
 */
export function useArchiveStory() {
  const queryClient = useQueryClient();

  return useMutation<ArchiveStoryResult, Error, ArchiveStoryParams>({
    mutationFn: async ({ storyId, mdxContent, slug, title }) => {
      const result = await archiveStoryToMDX(storyId, mdxContent, slug, title);

      if (!result.success) {
        throw new Error(result.error || "Failed to archive story");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate ALL stories queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.stories.all() });

      // Also refresh stats since archived stories affect counts
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
    onError: (error) => {
      console.error("Archive story mutation failed:", error);
    },
  });
}
