/**
 * R2 Admin Mutation Hooks
 *
 * TanStack Query mutation hooks for R2 admin operations:
 * bulk presign, bulk confirm, link orphan, delete orphan.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkPresignR2,
  bulkConfirmR2,
  linkR2Orphan,
  deleteR2Orphan,
} from "@/lib/api";
import { adminKeys } from "./keys";
import type {
  BulkPresignRequest,
  BulkConfirmRequest,
  LinkOrphanRequest,
  DeleteOrphanRequest,
} from "@/types/r2-admin";

/**
 * Hook for generating presigned upload URLs for a batch of files.
 */
export function useBulkPresignR2() {
  return useMutation({
    mutationFn: (request: BulkPresignRequest) => bulkPresignR2(request),
  });
}

/**
 * Hook for confirming batch uploads — creates ACTIVE media records.
 * Invalidates R2 objects and gallery caches on success.
 */
export function useBulkConfirmR2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkConfirmRequest) => bulkConfirmR2(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.r2.all() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
    },
  });
}

/**
 * Hook for linking an orphan R2 object to a new DB media record.
 * Invalidates R2 orphans and gallery caches on success.
 */
export function useLinkR2Orphan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LinkOrphanRequest) => linkR2Orphan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.r2.orphans() });
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
    },
  });
}

/**
 * Hook for deleting an orphan R2 object.
 * Invalidates R2 orphans cache on success.
 */
export function useDeleteR2Orphan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteOrphanRequest) => deleteR2Orphan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.r2.orphans() });
    },
  });
}
