import { describe, expect, it } from "vitest";

import { formatCoordinate, formatCoordinates } from "@/lib/coordinates";

/** Spec 034 — one printed form for every coordinate the archive shows. */
describe("formatCoordinates", () => {
  it("prints four decimals and a true minus sign", () => {
    expect(formatCoordinates(14.8632, -24.7183)).toBe("14.8632, −24.7183");
  });

  it("rounds to four places rather than printing raw precision", () => {
    expect(formatCoordinate(14.86321987)).toBe("14.8632");
  });

  it("is null when either half is missing", () => {
    expect(formatCoordinates(14.86, null)).toBeNull();
    expect(formatCoordinates(null, -24.71)).toBeNull();
    expect(formatCoordinates(undefined, undefined)).toBeNull();
  });

  it("refuses a non-finite value instead of printing NaN", () => {
    expect(formatCoordinates(Number.NaN, -24.71)).toBeNull();
  });
});
