import { describe, expect, it } from "vitest";

import {
  SETTLEMENT_FILTERS,
  parseSettlementFilter,
  settlementCardLink,
  settlementChipCounts,
  settlementMetaRow,
  settlementStandfirst,
  settlementStatusLine,
  filterSettlements,
} from "@/components/settlements/settlements-copy";
import type { TownStatusSummary } from "@/types/town";

function town(overrides: Partial<TownStatusSummary> = {}): TownStatusSummary {
  return {
    id: "t-1",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
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

/** The archive's 25 settlements: one documented, two partial, twenty-two name only. */
function archive(): TownStatusSummary[] {
  return [
    town({
      slug: "monte",
      name: "Monte",
      status: "DOCUMENTED",
      entryCount: 1,
      hasPhotograph: true,
      photographCount: 1,
    }),
    town({
      slug: "nova-sintra",
      name: "Nova Sintra",
      status: "PARTIAL",
      entryCount: 5,
    }),
    town({
      slug: "faja-d-agua",
      name: "Fajã d'Água",
      status: "PARTIAL",
      entryCount: 2,
    }),
    ...Array.from({ length: 22 }, (_, i) =>
      town({ slug: `empty-${i}`, name: `Empty ${i}` })
    ),
  ];
}

/** Spec 034 T-26 / FR-007 — every number on the screen is a live aggregate. */
describe("settlementStandfirst", () => {
  it("counts the three states in words", () => {
    expect(settlementStandfirst(archive())).toBe(
      "Twenty-five places carry a name on Brava. One is documented, two hold " +
        "records without a photograph, and twenty-two are a name and a coordinate."
    );
  });

  it("agrees in number when a state holds exactly one", () => {
    const towns = [
      town({
        slug: "a",
        status: "DOCUMENTED",
        entryCount: 1,
        hasPhotograph: true,
      }),
      town({ slug: "b", status: "PARTIAL", entryCount: 1 }),
      town({ slug: "c" }),
    ];

    expect(settlementStandfirst(towns)).toBe(
      "Three places carry a name on Brava. One is documented, one holds records " +
        "without a photograph, and one is a name and a coordinate."
    );
  });

  it("says so when the archive holds nothing", () => {
    expect(settlementStandfirst([])).toBe(
      "No settlement carries a name on Brava yet."
    );
  });
});

describe("settlementChipCounts", () => {
  it("counts all, has-records and nothing-yet", () => {
    expect(settlementChipCounts(archive())).toEqual({
      all: 25,
      has: 3,
      none: 22,
    });
  });

  it("reports zero rather than nothing, so the chip can show it", () => {
    expect(settlementChipCounts([])).toEqual({ all: 0, has: 0, none: 0 });
  });
});

describe("settlementStatusLine", () => {
  it("names the records and the photograph count", () => {
    const line = settlementStatusLine(
      town({
        entryCount: 5,
        status: "DOCUMENTED",
        hasPhotograph: true,
        photographCount: 3,
      })
    );

    expect(line).toEqual({
      text: "Five records · three photographs",
      ochre: false,
    });
  });

  it("says no photograph when the records carry none", () => {
    expect(
      settlementStatusLine(town({ entryCount: 5, status: "PARTIAL" })).text
    ).toBe("Five records · no photograph");
  });

  it("calls a record's hero a photograph without inventing a count", () => {
    expect(
      settlementStatusLine(
        town({
          entryCount: 1,
          status: "DOCUMENTED",
          hasPhotograph: true,
          photographCount: 0,
        })
      ).text
    ).toBe("One record · a photograph");
  });

  it("marks a name-only settlement in ochre", () => {
    expect(settlementStatusLine(town())).toEqual({
      text: "a name and a coordinate, nothing else",
      ochre: true,
    });
  });
});

describe("settlementMetaRow", () => {
  it("says what is not recorded", () => {
    expect(settlementMetaRow(town())).toEqual([
      "population not recorded",
      "elevation not recorded",
    ]);
  });

  it("shows the recorded values as written", () => {
    expect(
      settlementMetaRow(
        town({ population: "271 (2010 census)", elevation: "642m" })
      )
    ).toEqual(["271 (2010 census)", "642m"]);
  });
});

describe("settlementCardLink", () => {
  it("opens the settlement when it holds records", () => {
    expect(
      settlementCardLink(town({ slug: "nova-sintra", entryCount: 5 }))
    ).toBe("/nova-sintra");
  });

  it("selects a name-only settlement on the map instead", () => {
    expect(settlementCardLink(town({ slug: "cova-joana" }))).toBe(
      "/map?mode=settlements&sel=s%3Acova-joana"
    );
  });
});

describe("filterSettlements", () => {
  it("keeps everything under all", () => {
    expect(filterSettlements(archive(), "all")).toHaveLength(25);
  });

  it("keeps only settlements with records under has", () => {
    expect(filterSettlements(archive(), "has")).toHaveLength(3);
  });

  it("keeps only empty settlements under none", () => {
    expect(filterSettlements(archive(), "none")).toHaveLength(22);
  });
});

describe("parseSettlementFilter", () => {
  it("defaults to all", () => {
    expect(parseSettlementFilter(undefined)).toBe("all");
    expect(parseSettlementFilter("nonsense")).toBe("all");
  });

  it("accepts the filters the chips offer", () => {
    for (const filter of SETTLEMENT_FILTERS) {
      expect(parseSettlementFilter(filter.key)).toBe(filter.key);
    }
  });
});
