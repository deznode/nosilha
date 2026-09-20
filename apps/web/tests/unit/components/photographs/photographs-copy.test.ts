import { describe, expect, it } from "vitest";

import {
  DEFAULT_PHOTOGRAPH_FILTER,
  PHOTOGRAPH_FILTERS,
  emptyLine,
  filmsNote,
  parsePhotographFilter,
  photographQuery,
  photographsStandfirst,
  resolveRegion,
  showingLine,
  unlocatedTray,
} from "@/components/photographs/photographs-copy";
import type { GalleryFacets } from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

const FACETS: GalleryFacets = {
  total: 26,
  photographs: 17,
  films: 9,
  withPlace: 11,
  withoutPlace: 15,
  withoutDate: 14,
  uncredited: 26,
};

const TOWNS: TownStatusSummary[] = [
  {
    id: "t1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
    entryCount: 5,
    hasPhotograph: false,
    status: "PARTIAL",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 3,
  },
];

/** Spec 034 T-30 / FR-009, FR-018 — every number comes from the facets. */
describe("photographsStandfirst", () => {
  it("splits the archive into photographs and films and names the gaps", () => {
    expect(photographsStandfirst(FACETS)).toBe(
      "Twenty-six records: seventeen photographs and nine films. " +
        "Eleven carry coordinates read from the file. None carries a photographer."
    );
  });

  it("counts the uncredited ones once some are credited", () => {
    expect(photographsStandfirst({ ...FACETS, uncredited: 24 })).toContain(
      "Twenty-four carry no photographer."
    );
  });

  it("says so when the archive is empty", () => {
    expect(
      photographsStandfirst({
        total: 0,
        photographs: 0,
        films: 0,
        withPlace: 0,
        withoutPlace: 0,
        withoutDate: 0,
        uncredited: 0,
      })
    ).toBe("The archive holds no records yet.");
  });
});

describe("PHOTOGRAPH_FILTERS", () => {
  it("offers the four chips the handoff draws", () => {
    expect(PHOTOGRAPH_FILTERS.map((f) => f.label)).toEqual([
      "With a place",
      "No place",
      "No date",
      "Films",
    ]);
  });

  it("counts each chip from its own facet", () => {
    const counts = PHOTOGRAPH_FILTERS.map((f) => FACETS[f.facet]);
    expect(counts).toEqual([11, 15, 14, 9]);
  });

  it("defaults to the located photographs", () => {
    expect(parsePhotographFilter(undefined)).toBe(DEFAULT_PHOTOGRAPH_FILTER);
    expect(parsePhotographFilter("nonsense")).toBe("place");
    expect(parsePhotographFilter("films")).toBe("films");
  });
});

describe("photographQuery", () => {
  it("asks for located photographs by default", () => {
    expect(photographQuery("place", null, 60)).toEqual({
      hasPlace: true,
      size: 60,
    });
  });

  it("asks for films as external video", () => {
    expect(photographQuery("films", null, 60)).toEqual({
      mediaType: "VIDEO",
      size: 60,
    });
  });

  it("adds the region's coordinates as a pair", () => {
    const region = resolveRegion("nova-sintra", TOWNS);

    expect(photographQuery("place", region, 60)).toEqual({
      hasPlace: true,
      size: 60,
      nearLat: 14.8632,
      nearLng: -24.7183,
    });
  });
});

describe("resolveRegion", () => {
  it("turns a settlement slug into coordinates and a name", () => {
    expect(resolveRegion("nova-sintra", TOWNS)).toEqual({
      slug: "nova-sintra",
      name: "Nova Sintra",
      nearLat: 14.8632,
      nearLng: -24.7183,
    });
  });

  it("is null for an unknown slug rather than an empty filter", () => {
    expect(resolveRegion("atlantis", TOWNS)).toBeNull();
    expect(resolveRegion(undefined, TOWNS)).toBeNull();
  });
});

describe("showingLine", () => {
  it("counts what is shown against the filter's total", () => {
    expect(showingLine(8, 11, null)).toBe("Showing 8 of 11");
  });

  it("names the area when one narrows it", () => {
    expect(showingLine(3, 11, resolveRegion("nova-sintra", TOWNS))).toBe(
      "Showing 3 of 11 near Nova Sintra"
    );
  });
});

describe("emptyLine", () => {
  it("says the archive has no film, rather than pointing at a hidden section", () => {
    // The Films chip filters the grid *to* the films and stands the section down, so
    // an empty grid under it means there is no film — not that they are listed below.
    expect(emptyLine("films", null)).toBe(
      "No film has been synced from YouTube yet."
    );
  });

  it("offers to clear the area only when there is one", () => {
    expect(emptyLine("place", resolveRegion("nova-sintra", TOWNS))).toBe(
      "Try another filter, or clear the area."
    );
    expect(emptyLine("place", null)).toBe("Try another filter.");
  });
});

describe("unlocatedTray", () => {
  it("heads with the archive count, then says how many are shown", () => {
    expect(unlocatedTray(FACETS, 6)).toEqual({
      heading: "Fifteen photographs carry no coordinates",
      body:
        "Six of them are shown below. None can appear on the map. If you recognise " +
        "one, tell us where it was taken and it joins the island.",
    });
  });

  it("drops the extract count when everything is shown", () => {
    expect(unlocatedTray(FACETS, 15).body).toBe(
      "None of them can appear on the map. If you recognise one, tell us where it " +
        "was taken and it joins the island."
    );
  });

  it("says so when every photograph is placed", () => {
    expect(unlocatedTray({ ...FACETS, withoutPlace: 0 }, 0).heading).toBe(
      "Every photograph carries coordinates"
    );
  });
});

describe("filmsNote", () => {
  it("says none records a length", () => {
    expect(filmsNote(Array.from({ length: 9 }, () => ({})))).toBe(
      "Nine, synced from YouTube. None records a length."
    );
  });

  it("counts the ones that do once durations arrive", () => {
    expect(filmsNote([{ durationSeconds: 120 }, {}])).toBe(
      "Two, synced from YouTube. One of them records a length."
    );
  });

  it("says so when there are no films", () => {
    expect(filmsNote([])).toBe("None yet.");
  });
});
