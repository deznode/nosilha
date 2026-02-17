import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAiRunDetail } from "@/hooks/queries/admin/useAiRunDetail";
import * as api from "@/lib/api";
import type { AnalysisRunDetail } from "@/types/ai";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

const mockDetail: AnalysisRunDetail = {
  id: "run-1",
  mediaId: "media-1",
  batchId: null,
  status: "COMPLETED",
  moderationStatus: "PENDING_REVIEW",
  providersUsed: ["gemini"],
  rawResults: null,
  resultTags: ["landscape"],
  resultLabels: null,
  resultTitle: "Sandy Beach on Brava",
  resultAltText: "A sandy beach",
  resultDescription: "Beautiful sandy beach",
  moderatedBy: null,
  moderatedAt: null,
  moderatorNotes: null,
  errorMessage: null,
  requestedBy: "admin",
  startedAt: "2026-02-01T00:00:00Z",
  completedAt: "2026-02-01T00:01:00Z",
  createdAt: "2026-02-01T00:00:00Z",
};

describe("useAiRunDetail", () => {
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

  it("does not fetch when runId is null", () => {
    const { result } = renderHook(() => useAiRunDetail(null), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.getAiRunDetail).not.toHaveBeenCalled();
  });

  it("does not fetch when runId is undefined", () => {
    const { result } = renderHook(() => useAiRunDetail(undefined), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(api.getAiRunDetail).not.toHaveBeenCalled();
  });

  it("fetches detail when runId is provided", async () => {
    vi.mocked(api.getAiRunDetail).mockResolvedValue(mockDetail);

    const { result } = renderHook(() => useAiRunDetail("run-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDetail);
    expect(api.getAiRunDetail).toHaveBeenCalledWith("run-1");
    expect(api.getAiRunDetail).toHaveBeenCalledTimes(1);
  });
});
