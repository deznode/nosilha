import { getTranslations } from "next-intl/server";
import { beforeAll, describe, it, expect } from "vitest";
import {
  STATUS_CONFIG,
  entryStatus,
  getEntryStatus,
  getTownStatus,
  statusLabel,
  statusLine,
  statusTint,
  statusVar,
  townStatus,
  type StatusTranslator,
} from "@/lib/status";
import type { SettlementStatus, TownStatusSummary } from "@/types/town";

function town(
  status: SettlementStatus,
  entryCount: number,
  hasPhotograph: boolean
): TownStatusSummary {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "mato",
    name: "Mato",
    description: "A village in the interior.",
    latitude: 14.857,
    longitude: -24.706,
    entryCount,
    hasPhotograph,
    status,
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
  };
}

describe("STATUS_CONFIG", () => {
  it("encodes the three states with three separable brand hues", () => {
    expect(STATUS_CONFIG).toEqual({
      documented: { token: "--brand-valley-green" },
      partial: { token: "--brand-ocean-blue" },
      name: { token: "--brand-sobrado-ochre" },
    });
  });

  it("never encodes a state in sunny yellow", () => {
    for (const config of Object.values(STATUS_CONFIG)) {
      expect(config.token).not.toContain("yellow");
    }
  });

  it("holds no resolved colour, only the token that follows the theme", () => {
    // Spec 034 T-32 retired the light hex values once no pin site read them.
    for (const config of Object.values(STATUS_CONFIG)) {
      // The words are messages (spec 041 FR-004), so the table holds only the token.
      expect(Object.keys(config)).toEqual(["token"]);
    }
  });
});

describe("statusVar", () => {
  it.each([
    ["documented", "var(--brand-valley-green)"],
    ["partial", "var(--brand-ocean-blue)"],
    ["name", "var(--brand-sobrado-ochre)"],
  ] as const)("reads the %s colour from its token", (status, expected) => {
    expect(statusVar(status)).toBe(expected);
  });
});

describe("statusTint", () => {
  it("mixes the status token with transparency at the given percentage", () => {
    expect(statusTint("name", 20)).toBe(
      "color-mix(in srgb, var(--brand-sobrado-ochre) 20%, transparent)"
    );
  });

  it("follows the active theme because it never resolves the token", () => {
    expect(statusTint("partial", 12)).toContain("var(--brand-ocean-blue)");
  });
});

describe("getTownStatus", () => {
  let t: StatusTranslator;
  beforeAll(async () => {
    t = await getTranslations("status");
  });

  it("reads a settlement with a photographed record as documented", () => {
    expect(getTownStatus(town("DOCUMENTED", 3, true), t)).toEqual({
      status: "documented",
      label: "documented",
    });
  });

  it("reads a settlement with records but no photograph as partial", () => {
    expect(getTownStatus(town("PARTIAL", 2, false), t)).toEqual({
      status: "partial",
      label: "records, no photograph",
    });
  });

  it("reads a settlement with nothing recorded as name only", () => {
    expect(getTownStatus(town("NAME_ONLY", 1, false), t)).toEqual({
      status: "name",
      label: "name only",
    });
  });

  it("reads a settlement with zero records as name only", () => {
    expect(getTownStatus(town("NAME_ONLY", 0, false), t)).toEqual({
      status: "name",
      label: "name only",
    });
  });

  it("takes its labels from the status labels", () => {
    expect(getTownStatus(town("PARTIAL", 2, false), t).label).toBe(
      statusLabel("partial", t)
    );
  });

  it("follows the backend's derived status rather than recomputing it", () => {
    // The backend also counts gallery media, which the summary's own fields
    // cannot express, so the frontend must not second-guess the status.
    expect(getTownStatus(town("DOCUMENTED", 1, false), t).status).toBe(
      "documented"
    );
  });

  it("falls back to an unclaimed name-only state for a status it does not recognise", () => {
    const unrecognised = "ARCHIVED" as unknown as SettlementStatus;

    expect(getTownStatus({ status: unrecognised }, t)).toEqual({
      status: "name",
      label: "unknown",
    });
  });
});

describe("getEntryStatus", () => {
  let t: StatusTranslator;
  beforeAll(async () => {
    t = await getTranslations("status");
  });

  it("reads a record with a photograph as documented", () => {
    expect(getEntryStatus({ imageUrl: "/images/igreja.jpg" }, t)).toEqual({
      status: "documented",
      label: "has a photograph",
    });
  });

  it("reads a record without a photograph as records-no-photograph, not name only", () => {
    // `name` means "a name and a coordinate, nothing else" (FR-002). A record always
    // carries more than that, so ochre would misdescribe every undocumented record.
    expect(getEntryStatus({ imageUrl: null }, t)).toEqual({
      status: "partial",
      label: "no photograph",
    });
  });

  it("treats an empty image URL as no photograph", () => {
    expect(getEntryStatus({ imageUrl: "" }, t).status).toBe("partial");
    expect(getEntryStatus({ imageUrl: "   " }, t).status).toBe("partial");
  });

  it("never reads a record as name only", () => {
    for (const imageUrl of [null, "", "   ", "/images/igreja.jpg"]) {
      expect(getEntryStatus({ imageUrl }, t).status).not.toBe("name");
    }
  });
});

/** Spec 041 FR-004 — the labels are messages; English is unchanged. */
describe("status labels", () => {
  it("reads every label and line from the `status` namespace, word for word", async () => {
    const t = await getTranslations("status");

    expect(statusLabel("documented", t)).toBe("documented");
    expect(statusLine("documented", t)).toBe("records and a photograph");
    expect(statusLabel("partial", t)).toBe("records, no photograph");
    expect(statusLine("partial", t)).toBe("records, no photograph");
    expect(statusLabel("name", t)).toBe("name only");
    expect(statusLine("name", t)).toBe("a name and a coordinate, nothing else");
  });
});

describe("townStatus and entryStatus", () => {
  it("give the same states as the labelled versions, with no text", async () => {
    const t = await getTranslations("status");

    for (const status of ["DOCUMENTED", "PARTIAL", "NAME_ONLY"] as const) {
      expect(townStatus({ status })).toBe(getTownStatus({ status }, t).status);
    }
    const unrecognised = "ARCHIVED" as unknown as SettlementStatus;
    expect(townStatus({ status: unrecognised })).toBe("name");
    for (const imageUrl of [null, "", "/images/igreja.jpg"]) {
      expect(entryStatus({ imageUrl })).toBe(
        getEntryStatus({ imageUrl }, t).status
      );
    }
  });
});
