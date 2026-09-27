import { describe, expect, it } from "vitest";

import {
  ALL_PLACES,
  UNPLACED,
  dayOfYear,
  featureOfDay,
  filterByPlace,
  firstMissingField,
  indexHelpLine,
  legacyPlaceParam,
  moreFrom,
  moreFromTitle,
  needsHelpPool,
  parsePlaceParam,
  photoCaption,
  photoEyebrow,
  photoHeading,
  photoLine,
  photoMeta,
  photographHref,
  photographsHref,
  placeChips,
  placeLabel,
  stepWithin,
  toArchivePhoto,
  toArchivePhotos,
  viewerHelpLine,
  type ArchivePhoto,
} from "@/lib/archive-photographs";
import type {
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

function town(
  slug: string,
  name: string,
  latitude: number,
  longitude: number
): TownStatusSummary {
  return {
    id: slug,
    slug,
    name,
    description: "",
    latitude,
    longitude,
    entryCount: 0,
    hasPhotograph: false,
    status: "NAME_ONLY",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
  };
}

const TOWNS = [
  town("nova-sintra", "Nova Sintra", 14.8632, -24.7183),
  town("lomba-tantun", "Lomba Tantun", 14.8482, -24.6992),
  town("furna", "Furna", 14.8725, -24.6935),
];

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "m-1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-07-12T10:00:00Z",
    publicUrl: "https://cdn.example/a.jpg",
    ...overrides,
  };
}

function photo(overrides: Partial<ArchivePhoto> = {}): ArchivePhoto {
  return {
    id: "p",
    src: null,
    alt: "",
    title: null,
    description: null,
    near: null,
    monthYear: null,
    dateLabel: null,
    camera: null,
    category: null,
    identifiablePerson: false,
    missing: { photographer: true, date: true },
    ...overrides,
  };
}

const NS = { slug: "nova-sintra", name: "Nova Sintra" };
const LT = { slug: "lomba-tantun", name: "Lomba Tantun" };

describe("toArchivePhoto", () => {
  it("joins the nearest settlement and formats the dates", () => {
    const p = toArchivePhoto(
      upload({
        latitude: 14.8628,
        longitude: -24.7176,
        dateTaken: "2024-07-12T10:00:00Z",
        cameraMake: "DJI",
        cameraModel: "FC3582",
        category: "Landscape",
        altText: "Red-tiled rooftops",
        width: 4032,
        height: 3024,
      }),
      TOWNS
    );
    expect(p.near).toEqual(NS);
    expect(p.monthYear).toBe("July 2024");
    expect(p.dateLabel).toBe("July 12, 2024");
    expect(p.camera).toBe("DJI FC3582");
    expect(p.alt).toBe("Red-tiled rooftops");
    expect(p.missing).toEqual({ photographer: true, date: false });
  });

  it("falls back to an approximate date and a heading for alt", () => {
    const p = toArchivePhoto(
      upload({
        approximateDate: "sometime in the sixties",
        photographerCredit: "Ana",
      }),
      TOWNS
    );
    expect(p.near).toBeNull();
    expect(p.monthYear).toBe("sometime in the sixties");
    expect(p.alt).toBe("A photograph of Brava");
    expect(p.missing.photographer).toBe(false);
  });

  it("drops films from the dataset", () => {
    const film = {
      ...upload(),
      mediaSource: "EXTERNAL",
      mediaType: "VIDEO",
    } as unknown as PublicExternalMedia;
    const image = {
      ...upload({ id: "ext" }),
      mediaSource: "EXTERNAL",
      mediaType: "IMAGE",
    } as unknown as PublicExternalMedia;
    const ids = toArchivePhotos([upload(), film, image], TOWNS).map(
      (p) => p.id
    );
    expect(ids).toEqual(["m-1", "ext"]);
  });
});

describe("place chips and filter", () => {
  const photos = [
    photo({ id: "1", near: NS }),
    photo({ id: "2", near: LT }),
    photo({ id: "3", near: NS }),
    photo({ id: "4" }),
  ];

  it("lists All, settlements by count, then Not yet placed", () => {
    expect(placeChips(photos)).toEqual([
      { key: ALL_PLACES, label: "All", count: 4 },
      { key: "nova-sintra", label: "Nova Sintra", count: 2 },
      { key: "lomba-tantun", label: "Lomba Tantun", count: 1 },
      { key: UNPLACED, label: "Not yet placed", count: 1 },
    ]);
  });

  it("orders equal counts by name and keeps Not yet placed at zero", () => {
    const chips = placeChips([
      photo({ id: "1", near: NS }),
      photo({ id: "2", near: LT }),
    ]);
    expect(chips.map((c) => c.key)).toEqual([
      ALL_PLACES,
      "lomba-tantun",
      "nova-sintra",
      UNPLACED,
    ]);
    expect(chips[3].count).toBe(0);
  });

  it("filters by all, a slug and unplaced", () => {
    expect(filterByPlace(photos, ALL_PLACES)).toHaveLength(4);
    expect(filterByPlace(photos, "nova-sintra").map((p) => p.id)).toEqual([
      "1",
      "3",
    ]);
    expect(filterByPlace(photos, UNPLACED).map((p) => p.id)).toEqual(["4"]);
  });

  it("parses ?place= against the dataset", () => {
    expect(parsePlaceParam(undefined, photos)).toBe(ALL_PLACES);
    expect(parsePlaceParam("unplaced", photos)).toBe(UNPLACED);
    expect(parsePlaceParam("nova-sintra", photos)).toBe("nova-sintra");
    expect(parsePlaceParam("furna", photos)).toBe(ALL_PLACES);
  });

  it("maps the legacy params", () => {
    expect(legacyPlaceParam({ filter: "noplace" })).toBe(UNPLACED);
    expect(legacyPlaceParam({ filter: "place" })).toBe(ALL_PLACES);
    expect(legacyPlaceParam({ filter: "films" })).toBe(ALL_PLACES);
    expect(legacyPlaceParam({ region: "furna", filter: "place" })).toBe(
      "furna"
    );
    expect(legacyPlaceParam({})).toBeNull();
  });

  it("labels the filter and builds URLs", () => {
    expect(placeLabel(ALL_PLACES, photos)).toBe("");
    expect(placeLabel(UNPLACED, photos)).toBe("Not yet placed");
    expect(placeLabel("nova-sintra", photos)).toBe("Nova Sintra");
    expect(photographsHref(ALL_PLACES)).toBe("/photographs");
    expect(photographsHref("nova-sintra")).toBe(
      "/photographs?place=nova-sintra"
    );
    expect(photographHref("x", ALL_PLACES)).toBe("/photographs/x");
    expect(photographHref("x", UNPLACED)).toBe("/photographs/x?place=unplaced");
  });
});

describe("featureOfDay", () => {
  const day = (n: number) => new Date(Date.UTC(2026, 0, n, 12));

  it("rotates through described, placed photographs by day of year", () => {
    const photos = [
      photo({ id: "a", near: NS, description: "One" }),
      photo({ id: "b", near: NS }),
      photo({ id: "c", near: LT, description: "Two" }),
      photo({ id: "d", description: "Three" }),
    ];
    expect(dayOfYear(day(1))).toBe(1);
    expect(featureOfDay(photos, day(1))?.id).toBe("c");
    expect(featureOfDay(photos, day(2))?.id).toBe("a");
  });

  it("does not count a description that repeats the title", () => {
    const photos = [
      photo({ id: "a", near: NS, title: "Same", description: "Same" }),
      photo({ id: "b", near: LT }),
    ];
    // No described photograph: falls back to the located ones.
    expect(featureOfDay(photos, day(2))?.id).toBe("a");
    expect(featureOfDay(photos, day(3))?.id).toBe("b");
  });

  it("falls back to any photograph, and skips unvouched people", () => {
    expect(featureOfDay([photo({ id: "x" })], day(5))?.id).toBe("x");
    expect(
      featureOfDay(
        [
          photo({
            id: "x",
            identifiablePerson: true,
            near: NS,
            description: "d",
          }),
        ],
        day(5)
      )
    ).toBeNull();
    expect(featureOfDay([], day(5))).toBeNull();
  });
});

describe("stepping and more from", () => {
  const list = [photo({ id: "1" }), photo({ id: "2" }), photo({ id: "3" })];

  it("wraps at both ends", () => {
    expect(stepWithin(list, "3", 1)?.id).toBe("1");
    expect(stepWithin(list, "1", -1)?.id).toBe("3");
    expect(stepWithin(list, "2", 1)?.id).toBe("3");
    expect(stepWithin([], "2", 1)).toBeNull();
  });

  it("returns up to six from the same place, or other unplaced ones", () => {
    const placed = Array.from({ length: 8 }, (_, i) =>
      photo({ id: `n${i}`, near: NS })
    );
    const unplaced = [photo({ id: "u1" }), photo({ id: "u2" })];
    const all = [...placed, ...unplaced, photo({ id: "l", near: LT })];

    const more = moreFrom(placed[0], all);
    expect(more).toHaveLength(6);
    expect(more.every((p) => p.near?.slug === "nova-sintra")).toBe(true);
    expect(more.some((p) => p.id === "n0")).toBe(false);

    expect(moreFrom(unplaced[0], all).map((p) => p.id)).toEqual(["u2"]);
    expect(moreFromTitle(placed[0])).toBe("More from Nova Sintra");
    expect(moreFromTitle(unplaced[0])).toBe("Also waiting for a place");
  });
});

describe("copy", () => {
  it("builds the heading, caption, line, meta and eyebrow", () => {
    expect(photoHeading(photo({ title: "Lomba Tantun", near: LT }))).toBe(
      "Lomba Tantun"
    );
    expect(photoHeading(photo({ near: NS }))).toBe("Near Nova Sintra");
    expect(photoHeading(photo())).toBe("A photograph of Brava");

    expect(photoCaption(photo({ title: "A", description: "A" }))).toBeNull();
    expect(photoCaption(photo({ description: "Rooftops." }))).toBe("Rooftops.");

    expect(photoLine(photo({ near: NS, monthYear: "July 2024" }))).toBe(
      "Near Nova Sintra · July 2024"
    );
    expect(photoLine(photo({ monthYear: "July 2024" }))).toBe("July 2024");
    expect(photoLine(photo())).toBeNull();

    expect(
      photoMeta(photo({ dateLabel: "July 12, 2024", camera: "DJI FC3582" }))
    ).toBe("July 12, 2024 · DJI FC3582");
    expect(photoMeta(photo())).toBeNull();

    expect(photoEyebrow(photo({ category: "Landscape" }))).toBe(
      "Photograph · Landscape"
    );
    expect(photoEyebrow(photo())).toBe("Photograph");
  });

  it("names only what the viewer record is missing", () => {
    expect(viewerHelpLine(photo())).toBe(
      "Not yet recorded: who took it, where and when."
    );
    expect(
      viewerHelpLine(
        photo({ near: NS, missing: { photographer: true, date: true } })
      )
    ).toBe("Not yet recorded: who took it and when.");
    expect(
      viewerHelpLine(
        photo({ near: NS, missing: { photographer: true, date: false } })
      )
    ).toBe("Not yet recorded: who took it.");
    expect(
      viewerHelpLine(
        photo({ near: NS, missing: { photographer: false, date: false } })
      )
    ).toBeNull();
    expect(
      firstMissingField(photo({ missing: { photographer: false, date: true } }))
    ).toBe("place");
  });

  it("follows the real counts in the index help line", () => {
    const uncredited = (near: typeof NS | null) =>
      photo({
        near,
        missing: { photographer: true, date: false },
      });
    const credited = (near: typeof NS | null) =>
      photo({
        near,
        missing: { photographer: false, date: false },
      });

    expect(
      indexHelpLine([
        uncredited(NS),
        ...Array.from({ length: 6 }, () => uncredited(null)),
      ])
    ).toBe(
      "Every photograph here is still missing its photographer, and six have no place. Recognise one?"
    );
    expect(indexHelpLine([uncredited(NS), uncredited(null)])).toBe(
      "Every photograph here is still missing its photographer, and one has no place. Recognise one?"
    );
    expect(indexHelpLine([uncredited(NS)])).toBe(
      "Every photograph here is still missing its photographer. Recognise one?"
    );
    expect(
      indexHelpLine([uncredited(NS), uncredited(null), credited(NS)])
    ).toBe(
      "Two photographs are still missing a photographer, and one has no place. Recognise one?"
    );
    expect(indexHelpLine([credited(NS), credited(null), credited(null)])).toBe(
      "Two photographs have no place yet. Recognise one?"
    );
    expect(indexHelpLine([credited(NS)])).toBeNull();
    expect(indexHelpLine([])).toBeNull();
  });

  it("picks help from unplaced photographs first", () => {
    const placed = photo({ id: "a", near: NS });
    const unplaced = photo({ id: "b" });
    expect(needsHelpPool([placed, unplaced])).toEqual({
      photos: [unplaced],
      place: UNPLACED,
    });
    expect(needsHelpPool([placed]).place).toBe(ALL_PLACES);
  });
});
