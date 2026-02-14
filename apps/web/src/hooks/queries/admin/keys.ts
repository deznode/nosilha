/**
 * Admin Query Keys Factory
 *
 * Centralized query keys for admin domain with status filtering.
 * Supports hierarchical keys for partial cache invalidation.
 *
 * @see docs/STATE_MANAGEMENT.md for query key conventions
 */

import type { QueryClient } from "@tanstack/react-query";
import type { SubmissionStatus } from "@/types/story";
import type { ContactMessageStatus, MediaStatus } from "@/types/admin";
import type { GalleryMediaStatus } from "@/types/gallery";
import type { AiModerationStatus } from "@/types/ai";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,

  // Hierarchical keys supporting partial invalidation
  suggestions: {
    all: () => [...adminKeys.all, "suggestions"] as const,
    list: (page: number, size: number, status?: SubmissionStatus | "ALL") =>
      [...adminKeys.all, "suggestions", { page, size, status }] as const,
  },
  stories: {
    all: () => [...adminKeys.all, "stories"] as const,
    list: (page: number, size: number, status?: SubmissionStatus | "ALL") =>
      [...adminKeys.all, "stories", { page, size, status }] as const,
  },
  messages: {
    all: () => [...adminKeys.all, "messages"] as const,
    list: (page: number, size: number, status?: ContactMessageStatus) =>
      [...adminKeys.all, "messages", { page, size, status }] as const,
  },
  directory: {
    // Note: Uses unified directory/entries endpoint (not legacy directory-submissions)
    all: () => [...adminKeys.all, "directory-entries"] as const,
    list: (page: number, size: number, status?: SubmissionStatus | "ALL") =>
      [...adminKeys.all, "directory-entries", { page, size, status }] as const,
  },
  media: {
    all: () => [...adminKeys.all, "media"] as const,
    list: (page: number, size: number, status?: MediaStatus | "ALL") =>
      [...adminKeys.all, "media", { page, size, status }] as const,
  },
  gallery: {
    all: () => [...adminKeys.all, "gallery"] as const,
    list: (page: number, size: number, status?: GalleryMediaStatus | "ALL") =>
      [...adminKeys.all, "gallery", { page, size, status }] as const,
    detail: (id: string) => [...adminKeys.all, "gallery", id] as const,
  },
  aiReview: {
    all: () => [...adminKeys.all, "ai-review"] as const,
    list: (page: number, size: number, status?: AiModerationStatus | "ALL") =>
      [...adminKeys.all, "ai-review", { page, size, status }] as const,
    detail: (runId: string) => [...adminKeys.all, "ai-review", runId] as const,
    status: (mediaIds: string[]) =>
      [
        ...adminKeys.all,
        "ai-review",
        "status",
        { mediaIds: [...mediaIds].sort() },
      ] as const,
  },
  r2: {
    all: () => [...adminKeys.all, "r2"] as const,
    objects: (prefix?: string, continuationToken?: string) =>
      [...adminKeys.all, "r2", "objects", { prefix, continuationToken }] as const,
    orphans: (prefix?: string, continuationToken?: string) =>
      [...adminKeys.all, "r2", "orphans", { prefix, continuationToken }] as const,
  },
  contributors: () => [...adminKeys.all, "contributors"] as const,
  system: {
    all: () => [...adminKeys.all, "system"] as const,
    health: () => [...adminKeys.all, "system", "health"] as const,
  },
};

/**
 * Invalidates AI review, gallery, and system caches after an AI moderation
 * or trigger action. Shared by review action and trigger mutation hooks.
 */
export function invalidateAiCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adminKeys.aiReview.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.system.all() });
}
