import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  isDirectoryEntry,
  isTown,
  isTownStatusSummary,
  isGalleryFacets,
  isPhotoSequence,
  validateGalleryFacets,
  validatePhotoSequence,
} from "@/lib/api-validation";

/**
 * Spec 034 T-21 — the validators must accept every shape the API now sends and
 * reject the shapes it never sends. The fixtures below are trimmed copies of real
 * `/api/v1` responses.
 */

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const entry = {
  id: "33333333-3333-3333-3333-333333333333",
  name: "Igreja Nossa Senhora do Monte",
  slug: "igreja-nossa-senhora-do-monte",
  description: "Historic pilgrimage church established c. 1826.",
  tags: [],
  contentActions: null,
  town: "Nossa Senhora do Monte",
  latitude: 14.858,
  longitude: -24.718,
  imageUrl: "/images/directory/heritage/igreja.jpg",
  rating: null,
  reviewCount: 0,
  createdAt: "2026-03-06T13:33:46.446503Z",
  updatedAt: "2026-03-06T13:33:46.446503Z",
  category: "Heritage",
  townId: "8ca921dc-da2b-4a21-aa1b-4730b03c1adf",
  completeness: { documented: 7, total: 9, missingFields: ["openingHours"] },
  coincidentWith: null,
  details: {
    established: "c. 1826",
    conditionStatus: "under reconstruction since 2023",
    festival: "second weekend of August",
    architect: null,
  },
  heroImage: {
    mediaId: "763ce6b4-697a-4c4e-9f54-782ace7bb495",
    url: "/images/directory/heritage/igreja.jpg",
    photographerCredit: "Torbenbrinker",
    archiveSource: "Wikimedia Commons, CC BY-SA 3.0, 2010",
  },
};

describe("isDirectoryEntry — spec 034 fields", () => {
  it("accepts an entry carrying townId, completeness, heritage details and a hero", () => {
    expect(isDirectoryEntry(entry)).toBe(true);
  });

  it("accepts an entry with no hero and no canonical settlement", () => {
    expect(
      isDirectoryEntry({
        ...entry,
        imageUrl: null,
        heroImage: null,
        townId: null,
        details: null,
      })
    ).toBe(true);
  });

  it("accepts a coincident reference", () => {
    expect(
      isDirectoryEntry({
        ...entry,
        coincidentWith: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Praca Eugenio Tavares",
          slug: "praca-eugenio-tavares",
          category: "Heritage",
        },
      })
    ).toBe(true);
  });

  it("rejects a hero missing its url", () => {
    expect(
      isDirectoryEntry({
        ...entry,
        heroImage: { mediaId: "x", photographerCredit: null },
      })
    ).toBe(false);
  });

  it("rejects completeness that is not a pair of numbers", () => {
    expect(
      isDirectoryEntry({
        ...entry,
        completeness: { documented: "7", total: 9 },
      })
    ).toBe(false);
  });

  it("tolerates completeness being absent, for a client reading an older response", () => {
    const { completeness: _dropped, ...withoutCompleteness } = entry;
    expect(isDirectoryEntry(withoutCompleteness)).toBe(true);
  });
});

const town = {
  id: "8ca921dc-da2b-4a21-aa1b-4730b03c1adf",
  slug: "nova-sintra",
  name: "Nova Sintra",
  description: "The island town.",
  latitude: 14.86,
  longitude: -24.7,
  population: "1,432 (2010 census)",
  elevation: "520m",
  founded: null,
  highlights: [],
  createdAt: "2026-03-06T13:33:46Z",
  updatedAt: "2026-03-06T13:33:46Z",
};

describe("isTown — after the hero_image and gallery columns were dropped", () => {
  it("accepts a town that sends neither heroImage nor gallery", () => {
    expect(isTown(town)).toBe(true);
  });

  it("still rejects a town missing its coordinates", () => {
    const { latitude: _dropped, ...withoutLatitude } = town;
    expect(isTown(withoutLatitude)).toBe(false);
  });
});

const statusSummary = {
  id: "8ca921dc-da2b-4a21-aa1b-4730b03c1adf",
  slug: "nova-sintra",
  name: "Nova Sintra",
  description: "The island town.",
  latitude: 14.86,
  longitude: -24.7,
  entryCount: 5,
  hasPhotograph: false,
  status: "PARTIAL",
  population: "1,432 (2010 census)",
  elevation: "520m",
  photographCount: 0,
  unconfirmedPhotographCount: 5,
};

describe("isTownStatusSummary — spec 034 aggregates", () => {
  it("accepts a summary carrying population, elevation and both photograph counts", () => {
    expect(isTownStatusSummary(statusSummary)).toBe(true);
  });

  it("accepts null population and elevation", () => {
    expect(
      isTownStatusSummary({
        ...statusSummary,
        population: null,
        elevation: null,
      })
    ).toBe(true);
  });

  it("rejects a summary whose counts are not numbers", () => {
    expect(
      isTownStatusSummary({ ...statusSummary, unconfirmedPhotographCount: "5" })
    ).toBe(false);
  });
});

describe("isGalleryFacets", () => {
  const facets = {
    total: 26,
    photographs: 17,
    films: 9,
    withPlace: 11,
    withoutPlace: 6,
    withoutDate: 14,
    uncredited: 17,
  };

  it("accepts the seven counts", () => {
    expect(isGalleryFacets(facets)).toBe(true);
  });

  it("rejects a response missing a count", () => {
    const { uncredited: _dropped, ...incomplete } = facets;
    expect(isGalleryFacets(incomplete)).toBe(false);
  });

  it("validateGalleryFacets returns null rather than a partial object", () => {
    expect(validateGalleryFacets({ total: 26 })).toBeNull();
    expect(validateGalleryFacets(facets)).toEqual(facets);
  });
});

describe("isPhotoSequence", () => {
  const sequence = {
    id: "188a7f94-daa7-4a87-b2f6-c87add918295",
    position: 6,
    total: 11,
    previousId: "acc270b3-c9f7-4edc-95f6-d89c488ca37c",
    nextId: "6de67fc8-c40a-4c41-939d-a1bde31970f9",
  };

  it("accepts a positioned photograph with neighbours", () => {
    expect(isPhotoSequence(sequence)).toBe(true);
  });

  it("accepts an unlocated photograph: null position and no neighbours", () => {
    expect(
      isPhotoSequence({
        ...sequence,
        position: null,
        previousId: null,
        nextId: null,
      })
    ).toBe(true);
  });

  it("rejects a sequence with no total", () => {
    const { total: _dropped, ...incomplete } = sequence;
    expect(isPhotoSequence(incomplete)).toBe(false);
  });

  it("validatePhotoSequence returns null for a malformed payload", () => {
    expect(validatePhotoSequence({ id: "x" })).toBeNull();
    expect(validatePhotoSequence(sequence)).toEqual(sequence);
  });
});
