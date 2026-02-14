/**
 * R2 Orphans Query Hook
 *
 * TanStack Query hook for detecting orphan R2 objects
 * that have no corresponding database record.
 * Starts disabled — only runs when manually triggered via refetch.
 */

import { useQuery } from "@tanstack/react-query";
import { detectR2Orphans } from "@/lib/api";
import { adminKeys } from "./keys";

interface UseR2OrphansOptions {
  prefix?: string;
  continuationToken?: string;
  maxKeys?: number;
  enabled?: boolean;
}

export function useR2Orphans({
  prefix,
  continuationToken,
  maxKeys,
  enabled = false,
}: UseR2OrphansOptions = {}) {
  return useQuery({
    queryKey: adminKeys.r2.orphans(prefix, continuationToken),
    queryFn: () => detectR2Orphans(prefix, continuationToken, maxKeys),
    enabled,
    staleTime: 60_000,
  });
}
