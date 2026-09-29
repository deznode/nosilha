import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ApiError } from "@/lib/api-error";
import type { PresignResponse, MediaMetadataDto } from "@/types/api";

/**
 * useR2Upload drives the presign → XHR PUT → confirm flow (spec 039 P5/P6):
 * upload progress as a percentage, and surfacing the thrown error object
 * (e.g. `ApiError` for a 429) rather than only its message.
 */

const mocks = vi.hoisted(() => ({
  getPresignedUploadUrl: vi.fn(),
  confirmUpload: vi.fn(),
}));

vi.mock("@/lib/backend-api", () => ({
  BackendApiClient: class {
    getPresignedUploadUrl = mocks.getPresignedUploadUrl;
    confirmUpload = mocks.confirmUpload;
  },
}));

import { useR2Upload } from "@/hooks/useR2Upload";

/** A minimal `XMLHttpRequest` stand-in whose progress/load/error events the
 * test triggers manually, so the PUT to R2 never needs a real network call. */
class FakeXHR {
  static instances: FakeXHR[] = [];

  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  readonly openedWith: { method: string; url: string }[] = [];
  readonly headers: Record<string, string> = {};

  open = vi.fn((method: string, url: string) => {
    this.openedWith.push({ method, url });
  });
  setRequestHeader = vi.fn((key: string, value: string) => {
    this.headers[key] = value;
  });
  send = vi.fn(() => {
    FakeXHR.instances.push(this);
  });
  abort = vi.fn(() => {
    this.onabort?.();
  });
}

function pngFile(name = "photo.png"): File {
  return new File(["fake-bytes"], name, { type: "image/png" });
}

const presignResponse: PresignResponse = {
  uploadUrl: "https://r2.example.com/put/uploads%2Fphoto.png",
  key: "uploads/2026/01/photo.png",
  expiresAt: "2026-01-15T10:30:00Z",
};

const mediaDto: MediaMetadataDto = {
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
};

/** Waits for the next XHR the hook opens and returns it. */
async function nextXhr(): Promise<FakeXHR> {
  await waitFor(() => expect(FakeXHR.instances.length).toBeGreaterThan(0));
  return FakeXHR.instances[FakeXHR.instances.length - 1];
}

describe("useR2Upload", () => {
  beforeEach(() => {
    FakeXHR.instances = [];
    vi.stubGlobal("XMLHttpRequest", FakeXHR);
    mocks.getPresignedUploadUrl.mockReset().mockResolvedValue(presignResponse);
    mocks.confirmUpload.mockReset().mockResolvedValue(mediaDto);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends title, description and townId to the confirm request", async () => {
    const { result } = renderHook(() => useR2Upload());

    const uploadPromise = result.current.upload(pngFile(), {
      title: "Fajã church",
      description: "The old church on the coast road",
      townId: "town-123",
    });

    const xhr = await nextXhr();
    await act(async () => {
      xhr.status = 200;
      xhr.onload?.();
      await Promise.resolve();
    });

    const uploadResult = await uploadPromise;

    expect(uploadResult?.publicUrl).toBe(mediaDto.publicUrl);
    expect(mocks.confirmUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        key: presignResponse.key,
        title: "Fajã church",
        description: "The old church on the coast road",
        townId: "town-123",
      })
    );
  });

  it("reports upload progress as a percentage", async () => {
    const { result } = renderHook(() => useR2Upload());

    const uploadPromise = result.current.upload(pngFile());
    const xhr = await nextXhr();

    act(() => {
      xhr.upload.onprogress?.({
        lengthComputable: true,
        loaded: 50,
        total: 100,
      } as ProgressEvent);
    });

    await waitFor(() => expect(result.current.progress.percentage).toBe(50));

    await act(async () => {
      xhr.status = 200;
      xhr.onload?.();
      await Promise.resolve();
    });

    await uploadPromise;
  });

  it("keeps state as error and preserves the ApiError object on a 429", async () => {
    const rateLimitError = new ApiError("Upload rate limit exceeded", 429, 120);
    mocks.getPresignedUploadUrl.mockRejectedValueOnce(rateLimitError);

    const { result } = renderHook(() => useR2Upload());

    await act(async () => {
      await result.current.upload(pngFile());
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Upload rate limit exceeded");
    expect(result.current.lastError).toBe(rateLimitError);
    expect(result.current.lastError).toBeInstanceOf(ApiError);
    expect((result.current.lastError as ApiError).status).toBe(429);
    expect((result.current.lastError as ApiError).retryAfterSeconds).toBe(120);
  });
});
