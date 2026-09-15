import { describe, it, expect } from "vitest";
import {
  STATUS_CONFIG,
  getEntryStatus,
  getTownStatus,
  statusTint,
  statusVar,
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
  };
}

describe("STATUS_CONFIG", () => {
  it("encodes the three states with three separable brand hues", () => {
    expect(STATUS_CONFIG).toEqual({
      documented: expect.objectContaining({
        token: "--brand-valley-green",
        label: "documented",
        line: "records and a photograph",
      }),
      partial: expect.objectContaining({
        token: "--brand-ocean-blue",
        label: "records, no photograph",
        line: "records, no photograph",
      }),
      name: expect.objectContaining({
        token: "--brand-sobrado-ochre",
        label: "name only",
        line: "a name and a coordinate, nothing else",
      }),
    });
  });

  it("never encodes a state in sunny yellow", () => {
    for (const config of Object.values(STATUS_CONFIG)) {
      expect(config.token).not.toContain("yellow");
    }
  });

  it("keeps light hex values of the same tokens for the hex-alpha pin sites", () => {
    // Interim until spec 034 T-32 moves pins to statusVar / statusTint.
    expect(STATUS_CONFIG.documented.lightHex).toBe("#4F6E63");
    expect(STATUS_CONFIG.partial.lightHex).toBe("#3D5A73");
    expect(STATUS_CONFIG.name.lightHex).toBe("#7A5730");
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
  it("reads a settlement with a photographed record as documented", () => {
    expect(getTownStatus(town("DOCUMENTED", 3, true))).toEqual({
      status: "documented",
      label: "documented",
    });
  });

  it("reads a settlement with records but no photograph as partial", () => {
    expect(getTownStatus(town("PARTIAL", 2, false))).toEqual({
      status: "partial",
      label: "records, no photograph",
    });
  });

  it("reads a settlement with nothing recorded as name only", () => {
    expect(getTownStatus(town("NAME_ONLY", 1, false))).toEqual({
      status: "name",
      label: "name only",
    });
  });

  it("reads a settlement with zero records as name only", () => {
    expect(getTownStatus(town("NAME_ONLY", 0, false))).toEqual({
      status: "name",
      label: "name only",
    });
  });

  it("takes its labels from the status table", () => {
    expect(getTownStatus(town("PARTIAL", 2, false)).label).toBe(
      STATUS_CONFIG.partial.label
    );
  });

  it("follows the backend's derived status rather than recomputing it", () => {
    // The backend also counts gallery media, which the summary's own fields
    // cannot express, so the frontend must not second-guess the status.
    expect(getTownStatus(town("DOCUMENTED", 1, false)).status).toBe(
      "documented"
    );
  });

  it("falls back to an unclaimed name-only state for a status it does not recognise", () => {
    const unrecognised = "ARCHIVED" as unknown as SettlementStatus;

    expect(getTownStatus({ status: unrecognised })).toEqual({
      status: "name",
      label: "unknown",
    });
  });
});

describe("getEntryStatus", () => {
  it("reads a record with a photograph as documented", () => {
    expect(getEntryStatus({ imageUrl: "/images/igreja.jpg" })).toEqual({
      status: "documented",
      label: "has a photograph",
    });
  });

  it("reads a record without a photograph as name only", () => {
    expect(getEntryStatus({ imageUrl: null })).toEqual({
      status: "name",
      label: "no photograph",
    });
  });

  it("treats an empty image URL as no photograph", () => {
    expect(getEntryStatus({ imageUrl: "" }).status).toBe("name");
    expect(getEntryStatus({ imageUrl: "   " }).status).toBe("name");
  });
});
