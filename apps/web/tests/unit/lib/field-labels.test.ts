import { describe, expect, it } from "vitest";

import { fieldPhrase } from "@/lib/field-labels";

/** Spec 034 T-28 / FR-004 — curators read the queue, so keys go out as phrases. */
describe("fieldPhrase", () => {
  it("turns a code key into something a person can read", () => {
    expect(fieldPhrase("photographerCredit")).toBe("who took this photograph");
    expect(fieldPhrase("latitude")).toBe("where this photograph was taken");
    expect(fieldPhrase("conditionStatus")).toBe("its present condition");
  });

  it("covers every field key the archive's screens can send", () => {
    // Drawn from `placeFields`, the photo detail's ask rows, the settlement questions
    // and the two cross-cutting keys. An unmapped key would ship a variable name.
    const keys = [
      "settlement",
      "category",
      "established",
      "coordinates",
      "conditionStatus",
      "festival",
      "photographer",
      "openingHours",
      "architect",
      "rating",
      "phoneNumber",
      "email",
      "website",
      "cuisine",
      "amenities",
      "photographerCredit",
      "title",
      "latitude",
      "locationName",
      "dateTaken",
      "population",
      "elevation",
      "founded",
      "highlights",
      "photograph",
      "correction",
    ];

    for (const key of keys) {
      expect(fieldPhrase(key), key).not.toBe(key);
    }
  });

  it("falls back to the key's words rather than dropping an unmapped field", () => {
    expect(fieldPhrase("someNewField")).toBe("some new field");
    expect(fieldPhrase("snake_case_key")).toBe("snake case key");
  });
});
