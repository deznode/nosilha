/**
 * R2 Objects Query Hook
 *
 * TanStack Query hook for listing objects in the R2 bucket
 * with prefix filter and continuation token pagination.
 */

import { useQuery } from "@tanstack/react-query";
import { listR2Bucket } from "@/lib/api";
import { adminKeys } from "./keys";

interface UseR2ObjectsOptions {
  prefix?: string;
  continuationToken?: string;
  maxKeys?: number;
}

export function useR2Objects({
  prefix,
  continuationToken,
  maxKeys,
}: UseR2ObjectsOptions = {}) {
  return useQuery({
    queryKey: adminKeys.r2.objects(prefix, continuationToken),
    queryFn: () => listR2Bucket(prefix, continuationToken, maxKeys),
    staleTime: 30_000,
  });
}
