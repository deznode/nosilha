import { describe, expect, it } from "vitest";

import { nearestSettlement } from "@/lib/nearest-settlement";

const SETTLEMENTS = [
  {
    slug: "nova-sintra",
    name: "Nova Sintra",
    latitude: 14.8632,
    longitude: -24.7183,
  },
  {
    slug: "faja-d-agua",
    name: "Fajã d'Água",
    latitude: 14.8555,
    longitude: -24.7318,
  },
  {
    slug: "nossa-senhora-do-monte",
    name: "Nossa Senhora do Monte",
    latitude: 14.856,
    longitude: -24.728,
  },
  {
    slug: "lomba-tantun",
    name: "Lomba Tantun",
    latitude: 14.8482,
    longitude: -24.6992,
  },
];

describe("nearestSettlement", () => {
  it("returns the closest settlement within the threshold", () => {
    expect(nearestSettlement(14.8628, -24.7176, SETTLEMENTS)?.slug).toBe(
      "nova-sintra"
    );
    expect(nearestSettlement(14.848, -24.699, SETTLEMENTS)?.slug).toBe(
      "lomba-tantun"
    );
  });

  it("picks the nearer of two close settlements", () => {
    // Both are within 0.02°: ~0.0007 from Fajã d'Água, ~0.0032 from the Monte.
    expect(nearestSettlement(14.8558, -24.7312, SETTLEMENTS)?.slug).toBe(
      "faja-d-agua"
    );
  });

  it("returns null at or beyond the threshold", () => {
    // At the origin so the distance is exact, not float noise around 14.86.
    const one = [{ slug: "o", name: "Origin", latitude: 0, longitude: 0 }];
    expect(nearestSettlement(0.0199, 0, one)?.slug).toBe("o");
    expect(nearestSettlement(0.02, 0, one)).toBeNull();
    expect(nearestSettlement(0.012, 0.016, one)).toBeNull(); // 3-4-5: exactly 0.02
    expect(nearestSettlement(14.8632 + 0.05, -24.7183, SETTLEMENTS)).toBeNull();
  });

  it("honours a custom threshold", () => {
    expect(
      nearestSettlement(14.8632 + 0.01, -24.7183, SETTLEMENTS, 0.005)
    ).toBeNull();
  });

  it("keeps the first-listed settlement on a tie", () => {
    const tie = [
      { slug: "a", name: "A", latitude: 0.01, longitude: 0 },
      { slug: "b", name: "B", latitude: -0.01, longitude: 0 },
    ];
    expect(nearestSettlement(0, 0, tie)?.slug).toBe("a");
  });

  it("returns null for missing coordinates", () => {
    expect(nearestSettlement(null, -24.7, SETTLEMENTS)).toBeNull();
    expect(nearestSettlement(14.86, undefined, SETTLEMENTS)).toBeNull();
    expect(nearestSettlement(Number.NaN, -24.7, SETTLEMENTS)).toBeNull();
  });

  it("returns null for an empty settlement list", () => {
    expect(nearestSettlement(14.8632, -24.7183, [])).toBeNull();
  });
});
