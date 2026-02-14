import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useBulkPresignR2,
  useBulkConfirmR2,
} from "@/hooks/queries/admin/useR2AdminMutations";
import * as api from "@/lib/api";
import type {
  BulkPresignResponse,
  BulkConfirmResponse,
} from "@/types/r2-admin";
import type { ReactNode } from "react";

vi.mock("@/lib/api");

/**
 * Tests the bulk upload orchestration flow at the mutation hook level.
 *
 * The 3-step flow (presign → XHR upload → confirm) is tested here
 * for the presign and confirm steps. XHR upload is browser-only and
 * tested separately via Playwright E2E.
 */
describe("Bulk Upload Orchestration", () => {
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

  describe("presign → confirm flow", () => {
    it("presigns a batch then confirms successfully uploaded files", async () => {
      const presignResponse: BulkPresignResponse = {
        presigns: [
          {
            fileName: "photo1.jpg",
            uploadUrl: "https://r2.example.com/put1",
            key: "uploads/2026/01/photo1.jpg",
            expiresAt: "2026-01-15T10:30:00Z",
          },
          {
            fileName: "photo2.png",
            uploadUrl: "https://r2.example.com/put2",
            key: "uploads/2026/01/photo2.png",
            expiresAt: "2026-01-15T10:30:00Z",
          },
        ],
      };

      const confirmResponse: BulkConfirmResponse = {
        accepted: 2,
        rejected: 0,
        created: ["uuid-1", "uuid-2"],
        errors: [],
      };

      vi.mocked(api.bulkPresignR2).mockResolvedValue(presignResponse);
      vi.mocked(api.bulkConfirmR2).mockResolvedValue(confirmResponse);

      const { result: presignResult } = renderHook(() => useBulkPresignR2(), {
        wrapper,
      });
      const { result: confirmResult } = renderHook(() => useBulkConfirmR2(), {
        wrapper,
      });

      // Step 1: Batch presign
      const presigns = await act(() =>
        presignResult.current.mutateAsync({
          files: [
            { fileName: "photo1.jpg", contentType: "image/jpeg", fileSize: 1024 },
            { fileName: "photo2.png", contentType: "image/png", fileSize: 2048 },
          ],
        })
      );

      expect(presigns.presigns).toHaveLength(2);
      expect(presigns.presigns[0].uploadUrl).toBeTruthy();

      // Step 2: (XHR upload happens in browser — skipped in unit test)

      // Step 3: Batch confirm
      const confirmation = await act(() =>
        confirmResult.current.mutateAsync({
          uploads: presigns.presigns.map((p) => ({
            key: p.key,
            originalName: p.fileName,
            contentType: "image/jpeg",
            fileSize: 1024,
            category: "gallery",
          })),
        })
      );

      expect(confirmation.accepted).toBe(2);
      expect(confirmation.rejected).toBe(0);
      expect(confirmation.created).toHaveLength(2);
    });

    it("handles partial failure in confirm step", async () => {
      const presignResponse: BulkPresignResponse = {
        presigns: [
          {
            fileName: "photo1.jpg",
            uploadUrl: "https://r2.example.com/put1",
            key: "uploads/2026/01/photo1.jpg",
            expiresAt: "2026-01-15T10:30:00Z",
          },
          {
            fileName: "photo2.jpg",
            uploadUrl: "https://r2.example.com/put2",
            key: "uploads/2026/01/photo2.jpg",
            expiresAt: "2026-01-15T10:30:00Z",
          },
        ],
      };

      const confirmResponse: BulkConfirmResponse = {
        accepted: 1,
        rejected: 1,
        created: ["uuid-1"],
        errors: [
          {
            key: "uploads/2026/01/photo2.jpg",
            reason: "Object not found in R2",
          },
        ],
      };

      vi.mocked(api.bulkPresignR2).mockResolvedValue(presignResponse);
      vi.mocked(api.bulkConfirmR2).mockResolvedValue(confirmResponse);

      const { result: presignResult } = renderHook(() => useBulkPresignR2(), {
        wrapper,
      });
      const { result: confirmResult } = renderHook(() => useBulkConfirmR2(), {
        wrapper,
      });

      await act(() =>
        presignResult.current.mutateAsync({
          files: [
            { fileName: "photo1.jpg", contentType: "image/jpeg", fileSize: 1024 },
            { fileName: "photo2.jpg", contentType: "image/jpeg", fileSize: 2048 },
          ],
        })
      );

      const confirmation = await act(() =>
        confirmResult.current.mutateAsync({
          uploads: [
            {
              key: "uploads/2026/01/photo1.jpg",
              originalName: "photo1.jpg",
              contentType: "image/jpeg",
              fileSize: 1024,
            },
            {
              key: "uploads/2026/01/photo2.jpg",
              originalName: "photo2.jpg",
              contentType: "image/jpeg",
              fileSize: 2048,
            },
          ],
        })
      );

      expect(confirmation.accepted).toBe(1);
      expect(confirmation.rejected).toBe(1);
      expect(confirmation.errors).toHaveLength(1);
      expect(confirmation.errors[0].key).toBe("uploads/2026/01/photo2.jpg");
    });

    it("handles presign failure gracefully", async () => {
      vi.mocked(api.bulkPresignR2).mockRejectedValue(
        new Error("Presign failed")
      );

      const { result } = renderHook(() => useBulkPresignR2(), { wrapper });

      await expect(
        act(() =>
          result.current.mutateAsync({
            files: [
              {
                fileName: "photo.jpg",
                contentType: "image/jpeg",
                fileSize: 1024,
              },
            ],
          })
        )
      ).rejects.toThrow("Presign failed");
    });

    it("confirm invalidates both r2 and gallery caches", async () => {
      vi.mocked(api.bulkConfirmR2).mockResolvedValue({
        accepted: 1,
        rejected: 0,
        created: ["uuid-1"],
        errors: [],
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useBulkConfirmR2(), { wrapper });

      await act(() =>
        result.current.mutateAsync({
          uploads: [
            {
              key: "uploads/2026/01/photo.jpg",
              originalName: "photo.jpg",
              contentType: "image/jpeg",
              fileSize: 1024,
            },
          ],
        })
      );

      // Should invalidate both r2 and gallery caches
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

  describe("batch size validation", () => {
    it("presigns up to 20 files in a single batch", async () => {
      const files = Array.from({ length: 20 }, (_, i) => ({
        fileName: `photo${i}.jpg`,
        contentType: "image/jpeg" as const,
        fileSize: 1024,
      }));

      const presigns = files.map((f) => ({
        fileName: f.fileName,
        uploadUrl: `https://r2.example.com/put-${f.fileName}`,
        key: `uploads/2026/01/${f.fileName}`,
        expiresAt: "2026-01-15T10:30:00Z",
      }));

      vi.mocked(api.bulkPresignR2).mockResolvedValue({ presigns });

      const { result } = renderHook(() => useBulkPresignR2(), { wrapper });

      const response = await act(() =>
        result.current.mutateAsync({ files })
      );

      expect(response.presigns).toHaveLength(20);
      expect(api.bulkPresignR2).toHaveBeenCalledWith({ files });
    });
  });
});
