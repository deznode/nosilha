/**
 * YouTube Sync Admin Hooks
 *
 * TanStack Query hooks for fetching/updating YouTube sync config
 * and triggering sync operations.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getYouTubeSyncConfig,
  updateYouTubeSyncConfig,
  triggerYouTubeSync,
  getYouTubeSyncPlaylists,
  saveYouTubeSyncPlaylist,
  updateYouTubeSyncPlaylist,
  deleteYouTubeSyncPlaylist,
  syncSavedYouTubePlaylist,
} from "@/lib/api";
import { adminKeys } from "./keys";
import type {
  YouTubeSyncConfig,
  UpdateYouTubeSyncConfigRequest,
  YouTubeSyncRequest,
  YouTubeSyncResult,
  YouTubeSyncPlaylist,
  SaveYouTubeSyncPlaylistRequest,
} from "@/types/youtube";

export function useYouTubeSyncConfig() {
  return useQuery({
    queryKey: adminKeys.youtubeSync.config(),
    queryFn: getYouTubeSyncConfig,
    staleTime: 30_000,
  });
}

/**
 * Updates YouTube sync config with optimistic update and rollback on error.
 */
export function useUpdateYouTubeSyncConfig() {
  const queryClient = useQueryClient();
  const configKey = adminKeys.youtubeSync.config();

  return useMutation<
    YouTubeSyncConfig,
    Error,
    UpdateYouTubeSyncConfigRequest,
    { prev: YouTubeSyncConfig | undefined }
  >({
    mutationFn: updateYouTubeSyncConfig,
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: configKey });
      const prev = queryClient.getQueryData<YouTubeSyncConfig>(configKey);
      queryClient.setQueryData<YouTubeSyncConfig>(configKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          enabled: request.enabled,
          defaultCategory: request.defaultCategory,
        };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData<YouTubeSyncConfig>(configKey, context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKey });
    },
  });
}

export function useTriggerYouTubeSync() {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResult, Error, YouTubeSyncRequest | undefined>({
    mutationFn: triggerYouTubeSync,
    onSettled: () => {
      invalidateSyncCaches(queryClient);
    },
  });
}

// --- Saved Playlists ---

export function useYouTubeSyncPlaylists() {
  return useQuery({
    queryKey: adminKeys.youtubeSync.playlists(),
    queryFn: getYouTubeSyncPlaylists,
    staleTime: 30_000,
  });
}

export function useSaveYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<
    YouTubeSyncPlaylist,
    Error,
    SaveYouTubeSyncPlaylistRequest
  >({
    mutationFn: saveYouTubeSyncPlaylist,
    onSettled: () => {
      invalidatePlaylistCache(queryClient);
    },
  });
}

export function useUpdateYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<
    YouTubeSyncPlaylist,
    Error,
    { id: string; request: SaveYouTubeSyncPlaylistRequest }
  >({
    mutationFn: ({ id, request }) => updateYouTubeSyncPlaylist(id, request),
    onSettled: () => {
      invalidatePlaylistCache(queryClient);
    },
  });
}

export function useDeleteYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteYouTubeSyncPlaylist,
    onSettled: () => {
      invalidatePlaylistCache(queryClient);
    },
  });
}

export function useSyncSavedPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResult, Error, string>({
    mutationFn: syncSavedYouTubePlaylist,
    onSettled: () => {
      invalidateSyncCaches(queryClient);
    },
  });
}

// --- Shared Invalidation Helpers ---

function invalidatePlaylistCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: adminKeys.youtubeSync.playlists(),
  });
}

function invalidateSyncCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: adminKeys.youtubeSync.all(),
  });
  queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
}
