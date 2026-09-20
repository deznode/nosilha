import { describe, expect, it } from "vitest";

import {
  completenessSentence,
  countedFields,
  placeFields,
} from "@/lib/field-questions";
import type { DirectoryEntry } from "@/types/directory";

function base(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "e1",
    slug: "igreja-nossa-senhora-do-monte",
    name: "Igreja Nossa Senhora do Monte",
    category: "Heritage",
    imageUrl: "https://cdn.example/igreja.jpg",
    town: "Nossa Senhora do Monte",
    latitude: 14.856,
    longitude: -24.728,
    description: "",
    rating: null,
    reviewCount: 0,
    createdAt: "",
    updatedAt: "",
    tags: [],
    details: {
      established: "c. 1826",
      conditionStatus: "under reconstruction since 2023",
      festival: "second weekend of August",
      architect: null,
    },
    heroImage: {
      mediaId: "m1",
      url: "https://cdn.example/igreja.jpg",
      photographerCredit: null,
      archiveSource: null,
    },
    completeness: {
      documented: 6,
      total: 9,
      missingFields: ["photographer", "openingHours", "architect"],
    },
    ...overrides,
  } as DirectoryEntry;
}

/** Spec 034 T-28 / FR-013, FR-016 — the field grid is the completeness denominator. */
describe("placeFields", () => {
  it("renders the prototype's heritage grid in order", () => {
    expect(placeFields(base()).map((f) => f.label)).toEqual([
      "Settlement",
      "Category",
      "Established",
      "Coordinates",
      "Status",
      "Festival",
      "Photographer",
      "Opening hours",
      "Architect",
    ]);
  });

  it("matches the completeness the backend derived", () => {
    const fields = placeFields(base());

    expect(fields).toHaveLength(9);
    expect(fields.filter((f) => f.value !== null)).toHaveLength(6);
  });

  it("shows the recorded values and their source", () => {
    const byKey = Object.fromEntries(
      placeFields(base()).map((f) => [f.key, f])
    );

    expect(byKey.settlement.value).toBe("Nossa Senhora do Monte");
    expect(byKey.established.value).toBe("c. 1826");
    expect(byKey.conditionStatus.value).toBe("under reconstruction since 2023");
    expect(byKey.festival.value).toBe("second weekend of August");
    expect(byKey.coordinates).toMatchObject({
      value: "14.8560, −24.7280",
      mono: true,
    });
  });

  it("asks the prototype's question for each missing field", () => {
    const byKey = Object.fromEntries(
      placeFields(base()).map((f) => [f.key, f])
    );

    expect(byKey.photographer).toMatchObject({
      value: null,
      question: "Who took the photograph above?",
    });
    expect(byKey.openingHours.question).toBe("When can a visitor go in?");
    expect(byKey.architect.question).toBe("Who built it?");
  });

  it("counts a credit of 'not known' as no photographer", () => {
    const fields = placeFields(
      base({
        heroImage: {
          mediaId: "m1",
          url: "u",
          photographerCredit: "not known",
          archiveSource: null,
        },
      })
    );

    expect(fields.find((f) => f.key === "photographer")?.value).toBeNull();
  });

  it("drops the photographer row when the record has no hero to credit", () => {
    const fields = placeFields(base({ heroImage: null, imageUrl: null }));

    expect(fields.map((f) => f.key)).not.toContain("photographer");
    expect(fields).toHaveLength(8);
  });

  it("treats the unplaced default of 0,0 as no coordinates", () => {
    const fields = placeFields(base({ latitude: 0, longitude: 0 }));

    expect(fields.find((f) => f.key === "coordinates")).toMatchObject({
      value: null,
      question: "Where exactly is it?",
    });
  });

  it("gives a Hotel its rating, contact, opening hours and amenities", () => {
    const fields = placeFields(
      base({
        category: "Hotel",
        rating: 4.5,
        phoneNumber: "+238 000 0000",
        details: { amenities: ["wifi"] },
        heroImage: null,
        completeness: undefined,
      }) as DirectoryEntry
    );

    expect(fields.map((f) => f.key)).toEqual([
      "settlement",
      "category",
      "coordinates",
      "openingHours",
      "rating",
      "phoneNumber",
      "email",
      "website",
      "amenities",
    ]);
    expect(fields.find((f) => f.key === "rating")?.value).toBe("4.5");
    expect(fields.find((f) => f.key === "amenities")?.value).toBe("wifi");
  });

  it("never gives a rating row to a record outside accommodation", () => {
    for (const category of [
      "Heritage",
      "Church",
      "Beach",
      "Nature",
      "Restaurant",
    ]) {
      const fields = placeFields(
        base({
          category,
          rating: 4.5,
          details: null,
        } as Partial<DirectoryEntry>)
      );
      expect(fields.map((f) => f.key)).not.toContain("rating");
    }
  });

  it("gives a Beach nothing but the structural rows", () => {
    const fields = placeFields(
      base({ category: "Beach", details: null, heroImage: null })
    );

    expect(fields.map((f) => f.key)).toEqual([
      "settlement",
      "category",
      "coordinates",
    ]);
  });

  it("gives a Restaurant its cuisine and opening hours", () => {
    const fields = placeFields(
      base({
        category: "Restaurant",
        heroImage: null,
        details: {
          phoneNumber: "+238 000 0000",
          openingHours: "9 to 6",
          cuisine: ["Cachupa"],
        },
      } as Partial<DirectoryEntry>)
    );

    const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));
    expect(byKey.openingHours.value).toBe("9 to 6");
    expect(byKey.cuisine.value).toBe("Cachupa");
    expect(byKey.rating).toBeUndefined();
  });
});

describe("shown but not counted", () => {
  /**
   * `casa-eugenio-tavares` is the record `FieldGuard`'s own doc names: a Heritage
   * record carrying a real phone, email, website and opening hours. It must display
   * them — while a public square must not read as incomplete for lacking a telephone.
   */
  function casaEugenioTavares(): DirectoryEntry {
    return base({
      slug: "casa-eugenio-tavares",
      name: "Casa Eugenio Tavares",
      category: "Heritage",
      phoneNumber: "+238 2623385",
      email: "nospatrimonio@gmail.com",
      website: "http://www.eugeniotavares.org",
      heroImage: null,
      details: {
        established: null,
        conditionStatus: null,
        festival: null,
        architect: null,
        openingHours:
          "Mon-Fri 08:00-13:00, 14:00-16:00; Sat-Sun by appointment",
      },
      completeness: {
        documented: 4,
        total: 8,
        missingFields: [
          "established",
          "conditionStatus",
          "festival",
          "architect",
        ],
      },
    } as Partial<DirectoryEntry>);
  }

  it("shows a heritage record's real contact details", () => {
    const byKey = Object.fromEntries(
      placeFields(casaEugenioTavares()).map((f) => [f.key, f])
    );

    expect(byKey.phoneNumber.value).toBe("+238 2623385");
    expect(byKey.email.value).toBe("nospatrimonio@gmail.com");
    expect(byKey.website.value).toBe("http://www.eugeniotavares.org");
  });

  it("keeps them out of the denominator, which stays the API's eight", () => {
    const counted = countedFields(casaEugenioTavares());

    expect(counted).toHaveLength(8);
    expect(counted.map((f) => f.key)).not.toContain("phoneNumber");
    expect(completenessSentence(casaEugenioTavares())).toBe(
      "four of eight fields recorded"
    );
  });

  it("asks nothing about a field the category is not counted on", () => {
    // An empty contact field on a heritage record is not a gap, so no row and no
    // question — otherwise every square would be asked for its telephone number.
    const keys = placeFields(
      base({
        category: "Heritage",
        phoneNumber: null,
        email: null,
        website: null,
      })
    ).map((f) => f.key);

    expect(keys).not.toContain("phoneNumber");
  });

  it("still counts contact fields for the categories that carry them", () => {
    const counted = countedFields(
      base({
        category: "Restaurant",
        heroImage: null,
        phoneNumber: null,
        details: { phoneNumber: "", openingHours: "", cuisine: [] },
      } as Partial<DirectoryEntry>)
    );

    expect(counted.map((f) => f.key)).toContain("phoneNumber");
  });
});

describe("completenessSentence", () => {
  it("reads the backend's own count", () => {
    expect(completenessSentence(base())).toBe("six of nine fields recorded");
  });

  it("falls back to the rendered grid when the API sent no completeness", () => {
    expect(completenessSentence(base({ completeness: undefined }))).toBe(
      "six of nine fields recorded"
    );
  });

  it("agrees in number for a single field", () => {
    expect(
      completenessSentence(
        base({ completeness: { documented: 1, total: 1, missingFields: [] } })
      )
    ).toBe("one of one field recorded");
  });

  it("says nothing is recorded rather than 'zero of nine'", () => {
    expect(
      completenessSentence(
        base({
          completeness: {
            documented: 0,
            total: 9,
            missingFields: [],
          },
        })
      )
    ).toBe("nothing recorded yet");
  });
});
