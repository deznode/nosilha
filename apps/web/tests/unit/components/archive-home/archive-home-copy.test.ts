import { describe, expect, it } from "vitest";

import {
  SHIPPED_HERO,
  emptySettlementChipLink,
  emptySettlementsStandfirst,
  heroCreditChip,
  heroStandfirst,
  photographRowHeading,
  photographRowNote,
  pickHero,
  pickPhotographRow,
  routeCards,
} from "@/components/archive-home/archive-home-copy";
import type {
  GalleryFacets,
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

function town(overrides: Partial<TownStatusSummary> = {}): TownStatusSummary {
  return {
    id: "t",
    slug: "slug",
    name: "Name",
    description: "",
    latitude: 14.86,
    longitude: -24.71,
    entryCount: 0,
    hasPhotograph: false,
    status: "NAME_ONLY",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
    ...overrides,
  };
}

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "m",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/a.jpg",
    originalName: "a.jpg",
    width: 388,
    height: 300,
    ...overrides,
  };
}

const FACETS: GalleryFacets = {
  total: 26,
  photographs: 17,
  films: 9,
  withPlace: 11,
  withoutPlace: 15,
  withoutDate: 14,
  uncredited: 26,
};

/** Spec 034 T-25 / FR-006 — the home page states the archive, not a claim about it. */
describe("heroStandfirst", () => {
  it("counts settlements, place records and photographs in words", () => {
    expect(
      heroStandfirst({ settlements: 25, records: 8, facets: FACETS })
    ).toBe(
      "Twenty-five settlements, eight place records, seventeen photographs. " +
        "Most of it is still missing, and every gap here is a question."
    );
  });

  it("agrees in number when the archive holds one of something", () => {
    expect(
      heroStandfirst({
        settlements: 1,
        records: 1,
        facets: { ...FACETS, photographs: 1 },
      })
    ).toBe(
      "One settlement, one place record, one photograph. " +
        "Most of it is still missing, and every gap here is a question."
    );
  });
});

describe("heroCreditChip", () => {
  it("names the credit, the source and the missing place", () => {
    expect(
      heroCreditChip(
        upload({
          photographerCredit: "NosIlha, 2024",
          archiveSource: "CC BY-SA 4.0",
        })
      )
    ).toBe("NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded");
  });

  it("says the photographer is not recorded rather than leaving a gap", () => {
    expect(heroCreditChip(upload())).toBe(
      "photographer not recorded · place not yet recorded"
    );
  });

  it("names the place when the record carries one", () => {
    expect(
      heroCreditChip(
        upload({
          photographerCredit: "Ana Lopes",
          latitude: 14.86,
          longitude: -24.71,
          locationName: "Fajã d'Água",
        })
      )
    ).toBe("Ana Lopes · Fajã d'Água");
  });

  it("admits a coordinate without a name", () => {
    expect(heroCreditChip(upload({ latitude: 14.86, longitude: -24.71 }))).toBe(
      "photographer not recorded · place not named"
    );
  });

  it("is null when there is no hero to credit", () => {
    expect(heroCreditChip(null)).toBeNull();
  });
});

describe("routeCards", () => {
  const towns = [
    town({
      slug: "monte",
      status: "DOCUMENTED",
      entryCount: 1,
      hasPhotograph: true,
    }),
    town({ slug: "nova-sintra", status: "PARTIAL", entryCount: 5 }),
    ...Array.from({ length: 23 }, (_, i) => town({ slug: `e${i}` })),
  ];

  it("notes each destination from live counts", () => {
    const cards = routeCards({
      towns,
      facets: FACETS,
      stays: 4,
      ratedStays: 0,
    });

    expect(cards).toEqual([
      {
        label: "Settlements",
        href: "/settlements",
        note: "Twenty-five names. One documented.",
      },
      {
        label: "Photographs",
        href: "/photographs",
        note: "Twenty-six records. None credited.",
      },
      {
        label: "Map",
        href: "/map",
        note: "Every point we hold, coloured by what is known.",
      },
      { label: "Stay", href: "/stay", note: "Four places. None rated." },
    ]);
  });

  it("counts the credited records once any exist", () => {
    const cards = routeCards({
      towns,
      facets: { ...FACETS, uncredited: 24 },
      stays: 4,
      ratedStays: 1,
    });

    expect(cards[1].note).toBe("Twenty-six records. Two credited.");
    expect(cards[3].note).toBe("Four places. One rated.");
  });

  it("says so when there is nothing to stay in", () => {
    const cards = routeCards({
      towns,
      facets: FACETS,
      stays: 0,
      ratedStays: 0,
    });

    expect(cards[3].note).toBe("No place to stay is recorded yet.");
  });
});

describe("photographRow", () => {
  it("heads the row with the number it actually shows", () => {
    expect(photographRowHeading(4)).toBe(
      "Four photographs, and what each one is missing"
    );
    expect(photographRowHeading(1)).toBe(
      "One photograph, and what it is missing"
    );
  });

  it("says nobody has credited any of them when none is credited", () => {
    expect(photographRowNote([upload(), upload()])).toBe(
      "Nobody has told us who took any of these."
    );
  });

  it("counts the uncredited ones once some are credited", () => {
    expect(
      photographRowNote([upload(), upload({ photographerCredit: "Ana Lopes" })])
    ).toBe("One of these has no photographer.");
  });

  it("says so when every one is credited", () => {
    expect(
      photographRowNote([upload({ photographerCredit: "Ana Lopes" })])
    ).toBe("Every one of these names its photographer.");
  });
});

describe("pickPhotographRow", () => {
  it("takes four records", () => {
    const pool = Array.from({ length: 10 }, (_, i) => upload({ id: `m${i}` }));

    expect(pickPhotographRow(pool)).toHaveLength(4);
  });

  it("never shows an identifiable person nobody has vouched for", () => {
    const pool = [
      upload({ id: "a", identifiablePerson: true }),
      upload({ id: "b" }),
      upload({ id: "c", identifiablePerson: true }),
      upload({ id: "d" }),
    ];

    expect(pickPhotographRow(pool).map((p) => p.id)).toEqual(["b", "d"]);
  });

  it("skips a record with no image to show", () => {
    const pool = [upload({ id: "a", publicUrl: null }), upload({ id: "b" })];

    expect(pickPhotographRow(pool).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("emptySettlements", () => {
  it("counts the empty ones against the whole island", () => {
    expect(emptySettlementsStandfirst(22, 25)).toBe(
      "Twenty-two of the twenty-five have a name and a point on the map and " +
        "nothing else. No photograph, no description, no record of who lives there."
    );
  });

  it("says so when every settlement holds something", () => {
    expect(emptySettlementsStandfirst(0, 25)).toBe(
      "Every settlement on the island holds something."
    );
  });

  it("selects the settlement on the map, filtered to the name-only pins", () => {
    expect(emptySettlementChipLink(town({ slug: "cova-joana" }))).toBe(
      "/map?mode=settlements&status=name&sel=s%3Acova-joana"
    );
  });
});

describe("pickHero", () => {
  function film(): PublicExternalMedia {
    return {
      id: "f1",
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
      url: "https://youtu.be/abc",
      thumbnailUrl: null,
      embedUrl: null,
      author: "Nos Ilha",
    };
  }

  it("takes an archive photograph", () => {
    const photo = upload({ id: "hero" });
    expect(pickHero(photo)).toBe(photo);
  });

  it("refuses a film: a video thumbnail is not a photograph of the island", () => {
    // The film carries a `publicUrl` it has no business having, so the refusal has to
    // come from the media-source check rather than from the later image check. Without
    // that stray field the test passes even with the check deleted.
    const mislabelled = { ...film(), publicUrl: "https://cdn.example/x.jpg" };

    expect(pickHero(mislabelled as never)).toBeNull();
  });

  it("refuses an identifiable person nobody has vouched for", () => {
    expect(pickHero(upload({ identifiablePerson: true }))).toBeNull();
  });

  it("refuses a record with no image to show", () => {
    expect(pickHero(upload({ publicUrl: null }))).toBeNull();
  });

  it("is null when the featured slot is empty", () => {
    expect(pickHero(null)).toBeNull();
  });
});

describe("SHIPPED_HERO", () => {
  it("states its credit and the place it does not record", () => {
    expect(SHIPPED_HERO.credit).toBe(
      "NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded"
    );
  });
});
