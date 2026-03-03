import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useR2Objects } from "@/hooks/queries/admin/useR2Objects";
import * as api from "@/lib/api";
import type { R2BucketListResponse } from "@/types/r2-admin";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

const mockResponse: R2BucketListResponse = {
  objects: [
    {
      key: "uploads/2026/01/photo1.jpg",
      size: 2048,
      lastModified: "2026-01-15T10:00:00Z",
      publicUrl: "https://media.example.com/uploads/2026/01/photo1.jpg",
    },
    {
      key: "uploads/2026/01/photo2.png",
      size: 4096,
      lastModified: "2026-01-15T11:00:00Z",
      publicUrl: "https://media.example.com/uploads/2026/01/photo2.png",
    },
  ],
  continuationToken: "next-token",
  isTruncated: true,
};

describe("useR2Objects", () => {
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

  it("fetches bucket objects successfully", async () => {
    vi.mocked(api.listR2Bucket).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useR2Objects(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.objects).toHaveLength(2);
    expect(api.listR2Bucket).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
  });

  it("passes prefix and continuationToken parameters", async () => {
    vi.mocked(api.listR2Bucket).mockResolvedValue({
      objects: [],
      continuationToken: null,
      isTruncated: false,
    });

    const { result } = renderHook(
      () =>
        useR2Objects({
          prefix: "uploads/2026/",
          continuationToken: "token-abc",
          maxKeys: 50,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.listR2Bucket).toHaveBeenCalledWith(
      "uploads/2026/",
      "token-abc",
      50
    );
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(api.listR2Bucket).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useR2Objects(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
