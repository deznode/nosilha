import { describe, it, expect } from "vitest";
import {
  legendRows,
  listFooter,
  listStatusLine,
  overlayOffsets,
  photographsNote,
  popupContent,
  selectionCard,
} from "@/features/map/data/map-copy";
import type { MapItem } from "@/features/map/data/types";

function settlement(overrides: Partial<MapItem> = {}): MapItem {
  return {
    key: "s:nova-sintra",
    kind: "settlement",
    name: "Nova Sintra",
    eyebrow: "Settlement",
    description: "The island's capital, high in the hills.",
    coordinates: { lat: 14.861, lng: -24.711 },
    status: "partial",
    hasRecords: true,
    href: "/nova-sintra",
    regionSlug: "nova-sintra",
    recordCount: 5,
    hasPhotograph: false,
    photographCount: 0,
    ...overrides,
  };
}

function record(overrides: Partial<MapItem> = {}): MapItem {
  return {
    key: "r:nos-raiz",
    kind: "record",
    name: "Nos Raiz",
    eyebrow: "Stay",
    description: "A guesthouse by the pools.",
    coordinates: { lat: 14.87306, lng: -24.73194 },
    status: "partial",
    hasRecords: false,
    href: "/faja-de-agua/nos-raiz",
    regionSlug: "faja-de-agua",
    townName: "Fajã d'Água",
    ...overrides,
  };
}

function photo(overrides: Partial<MapItem> = {}): MapItem {
  return {
    key: "p:media-1",
    kind: "photo",
    name: "Untitled",
    eyebrow: "Photograph",
    description: "",
    coordinates: { lat: 14.86, lng: -24.71 },
    status: "partial",
    hasRecords: false,
    href: "/photographs/media-1",
    regionSlug: "nova-sintra",
    image: "https://r2.example/DJI_0047.JPG",
    filename: "DJI_0047.JPG",
    placeName: null,
    credit: null,
    ...overrides,
  };
}

// ─── listStatusLine ──────────────────────────────────────────────────────────

describe("listStatusLine", () => {
  it("counts a settlement's records in words", () => {
    expect(listStatusLine(settlement())).toBe("Five records, no photograph");
    expect(listStatusLine(settlement({ recordCount: 1 }))).toBe(
      "One record, no photograph"
    );
  });

  it("counts a settlement's photographs when it has them", () => {
    expect(
      listStatusLine(
        settlement({
          status: "documented",
          hasPhotograph: true,
          photographCount: 1,
        })
      )
    ).toBe("Five records, one photograph");
    expect(
      listStatusLine(
        settlement({
          status: "documented",
          hasPhotograph: true,
          photographCount: 3,
        })
      )
    ).toBe("Five records, three photographs");
  });

  it("does not deny a photograph the green dot vouches for", () => {
    // A hero counts toward the status but not toward photographCount.
    expect(
      listStatusLine(
        settlement({
          status: "documented",
          hasPhotograph: true,
          photographCount: 0,
        })
      )
    ).toBe("Five records, a photograph");
  });

  it("says what a name-only settlement is", () => {
    expect(
      listStatusLine(
        settlement({ status: "name", recordCount: 0, hasRecords: false })
      )
    ).toBe("a name and a coordinate, nothing else");
  });

  it("says whether a record has its photograph", () => {
    expect(listStatusLine(record({ status: "documented" }))).toBe(
      "one photograph"
    );
    expect(listStatusLine(record())).toBe("no photograph");
  });

  it("names what a photograph is missing", () => {
    expect(listStatusLine(photo())).toBe("no place name, no photographer");
    expect(listStatusLine(photo({ credit: "Maria Lopes" }))).toBe(
      "no place name"
    );
    expect(
      listStatusLine(photo({ credit: "Maria Lopes", placeName: "Furna" }))
    ).toBe("Furna · Maria Lopes");
  });
});

// ─── selectionCard ───────────────────────────────────────────────────────────

describe("selectionCard", () => {
  it("words a settlement with records", () => {
    expect(selectionCard(settlement())).toEqual({
      eyebrow: "Settlement",
      name: "Nova Sintra",
      status: "Five place records · no photograph",
      description: "The island's capital, high in the hills.",
      primaryLabel: "Open settlement",
    });
    expect(selectionCard(settlement({ recordCount: 1 })).status).toBe(
      "One place record · no photograph"
    );
  });

  it("words a name-only settlement, with the invitation when nothing is written", () => {
    const card = selectionCard(
      settlement({
        status: "name",
        recordCount: 0,
        hasRecords: false,
        description: "  ",
      })
    );
    expect(card.status).toBe("name only · nothing recorded here yet");
    expect(card.description).toBe(
      "Nothing is recorded here beyond the name and the point. If you know this place, the archive is listening."
    );
  });

  it("words a record", () => {
    expect(selectionCard(record())).toMatchObject({
      eyebrow: "Stay",
      status: "no photograph recorded",
      primaryLabel: "Open record",
    });
    expect(selectionCard(record({ status: "documented" })).status).toBe(
      "documented · one photograph"
    );
  });

  it("words a photograph, filename in the eyebrow", () => {
    expect(selectionCard(photo())).toEqual({
      eyebrow: "Photograph · DJI_0047.JPG",
      name: "Untitled",
      status: "coordinates from the file · no place name",
      description:
        "Coordinates read from the file. No place name, no photographer.",
      primaryLabel: "Open photograph",
    });
  });

  it("uses what a photograph does record", () => {
    const card = selectionCard(
      photo({
        placeName: "Furna",
        credit: "Maria Lopes",
        description: "The harbour at dusk.",
        filename: null,
      })
    );
    expect(card.eyebrow).toBe("Photograph");
    expect(card.status).toBe("coordinates from the file · Furna");
    expect(card.description).toBe("The harbour at dusk.");
  });
});

// ─── popupContent ────────────────────────────────────────────────────────────

describe("popupContent", () => {
  it("shows a photograph's image and filename", () => {
    expect(popupContent(photo())).toEqual({
      image: "https://r2.example/DJI_0047.JPG",
      title: "Untitled",
      sub: { kind: "file", text: "DJI_0047.JPG" },
      status: "partial",
      statusLabel: "coordinates, no place name",
    });
  });

  it("shows a place's eyebrow and status label, and no image", () => {
    expect(popupContent(record())).toEqual({
      image: null,
      title: "Nos Raiz",
      sub: { kind: "eyebrow", text: "Stay" },
      status: "partial",
      statusLabel: "records, no photograph",
    });
    expect(popupContent(settlement({ status: "name" })).statusLabel).toBe(
      "name only"
    );
  });

  it("drops the file line for a photograph with no filename", () => {
    expect(popupContent(photo({ filename: null })).sub).toBeNull();
  });
});

// ─── legendRows ──────────────────────────────────────────────────────────────

describe("legendRows", () => {
  const counts = { documented: 1, partial: 2, name: 22 };

  it("keys places by the three states, zero included", () => {
    expect(legendRows("settlements", counts, [], 0)).toEqual([
      { status: "documented", label: "documented", count: 1 },
      { status: "partial", label: "records, no photograph", count: 2 },
      { status: "name", label: "name only", count: 22 },
    ]);
    expect(
      legendRows("records", { documented: 1, partial: 7, name: 0 }, [], 0)[2]
    ).toEqual({ status: "name", label: "name only", count: 0 });
  });

  it("keys photographs by what their coordinates tell", () => {
    const photos = [photo(), photo({ key: "p:2" })];
    expect(legendRows("photographs", counts, photos, 6)).toEqual([
      { status: "partial", label: "coordinates, no place name", count: 2 },
      { status: "name", label: "no coordinates", count: 6 },
    ]);
  });

  it("does not claim no place name when a pin has one", () => {
    const photos = [photo(), photo({ key: "p:2", placeName: "Furna" })];
    expect(legendRows("photographs", counts, photos, 0)[0].label).toBe(
      "coordinates from the file"
    );
  });
});

// ─── listFooter ──────────────────────────────────────────────────────────────

describe("listFooter", () => {
  it("counts settlements and those holding records", () => {
    const towns = [
      settlement(),
      settlement({ key: "s:b", hasRecords: true }),
      settlement({ key: "s:c", hasRecords: false, recordCount: 0 }),
    ];
    expect(listFooter("settlements", towns)).toBe(
      "Three settlements are recorded. Two hold place records."
    );
    expect(
      listFooter("settlements", [
        settlement({ hasRecords: false, recordCount: 0 }),
      ])
    ).toBe("One settlement is recorded. None holds a place record yet.");
  });

  it("names the settlement where records share one coordinate", () => {
    const records = [
      record(),
      record({ key: "r:faja", name: "Fajã d'Água pools" }),
      record({ key: "r:igreja", coordinates: { lat: 14.856, lng: -24.728 } }),
    ];
    expect(listFooter("records", records)).toBe(
      "Two of the three share one coordinate at Fajã d'Água."
    );
  });

  it("stays general when several points are shared", () => {
    const records = [
      record(),
      record({ key: "r:2" }),
      record({ key: "r:3", coordinates: { lat: 1, lng: 1 } }),
      record({ key: "r:4", coordinates: { lat: 1, lng: 1 } }),
      record({ key: "r:5", coordinates: { lat: 2, lng: 2 } }),
    ];
    expect(listFooter("records", records)).toBe(
      "Four of the five share a coordinate with another record."
    );
  });

  it("counts records when none coincide", () => {
    expect(listFooter("records", [record()])).toBe(
      "One place record carries coordinates."
    );
    expect(listFooter("records", [])).toBe(
      "No place record carries coordinates yet."
    );
  });

  it("counts located photographs", () => {
    expect(listFooter("photographs", [photo(), photo({ key: "p:2" })])).toBe(
      "Two photographs carry coordinates."
    );
    expect(listFooter("photographs", [])).toBe(
      "No photograph carries coordinates yet."
    );
  });
});

describe("photographsNote", () => {
  it("counts the photographs the map cannot show", () => {
    expect(photographsNote(6)).toBe(
      "Six photographs carry no coordinates and cannot appear here."
    );
    expect(photographsNote(1)).toBe(
      "One photograph carries no coordinates and cannot appear here."
    );
  });

  it("is absent when every photograph is on the map", () => {
    expect(photographsNote(0)).toBeNull();
  });
});

// ─── overlayOffsets ──────────────────────────────────────────────────────────

describe("overlayOffsets", () => {
  it("keeps desktop offsets on a wide screen, the note above the zoom buttons", () => {
    const wide = { legend: 14, card: 62, note: 122 };
    expect(overlayOffsets(false, false)).toEqual(wide);
    expect(overlayOffsets(false, true)).toEqual(wide);
  });

  it("lifts the legend and card above a peeking sheet", () => {
    expect(overlayOffsets(true, false)).toEqual({
      legend: 146,
      card: 196,
      note: 196,
    });
  });

  it("returns both to 14px when the sheet is expanded", () => {
    expect(overlayOffsets(true, true)).toEqual({
      legend: 14,
      card: 14,
      note: 14,
    });
  });
});
