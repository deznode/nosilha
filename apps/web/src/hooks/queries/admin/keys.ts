/**
 * Admin Query Keys Factory
 *
 * Centralized query keys for admin domain with status filtering.
 * Supports hierarchical keys for partial cache invalidation.
 *
 * @see docs/STATE_MANAGEMENT.md for query key conventions
 */

import type { SubmissionStatus } from "@/types/story";
import type { ContactMessageStatus, MediaStatus } from "@/types/admin";

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
    all: () => [...adminKeys.all, "directory-submissions"] as const,
    list: (page: number, size: number, status?: SubmissionStatus | "ALL") =>
      [
        ...adminKeys.all,
        "directory-submissions",
        { page, size, status },
      ] as const,
  },
  media: {
    all: () => [...adminKeys.all, "media"] as const,
    list: (page: number, size: number, status?: MediaStatus | "ALL") =>
      [...adminKeys.all, "media", { page, size, status }] as const,
  },
  contributors: () => [...adminKeys.all, "contributors"] as const,
  system: {
    all: () => [...adminKeys.all, "system"] as const,
    health: () => [...adminKeys.all, "system", "health"] as const,
  },
};
