import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useApproveAiRun,
  useRejectAiRun,
  useApproveEditedAiRun,
} from "@/hooks/queries/admin/useAiReviewActions";
import * as api from "@/lib/api";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

describe("AI Review Action Hooks", () => {
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

  describe("useApproveAiRun", () => {
    it("calls approveAiRun and invalidates caches on success", async () => {
      vi.mocked(api.approveAiRun).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useApproveAiRun(), { wrapper });

      await act(() => result.current.mutateAsync("run-1"));

      expect(api.approveAiRun).toHaveBeenCalledWith("run-1");
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

  describe("useRejectAiRun", () => {
    it("calls rejectAiRun with notes", async () => {
      vi.mocked(api.rejectAiRun).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRejectAiRun(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          runId: "run-1",
          request: { notes: "Poor quality" },
        })
      );

      expect(api.rejectAiRun).toHaveBeenCalledWith("run-1", {
        notes: "Poor quality",
      });
    });

    it("calls rejectAiRun without notes", async () => {
      vi.mocked(api.rejectAiRun).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRejectAiRun(), { wrapper });

      await act(() => result.current.mutateAsync({ runId: "run-1" }));

      expect(api.rejectAiRun).toHaveBeenCalledWith("run-1", undefined);
    });
  });

  describe("useApproveEditedAiRun", () => {
    it("calls approveEditedAiRun with edited fields", async () => {
      vi.mocked(api.approveEditedAiRun).mockResolvedValue(undefined);

      const { result } = renderHook(() => useApproveEditedAiRun(), {
        wrapper,
      });

      const request = {
        altText: "Edited alt text",
        tags: ["tag1", "tag2"],
      };

      await act(() => result.current.mutateAsync({ runId: "run-1", request }));

      expect(api.approveEditedAiRun).toHaveBeenCalledWith("run-1", request);
    });
  });
});
