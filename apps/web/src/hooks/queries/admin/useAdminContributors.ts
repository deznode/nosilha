/**
 * TanStack Query hook for fetching top contributors.
 * Provides automatic caching, refetching, and loading states.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getTopContributors } from "@/lib/api";
import { contributorSchema } from "@/schemas/adminSchemas";
import { z } from "zod";
import type { Contributor } from "@/types/admin";

const contributorsArraySchema = z.array(contributorSchema);

/**
 * Hook for fetching top contributors.
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminContributors(
  options?: Omit<UseQueryOptions<Contributor[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Contributor[], Error>({
    queryKey: adminKeys.contributors(),
    queryFn: async () => {
      const result = await getTopContributors();

      // Runtime validation with Zod (safeParse - doesn't throw)
      const validated = contributorsArraySchema.safeParse(result);
      if (!validated.success) {
        console.error(
          "Admin contributors validation failed:",
          validated.error.format()
        );
        return result; // Return unvalidated if validation fails
      }
      return validated.data as Contributor[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (contributors change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}
