/**
 * YouTube Sync Admin Hooks
 *
 * TanStack Query hooks for fetching/updating YouTube sync config
 * and triggering sync operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

/**
 * Fetches YouTube sync configuration.
 */
export function useYouTubeSyncConfig() {
  return useQuery({
    queryKey: adminKeys.youtubeSync.config(),
    queryFn: () => getYouTubeSyncConfig(),
    staleTime: 30_000,
  });
}

/**
 * Mutation to update YouTube sync config with optimistic update.
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
    mutationFn: (request) => updateYouTubeSyncConfig(request),
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

/**
 * Mutation to trigger a YouTube sync operation.
 */
export function useTriggerYouTubeSync() {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResult, Error, YouTubeSyncRequest | undefined>({
    mutationFn: (request) => triggerYouTubeSync(request),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.youtubeSync.all(),
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
    },
  });
}

// --- Saved Playlists ---

/**
 * Fetches saved YouTube playlists.
 */
export function useYouTubeSyncPlaylists() {
  return useQuery({
    queryKey: adminKeys.youtubeSync.playlists(),
    queryFn: () => getYouTubeSyncPlaylists(),
    staleTime: 30_000,
  });
}

/**
 * Mutation to save a new YouTube playlist.
 */
export function useSaveYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<
    YouTubeSyncPlaylist,
    Error,
    SaveYouTubeSyncPlaylistRequest
  >({
    mutationFn: (request) => saveYouTubeSyncPlaylist(request),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.youtubeSync.playlists(),
      });
    },
  });
}

/**
 * Mutation to update a saved YouTube playlist.
 */
export function useUpdateYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<
    YouTubeSyncPlaylist,
    Error,
    { id: string; request: SaveYouTubeSyncPlaylistRequest }
  >({
    mutationFn: ({ id, request }) => updateYouTubeSyncPlaylist(id, request),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.youtubeSync.playlists(),
      });
    },
  });
}

/**
 * Mutation to delete a saved YouTube playlist.
 */
export function useDeleteYouTubeSyncPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteYouTubeSyncPlaylist(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.youtubeSync.playlists(),
      });
    },
  });
}

/**
 * Mutation to sync a saved playlist.
 */
export function useSyncSavedPlaylist() {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResult, Error, string>({
    mutationFn: (id) => syncSavedYouTubePlaylist(id),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.youtubeSync.all(),
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
    },
  });
}
