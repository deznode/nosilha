/**
 * Unit tests for EXIF Metadata Extraction Utilities
 *
 * Tests the helper functions and EXIF extraction logic.
 * The actual exifr library is mocked to test our wrapper functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExtractedExifData } from "@/types/media";

// Mock exifr module
vi.mock("exifr", () => ({
  default: {
    parse: vi.fn(),
  },
}));

// Import after mocking
import exifr from "exifr";
import {
  extractMetadata,
  hasGpsData,
  hasDateData,
  hasCameraData,
  isHeicFile,
  formatGpsCoordinates,
  formatCameraInfo,
} from "@/lib/exif-utils";

// Test fixtures
function createMockFile(name = "photo.jpg", type = "image/jpeg"): File {
  return new File([""], name, { type });
}

function mockExifrParse(data: Record<string, unknown> | null): void {
  vi.mocked(exifr.parse).mockResolvedValueOnce(data);
}

function mockExifrParseError(error: Error): void {
  vi.mocked(exifr.parse).mockRejectedValueOnce(error);
}

describe("exif-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractMetadata", () => {
    it("should extract and normalize EXIF data from file", async () => {
      mockExifrParse({
        latitude: 14.8672345,
        longitude: -24.7045678,
        GPSAltitude: 450.5,
        DateTimeOriginal: new Date("2024-06-15T10:30:00"),
        Make: "Apple",
        Model: "iPhone 13 Pro",
        Orientation: 6,
        ImageWidth: 4032,
        ImageHeight: 3024,
      });

      const result = await extractMetadata(createMockFile());

      expect(result).not.toBeNull();
      expect(result?.latitude).toBe(14.8672345);
      expect(result?.longitude).toBe(-24.7045678);
      expect(result?.altitude).toBe(450.5);
      expect(result?.dateTimeOriginal).toEqual(new Date("2024-06-15T10:30:00"));
      expect(result?.make).toBe("Apple");
      expect(result?.model).toBe("iPhone 13 Pro");
      expect(result?.orientation).toBe(6);
      expect(result?.width).toBe(4032);
      expect(result?.height).toBe(3024);
    });

    it("should return null when exifr returns null", async () => {
      mockExifrParse(null);

      const result = await extractMetadata(createMockFile());

      expect(result).toBeNull();
    });

    it("should return null and not throw on extraction failure", async () => {
      mockExifrParseError(new Error("Parse failed"));

      const result = await extractMetadata(createMockFile("corrupted.jpg"));

      expect(result).toBeNull();
    });

    it("should prefer DateTimeOriginal over CreateDate", async () => {
      mockExifrParse({
        DateTimeOriginal: new Date("2024-06-15T10:30:00"),
        CreateDate: new Date("2024-06-16T12:00:00"),
      });

      const result = await extractMetadata(createMockFile());

      expect(result?.dateTimeOriginal).toEqual(new Date("2024-06-15T10:30:00"));
    });

    it("should fall back to CreateDate when DateTimeOriginal is missing", async () => {
      mockExifrParse({
        CreateDate: new Date("2024-06-16T12:00:00"),
      });

      const result = await extractMetadata(createMockFile());

      expect(result?.dateTimeOriginal).toEqual(new Date("2024-06-16T12:00:00"));
    });

    it("should default orientation to 1 when not present", async () => {
      mockExifrParse({ Make: "Canon" });

      const result = await extractMetadata(createMockFile());

      expect(result?.orientation).toBe(1);
    });

    it("should try ExifImageWidth/Height when ImageWidth/Height missing", async () => {
      mockExifrParse({
        ExifImageWidth: 4000,
        ExifImageHeight: 3000,
      });

      const result = await extractMetadata(createMockFile());

      expect(result?.width).toBe(4000);
      expect(result?.height).toBe(3000);
    });

    it("should handle partial metadata gracefully", async () => {
      mockExifrParse({
        latitude: 14.867,
        Make: "Samsung",
      });

      const result = await extractMetadata(createMockFile());

      expect(result?.latitude).toBe(14.867);
      expect(result?.longitude).toBeUndefined();
      expect(result?.make).toBe("Samsung");
      expect(result?.model).toBeUndefined();
    });
  });

  describe("hasGpsData", () => {
    it("should return true when both lat and lon are present", () => {
      const metadata: ExtractedExifData = {
        latitude: 14.867,
        longitude: -24.705,
      };

      expect(hasGpsData(metadata)).toBe(true);
    });

    it("should return false when latitude is missing", () => {
      const metadata: ExtractedExifData = {
        longitude: -24.705,
      };

      expect(hasGpsData(metadata)).toBe(false);
    });

    it("should return false when longitude is missing", () => {
      const metadata: ExtractedExifData = {
        latitude: 14.867,
      };

      expect(hasGpsData(metadata)).toBe(false);
    });

    it("should return false when metadata is null", () => {
      expect(hasGpsData(null)).toBe(false);
    });

    it("should return false for empty object", () => {
      expect(hasGpsData({})).toBe(false);
    });

    it("should return true even when altitude is missing", () => {
      const metadata: ExtractedExifData = {
        latitude: 14.867,
        longitude: -24.705,
        // No altitude
      };

      expect(hasGpsData(metadata)).toBe(true);
    });
  });

  describe("hasDateData", () => {
    it("should return true when dateTimeOriginal is present", () => {
      const metadata: ExtractedExifData = {
        dateTimeOriginal: new Date("2024-06-15"),
      };

      expect(hasDateData(metadata)).toBe(true);
    });

    it("should return false when dateTimeOriginal is missing", () => {
      const metadata: ExtractedExifData = {
        make: "Canon",
      };

      expect(hasDateData(metadata)).toBe(false);
    });

    it("should return false when metadata is null", () => {
      expect(hasDateData(null)).toBe(false);
    });
  });

  describe("hasCameraData", () => {
    it("should return true when make is present", () => {
      const metadata: ExtractedExifData = {
        make: "Apple",
      };

      expect(hasCameraData(metadata)).toBe(true);
    });

    it("should return true when model is present", () => {
      const metadata: ExtractedExifData = {
        model: "iPhone 13",
      };

      expect(hasCameraData(metadata)).toBe(true);
    });

    it("should return true when both are present", () => {
      const metadata: ExtractedExifData = {
        make: "Apple",
        model: "iPhone 13",
      };

      expect(hasCameraData(metadata)).toBe(true);
    });

    it("should return false when neither is present", () => {
      const metadata: ExtractedExifData = {
        latitude: 14.867,
      };

      expect(hasCameraData(metadata)).toBe(false);
    });

    it("should return false when metadata is null", () => {
      expect(hasCameraData(null)).toBe(false);
    });
  });

  describe("isHeicFile", () => {
    it("should detect HEIC by MIME type", () => {
      expect(isHeicFile(createMockFile("photo.jpg", "image/heic"))).toBe(true);
    });

    it("should detect HEIF by MIME type", () => {
      expect(isHeicFile(createMockFile("photo.jpg", "image/heif"))).toBe(true);
    });

    it("should detect HEIC by extension (case insensitive)", () => {
      expect(isHeicFile(createMockFile("IMG_1234.HEIC", ""))).toBe(true);
    });

    it("should detect HEIF by extension", () => {
      expect(isHeicFile(createMockFile("photo.heif", ""))).toBe(true);
    });

    it("should return false for JPEG", () => {
      expect(isHeicFile(createMockFile("photo.jpg", "image/jpeg"))).toBe(false);
    });

    it("should return false for PNG", () => {
      expect(isHeicFile(createMockFile("image.png", "image/png"))).toBe(false);
    });

    it("should handle uppercase MIME types", () => {
      expect(isHeicFile(createMockFile("photo.jpg", "IMAGE/HEIC"))).toBe(true);
    });
  });

  describe("formatGpsCoordinates", () => {
    it("should format positive coordinates (NE)", () => {
      const result = formatGpsCoordinates(40.7128, 74.006);
      expect(result).toBe("40.7128°N, 74.0060°E");
    });

    it("should format negative latitude as South", () => {
      const result = formatGpsCoordinates(-33.9249, 18.4241);
      expect(result).toBe("33.9249°S, 18.4241°E");
    });

    it("should format negative longitude as West", () => {
      const result = formatGpsCoordinates(14.867, -24.705);
      expect(result).toBe("14.8670°N, 24.7050°W");
    });

    it("should format both negative (SW)", () => {
      const result = formatGpsCoordinates(-23.5505, -46.6333);
      expect(result).toBe("23.5505°S, 46.6333°W");
    });

    it("should show 4 decimal places", () => {
      const result = formatGpsCoordinates(14.8672345, -24.7045678);
      expect(result).toBe("14.8672°N, 24.7046°W");
    });

    it("should handle zero coordinates", () => {
      const result = formatGpsCoordinates(0, 0);
      expect(result).toBe("0.0000°N, 0.0000°E");
    });
  });

  describe("formatCameraInfo", () => {
    it("should combine make and model", () => {
      const result = formatCameraInfo("Canon", "EOS R5");
      expect(result).toBe("Canon EOS R5");
    });

    it("should return just model when make is undefined", () => {
      const result = formatCameraInfo(undefined, "DSLR-A700");
      expect(result).toBe("DSLR-A700");
    });

    it("should return just make when model is undefined", () => {
      const result = formatCameraInfo("Nikon", undefined);
      expect(result).toBe("Nikon");
    });

    it("should return undefined when both are missing", () => {
      const result = formatCameraInfo(undefined, undefined);
      expect(result).toBeUndefined();
    });

    it("should avoid duplication when model includes make", () => {
      // Some cameras include the make in the model string
      const result = formatCameraInfo("Apple", "Apple iPhone 13 Pro");
      expect(result).toBe("Apple iPhone 13 Pro"); // Not "Apple Apple iPhone 13 Pro"
    });

    it("should be case-insensitive for deduplication", () => {
      const result = formatCameraInfo("APPLE", "apple iPhone 15");
      expect(result).toBe("apple iPhone 15");
    });

    it("should combine when model does not start with make", () => {
      const result = formatCameraInfo("Apple", "iPhone 13 Pro");
      expect(result).toBe("Apple iPhone 13 Pro");
    });
  });
});
