import { describe, it, expect } from "vitest";
import {
  STATUS_PIN_COLOR,
  transformEntries,
  transformSettlements,
  searchLocations,
} from "@/features/map/data/locations-adapter";
import type { DirectoryEntry } from "@/types/directory";
import type { TownStatusSummary } from "@/types/town";
import type { Location } from "@/features/map/data/types";
import { Sun } from "lucide-react";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function entryFixture(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-000000000001",
    slug: "test-beach",
    name: "Praia Test",
    category: "Beach",
    imageUrl: null,
    town: "Nova Sintra",
    latitude: 14.85,
    longitude: -24.7,
    description: "A beautiful test beach",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    tags: [],
    details: null,
    ...overrides,
  } as DirectoryEntry;
}

function settlementFixture(
  overrides: Partial<TownStatusSummary> = {}
): TownStatusSummary {
  return {
    id: "7061feee-74d8-4d52-97d5-c3f9b03bebc8",
    slug: "faja-de-agua",
    name: "Faja d'Agua",
    description: "A coastal village below the cliffs.",
    latitude: 14.87306,
    longitude: -24.73194,
    entryCount: 2,
    hasPhotograph: false,
    status: "PARTIAL",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
    ...overrides,
  };
}

function locationFixture(overrides: Partial<Location> = {}): Location {
  return {
    id: "loc-1",
    name: "Test Location",
    namePortuguese: "Test Location",
    category: "Beach",
    description: "A test location",
    coordinates: { lat: 14.85, lng: -24.7 },
    elevation: 0,
    image: "https://example.com/img.jpg",
    tags: ["beach"],
    icon: Sun,
    color: "#0EA5E9",
    status: { status: "documented", label: "has a photograph" },
    ...overrides,
  };
}

// ─── transformEntries ────────────────────────────────────────────────────────

describe("transformEntries", () => {
  it("converts a DirectoryEntry to a Location", () => {
    const entries = [entryFixture()];
    const result = transformEntries(entries);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1b2c3d4-e5f6-7890-abcd-000000000001");
    expect(result[0].name).toBe("Praia Test");
    expect(result[0].coordinates).toEqual({ lat: 14.85, lng: -24.7 });
    expect(result[0].category).toBe("Beach");
    expect(result[0].description).toBe("A beautiful test beach");
  });

  it("filters out entries without coordinates", () => {
    const entries = [
      entryFixture(),
      entryFixture({
        id: "no-coords",
        latitude: null as unknown as number,
        longitude: null as unknown as number,
      }),
    ];
    const result = transformEntries(entries);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1b2c3d4-e5f6-7890-abcd-000000000001");
  });

  it("maps native categories directly", () => {
    const entries = [
      entryFixture({
        category: "Town",
        tags: ["capital"],
        details: null,
      } as Partial<DirectoryEntry>),
    ];
    const result = transformEntries(entries);
    expect(result[0].category).toBe("Town");
  });

  it("maps Hotel to Accommodation via BACKEND_TO_MAP_CATEGORY", () => {
    const entries = [
      entryFixture({
        category: "Hotel",
        tags: ["luxury"],
        details: { amenities: ["pool"] },
      } as Partial<DirectoryEntry>),
    ];
    const result = transformEntries(entries);

    expect(result[0].category).toBe("Accommodation");
  });

  it("uses entry imageUrl when available", () => {
    const entries = [
      entryFixture({ imageUrl: "https://example.com/custom.jpg" }),
    ];
    const result = transformEntries(entries);

    expect(result[0].image).toBe("https://example.com/custom.jpg");
  });

  it("returns undefined image when no imageUrl", () => {
    const entries = [entryFixture({ imageUrl: null })];
    const result = transformEntries(entries);

    expect(result[0].image).toBeUndefined();
  });

  it("transforms multiple entries", () => {
    const entries = [
      entryFixture({ id: "1", name: "Beach One" }),
      entryFixture({ id: "2", name: "Beach Two" }),
      entryFixture({ id: "3", name: "Beach Three" }),
    ];
    const result = transformEntries(entries);

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).toEqual([
      "Beach One",
      "Beach Two",
      "Beach Three",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(transformEntries([])).toEqual([]);
  });

  it("computes detailUrl from slug and category", () => {
    const entries = [
      entryFixture({ slug: "igreja-nossa-senhora", category: "Heritage" }),
    ];
    const result = transformEntries(entries);

    expect(result[0].detailUrl).toBe(
      "/directory/heritage/igreja-nossa-senhora"
    );
  });

  it("sets detailUrl to undefined when slug is empty", () => {
    const entries = [entryFixture({ slug: "" })];
    const result = transformEntries(entries);

    expect(result[0].detailUrl).toBeUndefined();
  });
});

// ─── Pin colour (spec 033 FR-012) ────────────────────────────────────────────

describe("pin colour", () => {
  it("uses the light values of the status tokens", () => {
    expect(STATUS_PIN_COLOR).toEqual({
      documented: "#4F6E63",
      partial: "#3D5A73",
      name: "#7A5730",
    });
  });

  it("colours a record with a photograph as documented", () => {
    const [location] = transformEntries([
      entryFixture({ imageUrl: "https://example.com/p.jpg" }),
    ]);

    expect(location.color).toBe(STATUS_PIN_COLOR.documented);
    expect(location.status).toEqual({
      status: "documented",
      label: "has a photograph",
    });
  });

  it("colours a record without a photograph as records-no-photograph", () => {
    // Ochre means "a name and a coordinate, nothing else" (FR-002), which no place
    // record is. The handoff's records-mode legend counts zero name-only pins.
    const [location] = transformEntries([entryFixture({ imageUrl: null })]);

    expect(location.color).toBe(STATUS_PIN_COLOR.partial);
    expect(location.status).toEqual({
      status: "partial",
      label: "no photograph",
    });
  });

  it("colours equally documented records alike, whatever their kind", () => {
    const [beach, church] = transformEntries([
      entryFixture({ id: "1", category: "Beach" }),
      entryFixture({ id: "2", category: "Church" } as Partial<DirectoryEntry>),
    ]);

    expect(beach.color).toBe(church.color);
    expect(beach.icon).not.toBe(church.icon);
  });
});

// ─── transformSettlements ────────────────────────────────────────────────────

describe("transformSettlements", () => {
  it("pins a settlement at its recorded coordinates", () => {
    const [settlement] = transformSettlements([settlementFixture()]);

    expect(settlement.id).toBe("7061feee-74d8-4d52-97d5-c3f9b03bebc8");
    expect(settlement.name).toBe("Faja d'Agua");
    expect(settlement.description).toBe("A coastal village below the cliffs.");
    expect(settlement.coordinates).toEqual({ lat: 14.87306, lng: -24.73194 });
    expect(settlement.category).toBe("Town");
  });

  it.each([
    ["DOCUMENTED", "documented", "documented"],
    ["PARTIAL", "partial", "records, no photograph"],
    ["NAME_ONLY", "name", "name only"],
  ] as const)("colours a %s settlement as %s", (status, key, label) => {
    const [settlement] = transformSettlements([settlementFixture({ status })]);

    expect(settlement.color).toBe(STATUS_PIN_COLOR[key]);
    expect(settlement.status).toEqual({ status: key, label });
  });

  it("links nowhere until settlement pages exist", () => {
    const [settlement] = transformSettlements([settlementFixture()]);

    expect(settlement.detailUrl).toBeUndefined();
  });

  it("falls back to the slug when a settlement has no id", () => {
    const [settlement] = transformSettlements([
      settlementFixture({ id: null }),
    ]);

    expect(settlement.id).toBe("faja-de-agua");
  });
});

// ─── searchLocations ─────────────────────────────────────────────────────────

describe("searchLocations", () => {
  const locations: Location[] = [
    locationFixture({
      id: "1",
      name: "Praia Faja d'Agua",
      description: "Famous beach",
      tags: ["beach", "swimming"],
    }),
    locationFixture({
      id: "2",
      name: "Monte Fontainhas",
      description: "Scenic viewpoint",
      tags: ["viewpoint", "hiking"],
    }),
    locationFixture({
      id: "3",
      name: "Nossa Senhora do Monte",
      description: "Historic church",
      tags: ["church", "heritage"],
    }),
  ];

  it("returns all locations for empty query", () => {
    expect(searchLocations("", locations)).toHaveLength(3);
    expect(searchLocations("  ", locations)).toHaveLength(3);
  });

  it("matches by name (case-insensitive)", () => {
    const result = searchLocations("praia", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches by description", () => {
    const result = searchLocations("scenic", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("matches by tags", () => {
    const result = searchLocations("heritage", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("matches partial strings", () => {
    const result = searchLocations("font", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty array when no match", () => {
    const result = searchLocations("nonexistent", locations);
    expect(result).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const result = searchLocations("PRAIA", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("trims whitespace from query", () => {
    const result = searchLocations("  praia  ", locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
