import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useIsAuthenticated } from "@/stores/authStore";
import { getApiClient } from "@/lib/api-factory";
import type { ContributionsDto } from "@/types/profile";

/**
 * TanStack Query hook for fetching authenticated user's contributions.
 * Provides automatic caching, refetching, and loading states.
 *
 * **Authentication Required**: Only fetches when user is authenticated.
 *
 * Returns aggregated contribution data including:
 * - Reactions: Counts grouped by reaction type (LOVE, CELEBRATE, INSIGHTFUL, SUPPORT)
 * - Suggestions: List of content improvement suggestions with status
 * - Stories: List of submitted stories with moderation status
 *
 * @param options - Additional TanStack Query options
 * @returns Query result with contributions data, loading, and error states
 *
 * @example
 * ```tsx
 * const { contributions, isLoading, error, refetch } = useContributions();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!contributions) return <EmptyState />;
 *
 * return (
 *   <div>
 *     <h2>Total Reactions: {contributions.totalReactions}</h2>
 *     <h2>Total Suggestions: {contributions.totalSuggestions}</h2>
 *     <h2>Total Stories: {contributions.totalStories}</h2>
 *   </div>
 * );
 * ```
 */
export function useContributions(
  options?: Omit<
    UseQueryOptions<ContributionsDto, Error>,
    "queryKey" | "queryFn"
  >
) {
  const isAuthenticated = useIsAuthenticated();
  const apiClient = getApiClient();

  const query = useQuery<ContributionsDto, Error>({
    queryKey: ["user", "contributions"],
    queryFn: async () => {
      return apiClient.getContributions();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher than profile data
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated, // Only run query if user is authenticated
    ...options,
  });

  return {
    contributions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
