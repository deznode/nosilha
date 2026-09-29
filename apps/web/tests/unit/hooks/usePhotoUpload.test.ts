import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ApiError } from "@/lib/api-error";
import type { UploadResult } from "@/hooks/useR2Upload";

/**
 * usePhotoUpload wires the new title/townId fields (P5/P6, spec 039) and the
 * progress/lastError surface through to `useR2Upload`, which is
 * exercised directly (with real XHR/fetch behaviour) in useR2Upload.test.ts.
 * Here `useR2Upload` is mocked so the wiring can be asserted in isolation
 * from EXIF extraction and image decoding.
 */

const mocks = vi.hoisted(() => ({
  r2Upload: vi.fn(),
  r2Reset: vi.fn(),
  extractMetadata: vi.fn(),
  readImageDimensions: vi.fn(),
  r2State: {
    state: "idle" as string,
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null as string | null,
    lastError: null as Error | null,
  },
}));

vi.mock("@/lib/exif-utils", () => ({
  extractMetadata: mocks.extractMetadata,
}));

vi.mock("@/lib/image-dimensions", () => ({
  readImageDimensions: mocks.readImageDimensions,
}));

vi.mock("@/hooks/useR2Upload", () => ({
  useR2Upload: () => ({
    ...mocks.r2State,
    upload: mocks.r2Upload,
    cancel: vi.fn(),
    reset: mocks.r2Reset,
  }),
}));

import { usePhotoUpload } from "@/hooks/usePhotoUpload";

function pngFile(name = "photo.png"): File {
  return new File(["fake-bytes"], name, { type: "image/png" });
}

const uploadResult: UploadResult = {
  media: {
    id: "media-1",
    fileName: "photo.png",
    originalName: "photo.png",
    contentType: "image/png",
    fileSize: 10,
    publicUrl: "https://media.nosilha.com/photo.png",
    status: "AVAILABLE",
    source: "LOCAL",
    entryId: null,
    category: null,
    description: null,
    displayOrder: 0,
    uploadedBy: null,
    createdAt: null,
    updatedAt: null,
  },
  publicUrl: "https://media.nosilha.com/photo.png",
};

async function selectAndWait(
  result: { current: ReturnType<typeof usePhotoUpload> },
  file: File
) {
  await act(async () => {
    await result.current.selectFile(file);
  });
}

describe("usePhotoUpload", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:held-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    mocks.r2Upload.mockReset().mockResolvedValue(uploadResult);
    mocks.r2Reset.mockReset();
    mocks.extractMetadata.mockReset().mockResolvedValue(null);
    mocks.readImageDimensions.mockReset().mockResolvedValue(null);
    mocks.r2State.state = "idle";
    mocks.r2State.progress = { loaded: 0, total: 0, percentage: 0 };
    mocks.r2State.error = null;
    mocks.r2State.lastError = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes title, description and townId through to the confirm payload", async () => {
    const { result } = renderHook(() => usePhotoUpload());
    await selectAndWait(result, pngFile());

    await act(async () => {
      await result.current.upload({
        title: "Fajã church",
        description: "The old church on the coast road",
        townId: "town-123",
      });
    });

    expect(mocks.r2Upload).toHaveBeenCalledTimes(1);
    const [file, options] = mocks.r2Upload.mock.calls[0];
    expect(file).toBeInstanceOf(File);
    expect(options).toMatchObject({
      title: "Fajã church",
      description: "The old church on the coast road",
      townId: "town-123",
    });
  });

  it("exposes progress as the percentage reported by useR2Upload", () => {
    mocks.r2State.progress = { loaded: 50, total: 100, percentage: 50 };

    const { result } = renderHook(() => usePhotoUpload());

    expect(result.current.progress).toBe(50);
  });

  it("keeps the file, preview and metadata after a failed upload", async () => {
    mocks.r2Upload.mockResolvedValueOnce(null);

    const { result } = renderHook(() => usePhotoUpload());
    const file = pngFile();
    await selectAndWait(result, file);

    expect(result.current.file).toBe(file);
    const previewBefore = result.current.previewUrl;

    await act(async () => {
      await result.current.upload({ title: "Try me" });
    });

    expect(result.current.file).toBe(file);
    expect(result.current.previewUrl).toBe(previewBefore);
    expect(result.current.metadata).not.toBeNull();
  });

  it("exposes the ApiError thrown by the last attempt via lastError", () => {
    const apiError = new ApiError("Too many uploads", 429, 120);
    mocks.r2State.error = "Too many uploads";
    mocks.r2State.lastError = apiError;

    const { result } = renderHook(() => usePhotoUpload());

    expect(result.current.lastError).toBe(apiError);
    expect(result.current.lastError).toBeInstanceOf(ApiError);
    expect((result.current.lastError as ApiError).status).toBe(429);
    expect((result.current.lastError as ApiError).retryAfterSeconds).toBe(120);
  });
});
