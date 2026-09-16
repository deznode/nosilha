import { describe, expect, it } from "vitest";

import {
  photographPanel,
  settlementQuestions,
  settlementSubLine,
  unconfirmedLink,
} from "@/components/settlements/settlement-detail/settlement-detail-copy";
import type { Town, TownStatusSummary } from "@/types/town";

function summary(
  overrides: Partial<TownStatusSummary> = {}
): TownStatusSummary {
  return {
    id: "t",
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
    ...overrides,
  };
}

function town(overrides: Partial<Town> = {}): Town {
  return {
    id: "t",
    slug: "nova-sintra",
    name: "Nova Sintra",
    description: "",
    latitude: 14.8632,
    longitude: -24.7183,
    population: null,
    elevation: null,
    founded: null,
    highlights: [],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

/** Spec 034 T-27 / FR-008 — a settlement page states its own gaps. */
describe("settlementSubLine", () => {
  it("counts the records and says the town has no photograph", () => {
    expect(settlementSubLine(summary())).toBe(
      "Five place records · no photograph of the town itself"
    );
  });

  it("counts the photographs once any are attached", () => {
    expect(
      settlementSubLine(summary({ photographCount: 2, hasPhotograph: true }))
    ).toBe("Five place records · two photographs");
  });

  it("says so when nothing is recorded here at all", () => {
    expect(settlementSubLine(summary({ entryCount: 0 }))).toBe(
      "No place record · no photograph of the town itself"
    );
  });
});

describe("photographPanel", () => {
  it("heads the panel with the settlement and reports none yet", () => {
    const panel = photographPanel(summary());

    expect(panel.eyebrow).toBe("Photographs of Nova Sintra");
    expect(panel.heading).toBe("None yet");
    expect(panel.giveLabel).toBe("Give a photograph of Nova Sintra");
  });

  it("explains that the records carry nothing and names the unconfirmed ones", () => {
    expect(photographPanel(summary()).body).toBe(
      "Five records sit in this town and not one of them carries a photograph. " +
        "Three photographs in the archive have coordinates that fall inside Nova " +
        "Sintra, but nobody has confirmed the place, so they are not attached here."
    );
  });

  it("agrees in number for a single unconfirmed photograph", () => {
    expect(
      photographPanel(summary({ entryCount: 1, unconfirmedPhotographCount: 1 }))
        .body
    ).toBe(
      "One record sits in this town and it does not carry a photograph. " +
        "One photograph in the archive has coordinates that fall inside Nova " +
        "Sintra, but nobody has confirmed the place, so it is not attached here."
    );
  });

  it("drops the unconfirmed sentence when there are none", () => {
    expect(
      photographPanel(summary({ unconfirmedPhotographCount: 0 })).body
    ).toBe(
      "Five records sit in this town and not one of them carries a photograph."
    );
  });

  it("hides the unconfirmed action at zero rather than linking to nothing", () => {
    expect(
      photographPanel(summary({ unconfirmedPhotographCount: 0 }))
        .unconfirmedLabel
    ).toBeNull();
    expect(photographPanel(summary()).unconfirmedLabel).toBe(
      "See the three unconfirmed photographs"
    );
  });

  it("counts the attached photographs in the heading when there are some", () => {
    const panel = photographPanel(
      summary({
        photographCount: 3,
        hasPhotograph: true,
        unconfirmedPhotographCount: 0,
      })
    );

    expect(panel.heading).toBe("Three photographs");
    expect(panel.body).toBe("Five records sit in this town.");
  });

  it("says the town is empty when it holds no record", () => {
    expect(
      photographPanel(summary({ entryCount: 0, unconfirmedPhotographCount: 0 }))
        .body
    ).toBe("No record sits in this town yet.");
  });
});

describe("unconfirmedLink", () => {
  it("filters the photographs screen to this settlement", () => {
    expect(unconfirmedLink(summary())).toBe("/photographs?region=nova-sintra");
  });
});

describe("settlementQuestions", () => {
  it("asks only about what is not recorded", () => {
    expect(settlementQuestions(town(), summary())).toEqual([
      { field: "population", question: "How many people live in Nova Sintra?" },
      { field: "elevation", question: "How high above the sea is it?" },
      { field: "founded", question: "When was the town founded?" },
      { field: "highlights", question: "What should a visitor walk to first?" },
    ]);
  });

  it("drops a question once its field is recorded", () => {
    const questions = settlementQuestions(
      town({ founded: "1573", highlights: ["The praça"] }),
      summary({ population: "1,069 (2010 census)" })
    );

    expect(questions.map((q) => q.field)).toEqual(["elevation"]);
  });

  it("asks nothing when the settlement is fully recorded", () => {
    expect(
      settlementQuestions(
        town({ founded: "1573", highlights: ["The praça"] }),
        summary({ population: "1,069", elevation: "530m" })
      )
    ).toEqual([]);
  });

  it("treats a blank string as not recorded", () => {
    const questions = settlementQuestions(
      town({ founded: "   " }),
      summary({ population: "  ", elevation: "530m" })
    );

    expect(questions.map((q) => q.field)).toEqual([
      "population",
      "founded",
      "highlights",
    ]);
  });
});
