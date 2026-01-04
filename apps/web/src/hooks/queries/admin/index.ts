/**
 * Admin Query Hooks Barrel Export
 *
 * TanStack Query hooks for admin dashboard data fetching.
 * Each hook manages its own loading/error state independently.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

// Query key factory
export { adminKeys } from "./keys";

// Query hooks
export { useAdminStats } from "./useAdminStats";
export { useAdminSuggestions } from "./useAdminSuggestions";
export { useAdminStories } from "./useAdminStories";
export { useAdminMessages } from "./useAdminMessages";
export { useAdminDirectorySubmissions } from "./useAdminDirectorySubmissions";
export { useAdminMedia } from "./useAdminMedia";
export { useAdminContributors } from "./useAdminContributors";
export { useSystemHealth } from "./useSystemHealth";
export type { SystemStatus, SystemHealthResponse } from "./useSystemHealth";

// Mutation hooks
export { useUpdateSuggestionStatus } from "./useUpdateSuggestionStatus";
export { useUpdateStoryStatus } from "./useUpdateStoryStatus";
export {
  useUpdateMessageStatus,
  useDeleteMessage,
} from "./useUpdateMessageStatus";
export { useUpdateDirectoryStatus } from "./useUpdateDirectoryStatus";
export { useUpdateMediaStatus } from "./useUpdateMediaStatus";
export { useArchiveStory } from "./useArchiveStory";
