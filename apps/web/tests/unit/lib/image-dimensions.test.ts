import { describe, it, expect, vi, afterEach } from "vitest";
import { readImageDimensions } from "@/lib/image-dimensions";

const file = new Blob(["x"], { type: "image/jpeg" });

/** An <img> stand-in that loads, or fails, as soon as its src is set. */
function stubImage(result: { width: number; height: number } | "error") {
  class FakeImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = result === "error" ? 0 : result.width;
    naturalHeight = result === "error" ? 0 : result.height;
    set src(_value: string) {
      queueMicrotask(() =>
        result === "error" ? this.onerror?.() : this.onload?.()
      );
    }
  }
  vi.stubGlobal("Image", FakeImage);
}

describe("readImageDimensions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reads the size as displayed, with EXIF orientation applied", async () => {
    const close = vi.fn();
    const createImageBitmap = vi
      .fn()
      .mockResolvedValue({ width: 800, height: 1200, close });
    vi.stubGlobal("createImageBitmap", createImageBitmap);

    await expect(readImageDimensions(file)).resolves.toEqual({
      width: 800,
      height: 1200,
    });
    expect(createImageBitmap).toHaveBeenCalledWith(file, {
      imageOrientation: "from-image",
    });
    expect(close).toHaveBeenCalled();
  });

  it("falls back to an image element when a bitmap cannot be made", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("unsupported"))
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:probe");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    stubImage({ width: 640, height: 480 });

    await expect(readImageDimensions(file)).resolves.toEqual({
      width: 640,
      height: 480,
    });
    expect(revoke).toHaveBeenCalledWith("blob:probe");
  });

  it("resolves null, rather than rejecting, when the file cannot be decoded", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("unsupported"))
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:probe");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    stubImage("error");

    await expect(readImageDimensions(file)).resolves.toBeNull();
  });
});
