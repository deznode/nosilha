import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAiReviewQueue } from "@/hooks/queries/admin/useAiReviewQueue";
import * as api from "@/lib/api";
import type { AnalysisRunSummary } from "@/types/ai";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

const mockItems: AnalysisRunSummary[] = [
  {
    id: "run-1",
    mediaId: "media-1",
    status: "COMPLETED",
    moderationStatus: "PENDING_REVIEW",
    providersUsed: ["gemini"],
    resultTags: ["landscape", "beach"],
    resultTitle: "Sandy Beach on Brava",
    resultAltText: "A sandy beach",
    resultDescription: "Beautiful sandy beach on Brava",
    createdAt: "2026-02-01T00:00:00Z",
    completedAt: "2026-02-01T00:01:00Z",
  },
];

describe("useAiReviewQueue", () => {
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

  it("fetches AI review queue with default page/size", async () => {
    vi.mocked(api.getAiReviewQueue).mockResolvedValue({
      items: mockItems,
      total: 1,
      page: 0,
      pageSize: 20,
      hasMore: false,
    });

    const { result } = renderHook(() => useAiReviewQueue(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockItems);
    expect(api.getAiReviewQueue).toHaveBeenCalledWith(0, 20);
    expect(api.getAiReviewQueue).toHaveBeenCalledTimes(1);
  });

  it("fetches with custom page and size", async () => {
    vi.mocked(api.getAiReviewQueue).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      hasMore: false,
    });

    const { result } = renderHook(
      () => useAiReviewQueue({ page: 1, size: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getAiReviewQueue).toHaveBeenCalledWith(1, 10);
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(api.getAiReviewQueue).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useAiReviewQueue(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
