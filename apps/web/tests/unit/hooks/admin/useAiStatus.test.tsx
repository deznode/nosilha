import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAiStatus } from "@/hooks/queries/admin/useAiStatus";
import * as api from "@/lib/api";
import type { AiStatusResponse } from "@/types/ai";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

const mockStatuses: AiStatusResponse[] = [
  {
    mediaId: "media-1",
    lastRunStatus: "COMPLETED",
    moderationStatus: "PENDING_REVIEW",
    aiProcessed: true,
    aiProcessedAt: "2026-02-01T00:00:00Z",
  },
  {
    mediaId: "media-2",
    lastRunStatus: null,
    moderationStatus: null,
    aiProcessed: false,
    aiProcessedAt: null,
  },
];

describe("useAiStatus", () => {
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

  it("does not fetch when mediaIds is empty", () => {
    const { result } = renderHook(() => useAiStatus([]), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.getAiStatus).not.toHaveBeenCalled();
  });

  it("fetches status for provided mediaIds", async () => {
    vi.mocked(api.getAiStatus).mockResolvedValue(mockStatuses);

    const { result } = renderHook(
      () => useAiStatus(["media-1", "media-2"]),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStatuses);
    expect(api.getAiStatus).toHaveBeenCalledWith(["media-1", "media-2"]);
  });

  it("uses stable query key regardless of mediaIds order", () => {
    // The query key sorts mediaIds, so different orders should produce the same key
    const { result: result1 } = renderHook(
      () => useAiStatus(["media-2", "media-1"]),
      { wrapper }
    );
    const { result: result2 } = renderHook(
      () => useAiStatus(["media-1", "media-2"]),
      { wrapper }
    );

    // Both hooks should share the same cache entry since sorted keys match
    // We can verify they use the same queryKey by checking the cache
    const cache = queryClient.getQueryCache().getAll();
    const aiStatusKeys = cache.filter(
      (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey.includes("ai-review") &&
        q.queryKey.includes("status")
    );

    // Should only have one cache entry (not two) because sorted keys are identical
    expect(aiStatusKeys.length).toBe(1);
  });
});
