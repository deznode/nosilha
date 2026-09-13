import { describe, it, expect } from "vitest";
import { getEntryStatus, getTownStatus } from "@/lib/documentation-status";
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

  it("reads a settlement with nothing recorded as a gap", () => {
    expect(getTownStatus(town("NAME_ONLY", 1, false))).toEqual({
      status: "gap",
      label: "name only",
    });
  });

  it("reads a settlement with zero records as name only", () => {
    expect(getTownStatus(town("NAME_ONLY", 0, false))).toEqual({
      status: "gap",
      label: "name only",
    });
  });

  it("follows the backend's derived status rather than recomputing it", () => {
    // The backend also counts gallery media, which the summary's own fields
    // cannot express, so the frontend must not second-guess the status.
    expect(getTownStatus(town("DOCUMENTED", 1, false)).status).toBe(
      "documented"
    );
  });

  it("falls back to an unclaimed gap for a status it does not recognise", () => {
    const unrecognised = "ARCHIVED" as unknown as SettlementStatus;

    expect(getTownStatus({ status: unrecognised })).toEqual({
      status: "gap",
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

  it("reads a record without a photograph as a gap", () => {
    expect(getEntryStatus({ imageUrl: null })).toEqual({
      status: "gap",
      label: "no photograph",
    });
  });

  it("treats an empty image URL as no photograph", () => {
    expect(getEntryStatus({ imageUrl: "" }).status).toBe("gap");
    expect(getEntryStatus({ imageUrl: "   " }).status).toBe("gap");
  });
});
