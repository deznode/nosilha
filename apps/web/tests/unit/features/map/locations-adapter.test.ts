import { describe, it, expect } from "vitest";
import {
  filterItems,
  photoItems,
  recordItems,
  settlementItems,
  statusCounts,
} from "@/features/map/data/locations-adapter";
import type { MapItem } from "@/features/map/data/types";
import type { DirectoryEntry } from "@/types/directory";
import type {
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function entry(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-000000000001",
    slug: "nos-raiz",
    name: "Nos Raiz",
    category: "Hotel",
    imageUrl: null,
    town: "Fajã d'Água",
    townId: "town-faja",
    latitude: 14.87306,
    longitude: -24.73194,
    description: "A guesthouse by the pools.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    tags: [],
    details: null,
    ...overrides,
  } as DirectoryEntry;
}

function town(overrides: Partial<TownStatusSummary> = {}): TownStatusSummary {
  return {
    id: "town-faja",
    slug: "faja-de-agua",
    name: "Fajã d'Água",
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

function photo(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "media-1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://r2.example/DJI_0047.JPG",
    originalName: "DJI_0047.JPG",
    latitude: 14.8601,
    longitude: -24.7102,
    ...overrides,
  };
}

const film: PublicExternalMedia = {
  id: "film-1",
  title: "Explorando Furna",
  description: null,
  category: null,
  displayOrder: 0,
  mediaSource: "EXTERNAL",
  altText: null,
  createdAt: "2024-01-01T00:00:00Z",
  mediaType: "VIDEO",
  platform: "YOUTUBE",
  externalId: "abc",
  url: null,
  thumbnailUrl: null,
  embedUrl: null,
  author: null,
};

// ─── settlementItems ─────────────────────────────────────────────────────────

describe("settlementItems", () => {
  it("keys a settlement by its slug and carries its status and counts", () => {
    const [item] = settlementItems([
      town({ entryCount: 5, photographCount: 2 }),
    ]);

    expect(item).toMatchObject({
      key: "s:faja-de-agua",
      kind: "settlement",
      name: "Fajã d'Água",
      eyebrow: "Settlement",
      status: "partial",
      hasRecords: true,
      recordCount: 5,
      photographCount: 2,
      coordinates: { lat: 14.87306, lng: -24.73194 },
      href: "/faja-de-agua",
      regionSlug: "faja-de-agua",
    });
  });

  it("maps the backend's three states onto the status table", () => {
    const statuses = settlementItems([
      town({ slug: "a", status: "DOCUMENTED" }),
      town({ slug: "b", status: "PARTIAL" }),
      town({ slug: "c", status: "NAME_ONLY", entryCount: 0 }),
    ]).map((i) => i.status);

    expect(statuses).toEqual(["documented", "partial", "name"]);
  });

  it("says a name-only settlement has no records", () => {
    const [item] = settlementItems([
      town({ status: "NAME_ONLY", entryCount: 0 }),
    ]);
    expect(item.hasRecords).toBe(false);
    // Every settlement has a page, even one that is only a name.
    expect(item.href).toBe("/faja-de-agua");
  });
});

// ─── recordItems ─────────────────────────────────────────────────────────────

describe("recordItems", () => {
  const slugs = { "town-faja": "faja-de-agua" };

  it("keys a record by its entry slug and links it under its settlement", () => {
    const [item] = recordItems([entry()], slugs);

    expect(item).toMatchObject({
      key: "r:nos-raiz",
      kind: "record",
      name: "Nos Raiz",
      townName: "Fajã d'Água",
      href: "/faja-de-agua/nos-raiz",
      regionSlug: "faja-de-agua",
      hasRecords: false,
    });
  });

  it("names the category as the archive does", () => {
    const [hotel, church] = recordItems(
      [entry(), entry({ slug: "igreja", category: "Church" })],
      slugs
    );
    expect(hotel.eyebrow).toBe("Stay");
    expect(church.eyebrow).toBe("Church");
  });

  it("is documented with a photograph and partial without, never name-only", () => {
    const [withPhoto, without] = recordItems(
      [
        entry({ slug: "a", imageUrl: "https://r2.example/hero.jpg" }),
        entry({ slug: "b", imageUrl: null }),
      ],
      slugs
    );
    expect(withPhoto.status).toBe("documented");
    expect(without.status).toBe("partial");
  });

  it("has no page when its settlement has not resolved", () => {
    const [item] = recordItems([entry({ townId: null })], slugs);
    expect(item.href).toBeNull();
    expect(item.regionSlug).toBeNull();
  });

  it("drops a record without coordinates, which has nowhere to pin", () => {
    const items = recordItems(
      [entry({ latitude: null as unknown as number })],
      slugs
    );
    expect(items).toEqual([]);
  });
});

// ─── photoItems ──────────────────────────────────────────────────────────────

describe("photoItems", () => {
  const towns = [
    town(),
    town({
      id: "town-nova",
      slug: "nova-sintra",
      name: "Nova Sintra",
      latitude: 14.861,
      longitude: -24.711,
    }),
  ];

  it("pins a located upload with its thumbnail, filename and page", () => {
    const [item] = photoItems([photo()], towns);

    expect(item).toMatchObject({
      key: "p:media-1",
      kind: "photo",
      name: "Untitled",
      eyebrow: "Photograph",
      status: "partial",
      image: "https://r2.example/DJI_0047.JPG",
      filename: "DJI_0047.JPG",
      placeName: null,
      credit: null,
      href: "/photographs/media-1",
      hasRecords: false,
    });
  });

  it("narrows to the nearest settlement", () => {
    const [item] = photoItems([photo()], towns);
    expect(item.regionSlug).toBe("nova-sintra");
  });

  it("skips films and unlocated uploads, which have no point", () => {
    const items = photoItems(
      [film, photo({ id: "x", latitude: undefined, longitude: undefined })],
      towns
    );
    expect(items).toEqual([]);
  });

  it("shows no thumbnail of an identifiable person nobody has vouched for", () => {
    const [item] = photoItems([photo({ identifiablePerson: true })], towns);
    expect(item.image).toBeUndefined();
  });

  it("carries the recorded title, place name and credit", () => {
    const [item] = photoItems(
      [
        photo({
          title: "Harbour at dusk",
          locationName: "Furna",
          photographerCredit: "Maria Lopes",
        }),
      ],
      towns
    );
    expect(item).toMatchObject({
      name: "Harbour at dusk",
      placeName: "Furna",
      credit: "Maria Lopes",
    });
  });
});

// ─── filterItems / statusCounts ──────────────────────────────────────────────

function item(key: string, name: string, status: MapItem["status"]): MapItem {
  return {
    key,
    kind: "settlement",
    name,
    eyebrow: "Settlement",
    description: "",
    coordinates: { lat: 14.86, lng: -24.7 },
    status,
    hasRecords: false,
    href: null,
    regionSlug: null,
  };
}

const items = [
  item("s:a", "Nova Sintra", "documented"),
  item("s:b", "Fajã d'Água", "partial"),
  item("s:c", "Furna", "name"),
  item("s:d", "Cachaço", "name"),
];

describe("filterItems", () => {
  it("returns everything for all and no query", () => {
    expect(filterItems(items, "all", "")).toEqual(items);
  });

  it("keeps one status", () => {
    expect(filterItems(items, "name", "").map((i) => i.key)).toEqual([
      "s:c",
      "s:d",
    ]);
  });

  it("matches the query against the name, ignoring case and accents", () => {
    expect(filterItems(items, "all", "  FAJA ").map((i) => i.key)).toEqual([
      "s:b",
    ]);
    expect(filterItems(items, "all", "cachaco").map((i) => i.key)).toEqual([
      "s:d",
    ]);
  });

  it("applies status and query together", () => {
    expect(filterItems(items, "partial", "furna")).toEqual([]);
  });
});

describe("statusCounts", () => {
  it("counts every state, zero included", () => {
    expect(statusCounts(items)).toEqual({
      documented: 1,
      partial: 1,
      name: 2,
    });
    expect(statusCounts([])).toEqual({ documented: 0, partial: 0, name: 0 });
  });
});
