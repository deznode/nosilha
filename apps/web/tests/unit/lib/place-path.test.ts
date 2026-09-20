import { describe, expect, it } from "vitest";

import {
  belongsToSettlement,
  placeRecordPath,
  townSlugsById,
} from "@/lib/place-path";

const NOVA_SINTRA = { id: "t-1", slug: "nova-sintra", name: "Nova Sintra" };
const FAJA = { id: "t-2", slug: "faja-d-agua", name: "Fajã d'Água" };
const UNSAVED = { id: null, slug: "cachaco", name: "Cachaço" };
const TOWNS = [NOVA_SINTRA, FAJA, UNSAVED];

/**
 * Spec 034 FR-015 — a place record lives at `/<town-slug>/<entry-slug>`. The link
 * and the page must agree on which settlement owns a record, or a link 404s.
 */
describe("belongsToSettlement", () => {
  it("answers from townId when the record has one", () => {
    expect(
      belongsToSettlement({ townId: "t-2", town: "Nova Sintra" }, FAJA)
    ).toBe(true);
    expect(
      belongsToSettlement({ townId: "t-2", town: "Nova Sintra" }, NOVA_SINTRA)
    ).toBe(false);
  });

  it("falls back to the settlement name, ignoring case and padding", () => {
    expect(belongsToSettlement({ town: " nova sintra " }, NOVA_SINTRA)).toBe(
      true
    );
  });

  it("fails closed on a differently spelled name", () => {
    expect(belongsToSettlement({ town: "Faja d'Agua" }, FAJA)).toBe(false);
  });

  it("owns nothing when the record names no settlement", () => {
    expect(belongsToSettlement({ town: null }, NOVA_SINTRA)).toBe(false);
    expect(belongsToSettlement({}, UNSAVED)).toBe(false);
  });
});

describe("placeRecordPath", () => {
  it("builds the record's address under its settlement", () => {
    expect(
      placeRecordPath(
        { slug: "igreja", townId: "t-1", town: "Nova Sintra" },
        TOWNS
      )
    ).toBe("/nova-sintra/igreja");
  });

  it("resolves a record that carries only a settlement name", () => {
    expect(placeRecordPath({ slug: "casa", town: "Cachaço" }, TOWNS)).toBe(
      "/cachaco/casa"
    );
  });

  it("returns null when no settlement owns the record, so no link 404s", () => {
    expect(
      placeRecordPath(
        { slug: "lost", townId: "t-9", town: "Nova Sintra" },
        TOWNS
      )
    ).toBeNull();
    expect(
      placeRecordPath({ slug: "lost", town: "Faja d'Agua" }, TOWNS)
    ).toBeNull();
    expect(placeRecordPath({ slug: "lost" }, [])).toBeNull();
  });
});

describe("townSlugsById", () => {
  it("maps each saved settlement's id to its slug and skips unsaved ones", () => {
    expect(townSlugsById(TOWNS)).toEqual({
      "t-1": "nova-sintra",
      "t-2": "faja-d-agua",
    });
  });
});
