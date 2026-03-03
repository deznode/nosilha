/**
 * Admin AI Health Query Hook
 *
 * TanStack Query hook for fetching AI system health, provider stats,
 * and domain configs for the AI Dashboard.
 */

import { useQuery } from "@tanstack/react-query";
import { getAiHealth } from "@/lib/api";
import { adminKeys } from "./keys";

/**
 * Hook for fetching AI system health data.
 *
 * Returns provider health/usage and domain-level feature configs.
 * Refreshes automatically with 30s stale time and 60s polling.
 */
export function useAiHealth() {
  return useQuery({
    queryKey: adminKeys.aiDashboard.health(),
    queryFn: () => getAiHealth(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
