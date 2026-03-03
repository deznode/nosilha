/**
 * TanStack Query hook for fetching admin dashboard stats.
 * Provides automatic caching, refetching, and loading states.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getAdminStats } from "@/lib/api";
import { adminStatsSchema } from "@/schemas/adminSchemas";
import type { AdminStats } from "@/types/admin";

/**
 * Hook for fetching admin dashboard statistics.
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminStats(
  options?: Omit<UseQueryOptions<AdminStats, Error>, "queryKey" | "queryFn">
) {
  return useQuery<AdminStats, Error>({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const result = await getAdminStats();

      // Runtime validation with Zod (safeParse - doesn't throw)
      const validated = adminStatsSchema.safeParse(result);
      if (!validated.success) {
        console.error(
          "Admin stats validation failed:",
          validated.error.format()
        );
        return result; // Return unvalidated if validation fails
      }
      return validated.data as AdminStats;
    },
    staleTime: 60 * 1000, // 1 minute (admin data changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
