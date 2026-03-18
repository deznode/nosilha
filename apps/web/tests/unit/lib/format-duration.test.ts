import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/format-duration";

describe("formatDuration", () => {
  describe("sub-minute values", () => {
    it("formats 0 seconds", () => {
      expect(formatDuration(0)).toBe("0:00");
    });

    it("formats single-digit seconds with padding", () => {
      expect(formatDuration(5)).toBe("0:05");
    });

    it("formats double-digit seconds", () => {
      expect(formatDuration(45)).toBe("0:45");
    });

    it("formats 59 seconds (boundary)", () => {
      expect(formatDuration(59)).toBe("0:59");
    });
  });

  describe("minute-range values", () => {
    it("formats exactly 1 minute", () => {
      expect(formatDuration(60)).toBe("1:00");
    });

    it("formats minutes with seconds", () => {
      expect(formatDuration(272)).toBe("4:32");
    });

    it("formats large minute values", () => {
      expect(formatDuration(3599)).toBe("59:59");
    });
  });

  describe("hour-range values", () => {
    it("formats exactly 1 hour", () => {
      expect(formatDuration(3600)).toBe("1:00:00");
    });

    it("formats hours with minutes and seconds", () => {
      expect(formatDuration(3735)).toBe("1:02:15");
    });

    it("formats multi-hour values", () => {
      expect(formatDuration(7384)).toBe("2:03:04");
    });

    it("pads minutes in hour format", () => {
      expect(formatDuration(3605)).toBe("1:00:05");
    });
  });

  describe("edge cases", () => {
    it("handles very large values", () => {
      // 100 hours
      expect(formatDuration(360000)).toBe("100:00:00");
    });
  });
});
