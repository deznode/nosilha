import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useR2Orphans } from "@/hooks/queries/admin/useR2Orphans";
import * as api from "@/lib/api";
import type { OrphanDetectionResponse } from "@/types/r2-admin";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

const mockResponse: OrphanDetectionResponse = {
  orphans: [
    {
      key: "uploads/2026/01/orphan1.jpg",
      size: 2048,
      lastModified: "2026-01-15T10:00:00Z",
      publicUrl: "https://media.example.com/uploads/2026/01/orphan1.jpg",
    },
  ],
  totalScanned: 5,
  continuationToken: null,
  isTruncated: false,
};

describe("useR2Orphans", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("starts disabled by default and does not fetch", async () => {
    const { result } = renderHook(() => useR2Orphans(), { wrapper });

    // Should not be loading or fetching when disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(api.detectR2Orphans).not.toHaveBeenCalled();
  });

  it("fetches orphans when enabled is true", async () => {
    vi.mocked(api.detectR2Orphans).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useR2Orphans({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.orphans).toHaveLength(1);
    expect(api.detectR2Orphans).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
  });

  it("fetches on manual refetch when disabled", async () => {
    vi.mocked(api.detectR2Orphans).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useR2Orphans(), { wrapper });

    // Initially disabled — no fetch
    expect(api.detectR2Orphans).not.toHaveBeenCalled();

    // Manual refetch triggers the query even when disabled
    let refetchResult: Awaited<ReturnType<typeof result.current.refetch>>;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });

    expect(api.detectR2Orphans).toHaveBeenCalled();
    expect(refetchResult!.data?.orphans).toHaveLength(1);
  });

  it("passes prefix and pagination parameters", async () => {
    vi.mocked(api.detectR2Orphans).mockResolvedValue({
      orphans: [],
      totalScanned: 0,
      continuationToken: null,
      isTruncated: false,
    });

    const { result } = renderHook(
      () =>
        useR2Orphans({
          prefix: "uploads/old/",
          continuationToken: "token-xyz",
          maxKeys: 500,
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.detectR2Orphans).toHaveBeenCalledWith(
      "uploads/old/",
      "token-xyz",
      500
    );
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(api.detectR2Orphans).mockRejectedValue(new Error("Scan failed"));

    const { result } = renderHook(() => useR2Orphans({ enabled: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
