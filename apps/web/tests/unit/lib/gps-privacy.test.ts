/**
 * Unit tests for GPS Privacy Utilities
 *
 * Tests the tiered GPS privacy transformation logic that processes
 * coordinates based on photo type before upload.
 */

import { describe, it, expect } from "vitest";
import {
  applyGpsPrivacy,
  getPrivacyDescription,
  getPhotoTypeDescription,
  isWithinBravaIsland,
  GPS_PRECISION,
  BRAVA_BOUNDS,
} from "@/lib/gps-privacy";
import type { ExtractedExifData, PhotoType } from "@/types/media";

describe("gps-privacy", () => {
  // Sample coordinates for Brava Island (Vila Nova Sintra area)
  const bravaCoordinates: ExtractedExifData = {
    latitude: 14.8672345,
    longitude: -24.7045678,
    altitude: 450.5,
  };

  describe("applyGpsPrivacy", () => {
    describe("CULTURAL_SITE photo type", () => {
      it("should preserve full GPS precision (6 decimals)", () => {
        const result = applyGpsPrivacy(bravaCoordinates, "CULTURAL_SITE");

        expect(result.latitude).toBe(14.867235); // Rounded to 6 decimals
        expect(result.longitude).toBe(-24.704568);
        expect(result.altitude).toBe(450.5); // Altitude unchanged
        expect(result.gpsPrivacyLevel).toBe("FULL");
      });

      it("should handle coordinates with fewer decimals", () => {
        const simpleCoords: ExtractedExifData = {
          latitude: 14.86,
          longitude: -24.7,
        };

        const result = applyGpsPrivacy(simpleCoords, "CULTURAL_SITE");

        expect(result.latitude).toBe(14.86);
        expect(result.longitude).toBe(-24.7);
        expect(result.gpsPrivacyLevel).toBe("FULL");
      });
    });

    describe("COMMUNITY_EVENT photo type", () => {
      it("should round GPS to 3 decimals (~100m accuracy)", () => {
        const result = applyGpsPrivacy(bravaCoordinates, "COMMUNITY_EVENT");

        expect(result.latitude).toBe(14.867); // Rounded to 3 decimals
        expect(result.longitude).toBe(-24.705);
        expect(result.altitude).toBe(451); // Altitude rounded to integer
        expect(result.gpsPrivacyLevel).toBe("APPROXIMATE");
      });

      it("should round altitude to nearest meter", () => {
        const coordsWithAltitude: ExtractedExifData = {
          latitude: 14.8672345,
          longitude: -24.7045678,
          altitude: 123.789,
        };

        const result = applyGpsPrivacy(coordsWithAltitude, "COMMUNITY_EVENT");

        expect(result.altitude).toBe(124); // Rounded to nearest meter
      });

      it("should handle undefined altitude", () => {
        const coordsNoAltitude: ExtractedExifData = {
          latitude: 14.8672345,
          longitude: -24.7045678,
        };

        const result = applyGpsPrivacy(coordsNoAltitude, "COMMUNITY_EVENT");

        expect(result.altitude).toBeUndefined();
      });
    });

    describe("PERSONAL photo type", () => {
      it("should strip all GPS data", () => {
        const result = applyGpsPrivacy(bravaCoordinates, "PERSONAL");

        expect(result.latitude).toBeUndefined();
        expect(result.longitude).toBeUndefined();
        expect(result.altitude).toBeUndefined();
        expect(result.gpsPrivacyLevel).toBe("STRIPPED");
      });

      it("should return STRIPPED even with high-precision coordinates", () => {
        const preciseCoords: ExtractedExifData = {
          latitude: 14.867234567890123,
          longitude: -24.704567890123456,
          altitude: 450.123456,
        };

        const result = applyGpsPrivacy(preciseCoords, "PERSONAL");

        expect(result.latitude).toBeUndefined();
        expect(result.longitude).toBeUndefined();
        expect(result.altitude).toBeUndefined();
        expect(result.gpsPrivacyLevel).toBe("STRIPPED");
      });
    });

    describe("No GPS data scenarios", () => {
      it("should return NONE when metadata is null", () => {
        const result = applyGpsPrivacy(null, "CULTURAL_SITE");

        expect(result.latitude).toBeUndefined();
        expect(result.longitude).toBeUndefined();
        expect(result.altitude).toBeUndefined();
        expect(result.gpsPrivacyLevel).toBe("NONE");
      });

      it("should return NONE when latitude is missing", () => {
        const noLat: ExtractedExifData = {
          longitude: -24.7045678,
        };

        const result = applyGpsPrivacy(noLat, "CULTURAL_SITE");

        expect(result.gpsPrivacyLevel).toBe("NONE");
      });

      it("should return NONE when longitude is missing", () => {
        const noLon: ExtractedExifData = {
          latitude: 14.8672345,
        };

        const result = applyGpsPrivacy(noLon, "CULTURAL_SITE");

        expect(result.gpsPrivacyLevel).toBe("NONE");
      });

      it("should return NONE for empty metadata object", () => {
        const empty: ExtractedExifData = {};

        const result = applyGpsPrivacy(empty, "COMMUNITY_EVENT");

        expect(result.gpsPrivacyLevel).toBe("NONE");
      });
    });

    describe("Edge cases", () => {
      it("should handle negative coordinates correctly", () => {
        // Southern hemisphere, Western hemisphere
        const negativeCoords: ExtractedExifData = {
          latitude: -33.9248685,
          longitude: -18.4240553,
        };

        const result = applyGpsPrivacy(negativeCoords, "COMMUNITY_EVENT");

        expect(result.latitude).toBe(-33.925);
        expect(result.longitude).toBe(-18.424);
      });

      it("should treat zero coordinates as no GPS data", () => {
        // Note: (0,0) is in the Atlantic Ocean and treated as "no data"
        // This is acceptable since real photos won't have (0,0) coordinates
        const zeroCoords: ExtractedExifData = {
          latitude: 0,
          longitude: 0,
        };

        const result = applyGpsPrivacy(zeroCoords, "CULTURAL_SITE");

        // Zero is falsy in JavaScript, so it's treated as missing
        expect(result.gpsPrivacyLevel).toBe("NONE");
      });

      it("should handle extreme precision values", () => {
        const extremeCoords: ExtractedExifData = {
          latitude: 14.8672345678901234567890,
          longitude: -24.7045678901234567890,
        };

        const result = applyGpsPrivacy(extremeCoords, "CULTURAL_SITE");

        // Should be truncated to 6 decimals
        expect(result.latitude?.toString().split(".")[1]?.length).toBeLessThanOrEqual(6);
      });

      it("should treat unknown photo type as PERSONAL (most restrictive)", () => {
        const result = applyGpsPrivacy(
          bravaCoordinates,
          "UNKNOWN_TYPE" as PhotoType
        );

        expect(result.gpsPrivacyLevel).toBe("STRIPPED");
        expect(result.latitude).toBeUndefined();
      });
    });
  });

  describe("GPS_PRECISION constants", () => {
    it("should have FULL precision of 6 decimals", () => {
      expect(GPS_PRECISION.FULL).toBe(6);
    });

    it("should have APPROXIMATE precision of 3 decimals", () => {
      expect(GPS_PRECISION.APPROXIMATE).toBe(3);
    });
  });

  describe("getPrivacyDescription", () => {
    it("should return correct description for FULL", () => {
      expect(getPrivacyDescription("FULL")).toBe("Exact location preserved");
    });

    it("should return correct description for APPROXIMATE", () => {
      expect(getPrivacyDescription("APPROXIMATE")).toBe("Location rounded to ~100m");
    });

    it("should return correct description for STRIPPED", () => {
      expect(getPrivacyDescription("STRIPPED")).toBe("Location removed");
    });

    it("should return correct description for NONE", () => {
      expect(getPrivacyDescription("NONE")).toBe("No location data");
    });
  });

  describe("getPhotoTypeDescription", () => {
    it("should return correct description for CULTURAL_SITE", () => {
      const desc = getPhotoTypeDescription("CULTURAL_SITE");
      expect(desc).toContain("Cultural Site");
      expect(desc).toContain("Full GPS");
    });

    it("should return correct description for COMMUNITY_EVENT", () => {
      const desc = getPhotoTypeDescription("COMMUNITY_EVENT");
      expect(desc).toContain("Community Event");
      expect(desc).toContain("100m");
    });

    it("should return correct description for PERSONAL", () => {
      const desc = getPhotoTypeDescription("PERSONAL");
      expect(desc).toContain("Personal");
      expect(desc).toContain("removed");
    });
  });

  describe("BRAVA_BOUNDS constants", () => {
    it("should define valid bounds for Brava Island", () => {
      expect(BRAVA_BOUNDS.minLat).toBeLessThan(BRAVA_BOUNDS.maxLat);
      expect(BRAVA_BOUNDS.minLon).toBeLessThan(BRAVA_BOUNDS.maxLon);

      // Brava is in the northern hemisphere
      expect(BRAVA_BOUNDS.minLat).toBeGreaterThan(0);

      // Brava is in the western hemisphere (Cape Verde)
      expect(BRAVA_BOUNDS.maxLon).toBeLessThan(0);
    });
  });

  describe("isWithinBravaIsland", () => {
    it("should return true for coordinates within Brava", () => {
      // Vila Nova Sintra approximate location
      expect(isWithinBravaIsland(14.867, -24.705)).toBe(true);
    });

    it("should return true for coordinates at bounds", () => {
      expect(isWithinBravaIsland(BRAVA_BOUNDS.minLat, BRAVA_BOUNDS.minLon)).toBe(true);
      expect(isWithinBravaIsland(BRAVA_BOUNDS.maxLat, BRAVA_BOUNDS.maxLon)).toBe(true);
    });

    it("should return false for coordinates outside Brava", () => {
      // Praia, Santiago (different island)
      expect(isWithinBravaIsland(14.9167, -23.5167)).toBe(false);

      // Random location far away
      expect(isWithinBravaIsland(40.7128, -74.006)).toBe(false);
    });

    it("should return false for coordinates just outside bounds", () => {
      expect(isWithinBravaIsland(BRAVA_BOUNDS.minLat - 0.01, -24.7)).toBe(false);
      expect(isWithinBravaIsland(14.85, BRAVA_BOUNDS.minLon - 0.01)).toBe(false);
    });
  });
});
