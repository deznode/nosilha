import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useYouTubeSyncConfig,
  useUpdateYouTubeSyncConfig,
  useTriggerYouTubeSync,
  useYouTubeSyncPlaylists,
  useSaveYouTubeSyncPlaylist,
  useDeleteYouTubeSyncPlaylist,
} from "@/hooks/queries/admin/useYouTubeSync";
import * as api from "@/lib/api";
import type { YouTubeSyncConfig, YouTubeSyncResult, YouTubeSyncPlaylist } from "@/types/youtube";

vi.mock("@/lib/api", () => ({
  getYouTubeSyncConfig: vi.fn(),
  updateYouTubeSyncConfig: vi.fn(),
  triggerYouTubeSync: vi.fn(),
  getYouTubeSyncPlaylists: vi.fn(),
  saveYouTubeSyncPlaylist: vi.fn(),
  updateYouTubeSyncPlaylist: vi.fn(),
  deleteYouTubeSyncPlaylist: vi.fn(),
  syncSavedYouTubePlaylist: vi.fn(),
}));

const mockConfig: YouTubeSyncConfig = {
  enabled: true,
  apiKeyConfigured: true,
  channelHandle: "@nosilha",
  defaultCategory: "Music",
  videoCount: 42,
};

const mockSyncResult: YouTubeSyncResult = {
  syncedCount: 5,
  skippedCount: 2,
  errorCount: 0,
  durationMs: 1250,
};

const mockPlaylist: YouTubeSyncPlaylist = {
  id: "playlist-1",
  playlistId: "PL1234567890",
  title: "Mornas de Brava",
  category: "Music",
  videoCount: 12,
  createdAt: "2026-03-01T12:00:00Z",
};

describe("useYouTubeSync Hooks", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it("fetches YouTube sync config successfully", async () => {
    vi.mocked(api.getYouTubeSyncConfig).mockResolvedValueOnce(mockConfig);

    const { result } = renderHook(() => useYouTubeSyncConfig(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockConfig);
    expect(api.getYouTubeSyncConfig).toHaveBeenCalledTimes(1);
  });

  it("updates YouTube sync config with optimistic updates", async () => {
    vi.mocked(api.updateYouTubeSyncConfig).mockResolvedValueOnce({
      ...mockConfig,
      enabled: false,
    });

    queryClient.setQueryData(["admin", "youtube-sync", "config"], mockConfig);

    const { result } = renderHook(() => useUpdateYouTubeSyncConfig(), { wrapper });

    result.current.mutate({ enabled: false, defaultCategory: "Music" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.updateYouTubeSyncConfig).toHaveBeenCalledWith(
      { enabled: false, defaultCategory: "Music" },
      expect.anything()
    );
  });

  it("triggers YouTube sync successfully", async () => {
    vi.mocked(api.triggerYouTubeSync).mockResolvedValueOnce(mockSyncResult);

    const { result } = renderHook(() => useTriggerYouTubeSync(), { wrapper });

    result.current.mutate({ playlistId: "PL12345" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSyncResult);
    expect(api.triggerYouTubeSync).toHaveBeenCalledWith(
      { playlistId: "PL12345" },
      expect.anything()
    );
  });

  it("fetches saved playlists successfully", async () => {
    vi.mocked(api.getYouTubeSyncPlaylists).mockResolvedValueOnce([mockPlaylist]);

    const { result } = renderHook(() => useYouTubeSyncPlaylists(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockPlaylist]);
  });

  it("saves a new YouTube playlist", async () => {
    vi.mocked(api.saveYouTubeSyncPlaylist).mockResolvedValueOnce(mockPlaylist);

    const { result } = renderHook(() => useSaveYouTubeSyncPlaylist(), { wrapper });

    result.current.mutate({ playlistId: "PL1234567890", title: "Mornas de Brava", category: "Music" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.saveYouTubeSyncPlaylist).toHaveBeenCalledWith(
      { playlistId: "PL1234567890", title: "Mornas de Brava", category: "Music" },
      expect.anything()
    );
  });

  it("deletes a YouTube playlist", async () => {
    vi.mocked(api.deleteYouTubeSyncPlaylist).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteYouTubeSyncPlaylist(), { wrapper });

    result.current.mutate("playlist-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.deleteYouTubeSyncPlaylist).toHaveBeenCalledWith("playlist-1", expect.anything());
  });
});
