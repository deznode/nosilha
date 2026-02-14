import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useBulkPresignR2,
  useBulkConfirmR2,
  useLinkR2Orphan,
  useDeleteR2Orphan,
} from "@/hooks/queries/admin/useR2AdminMutations";
import * as api from "@/lib/api";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

describe("R2 Admin Mutation Hooks", () => {
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

  describe("useBulkPresignR2", () => {
    it("calls bulkPresignR2 with request and returns presigned URLs", async () => {
      const mockResult = {
        presigns: [
          {
            fileName: "photo1.jpg",
            uploadUrl: "https://r2.example.com/upload?sig=abc",
            key: "uploads/2026/01/photo1.jpg",
            expiresAt: "2026-01-15T10:30:00Z",
          },
        ],
      };
      vi.mocked(api.bulkPresignR2).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useBulkPresignR2(), { wrapper });

      const request = {
        files: [
          { fileName: "photo1.jpg", contentType: "image/jpeg", fileSize: 1024 },
        ],
      };

      const returnedData = await act(() => result.current.mutateAsync(request));

      expect(api.bulkPresignR2).toHaveBeenCalledWith(request);
      expect(returnedData).toEqual(mockResult);
    });

    it("does not invalidate any caches", async () => {
      vi.mocked(api.bulkPresignR2).mockResolvedValue({ presigns: [] });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useBulkPresignR2(), { wrapper });

      await act(() => result.current.mutateAsync({ files: [] }));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe("useBulkConfirmR2", () => {
    it("calls bulkConfirmR2 and invalidates r2 + gallery caches", async () => {
      const mockResult = {
        accepted: 1,
        rejected: 0,
        created: ["uuid-1"],
        errors: [],
      };
      vi.mocked(api.bulkConfirmR2).mockResolvedValue(mockResult);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useBulkConfirmR2(), { wrapper });

      const request = {
        uploads: [
          {
            key: "uploads/2026/01/photo1.jpg",
            originalName: "photo1.jpg",
            contentType: "image/jpeg",
            fileSize: 1024,
          },
        ],
      };

      await act(() => result.current.mutateAsync(request));

      expect(api.bulkConfirmR2).toHaveBeenCalledWith(request);
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "r2"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "gallery"]),
        })
      );
    });
  });

  describe("useLinkR2Orphan", () => {
    it("calls linkR2Orphan and invalidates orphans + gallery caches", async () => {
      const mockResult = {
        id: "uuid-1",
        title: "orphan-photo.jpg",
        status: "ACTIVE",
        mediaSource: "USER_UPLOAD",
      };
      vi.mocked(api.linkR2Orphan).mockResolvedValue(mockResult as never);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useLinkR2Orphan(), { wrapper });

      const request = {
        storageKey: "uploads/2026/01/orphan.jpg",
        category: "heritage",
      };

      await act(() => result.current.mutateAsync(request));

      expect(api.linkR2Orphan).toHaveBeenCalledWith(request);
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "r2", "orphans"]),
        })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "gallery"]),
        })
      );
    });
  });

  describe("useDeleteR2Orphan", () => {
    it("calls deleteR2Orphan and invalidates orphans cache", async () => {
      vi.mocked(api.deleteR2Orphan).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteR2Orphan(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          storageKey: "uploads/2026/01/orphan-to-delete.jpg",
        })
      );

      expect(api.deleteR2Orphan).toHaveBeenCalledWith({
        storageKey: "uploads/2026/01/orphan-to-delete.jpg",
      });
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["admin", "r2", "orphans"]),
        })
      );
    });

    it("does not invalidate gallery cache on delete", async () => {
      vi.mocked(api.deleteR2Orphan).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteR2Orphan(), { wrapper });

      await act(() =>
        result.current.mutateAsync({ storageKey: "uploads/orphan.jpg" })
      );

      // Should only invalidate orphans, not gallery
      const galleryCalls = invalidateSpy.mock.calls.filter(
        (call) =>
          JSON.stringify(call[0]).includes('"gallery"') &&
          !JSON.stringify(call[0]).includes('"r2"')
      );
      expect(galleryCalls).toHaveLength(0);
    });
  });
});
