import { getTranslations } from "next-intl/server";
import { beforeAll, describe, expect, it } from "vitest";

import messages from "../../../messages/en.json";

import { fieldPhrase, type FieldTranslator } from "@/lib/field-labels";

/** Spec 034 T-28 / FR-004 — curators read the queue, so keys go out as phrases. */
describe("fieldPhrase", () => {
  let t: FieldTranslator;
  beforeAll(async () => {
    t = await getTranslations("fields");
  });

  it("turns a code key into something a person can read", () => {
    expect(fieldPhrase("photographerCredit", t)).toBe(
      "who took this photograph"
    );
    expect(fieldPhrase("latitude", t)).toBe("where this photograph was taken");
    expect(fieldPhrase("conditionStatus", t)).toBe("its present condition");
  });

  it("covers every field key the archive's screens can send", () => {
    // Drawn from `placeFields`, the photo detail's ask rows, the film page, the
    // settlement questions and the two cross-cutting keys. An unmapped key would ship
    // a variable name.
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
      "filmmaker",
      "placeId",
      "population",
      "elevation",
      "founded",
      "highlights",
      "photograph",
      "correction",
    ];

    for (const key of keys) {
      expect(fieldPhrase(key, t), key).not.toBe(key);
    }
  });

  it("falls back to the key's words rather than dropping an unmapped field", () => {
    expect(fieldPhrase("someNewField", t)).toBe("some new field");
    expect(fieldPhrase("snake_case_key", t)).toBe("snake case key");
  });
});

/** Spec 041 FR-004 — the phrases are messages. */
describe("fieldPhrase and the `fields` namespace", () => {
  it("reads every message in the namespace, word for word", async () => {
    const t = await getTranslations("fields");

    for (const [key, phrase] of Object.entries(messages.fields)) {
      expect(fieldPhrase(key, t), key).toBe(phrase);
    }
  });
});
