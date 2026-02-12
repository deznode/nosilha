import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useTriggerAnalysis,
  useTriggerBatchAnalysis,
} from "@/hooks/queries/admin/useTriggerAnalysis";
import * as api from "@/lib/api";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

describe("AI Analysis Trigger Hooks", () => {
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

  describe("useTriggerAnalysis", () => {
    it("calls triggerAnalysis with the correct mediaId", async () => {
      vi.mocked(api.triggerAnalysis).mockResolvedValue({
        mediaId: "media-1",
        analysisRunId: "run-1",
        status: "PENDING",
      });

      const { result } = renderHook(() => useTriggerAnalysis(), { wrapper });

      await act(() => result.current.mutateAsync("media-1"));

      expect(api.triggerAnalysis).toHaveBeenCalledWith("media-1");
    });

    it("invalidates caches on success", async () => {
      vi.mocked(api.triggerAnalysis).mockResolvedValue({
        mediaId: "media-1",
        analysisRunId: "run-1",
        status: "PENDING",
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTriggerAnalysis(), { wrapper });

      await act(() => result.current.mutateAsync("media-1"));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "ai-review"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "gallery"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "system"]),
        })
      );
    });
  });

  describe("useTriggerBatchAnalysis", () => {
    it("calls triggerBatchAnalysis with the correct request", async () => {
      vi.mocked(api.triggerBatchAnalysis).mockResolvedValue({
        batchId: "batch-1",
        accepted: 3,
        rejected: 0,
        errors: [],
      });

      const { result } = renderHook(() => useTriggerBatchAnalysis(), {
        wrapper,
      });

      await act(() =>
        result.current.mutateAsync({
          mediaIds: ["media-1", "media-2", "media-3"],
        })
      );

      expect(api.triggerBatchAnalysis).toHaveBeenCalledWith({
        mediaIds: ["media-1", "media-2", "media-3"],
      });
    });

    it("invalidates caches on success", async () => {
      vi.mocked(api.triggerBatchAnalysis).mockResolvedValue({
        batchId: "batch-1",
        accepted: 2,
        rejected: 0,
        errors: [],
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTriggerBatchAnalysis(), {
        wrapper,
      });

      await act(() =>
        result.current.mutateAsync({ mediaIds: ["media-1", "media-2"] })
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "ai-review"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "gallery"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "system"]),
        })
      );
    });
  });
});
