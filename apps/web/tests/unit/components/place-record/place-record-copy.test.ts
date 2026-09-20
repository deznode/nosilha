import { describe, expect, it } from "vitest";

import {
  alsoRecorded,
  categoryLabel,
  heroCredit,
  heroEyebrow,
  photographsNote,
  ratingNote,
} from "@/components/place-record/place-record-copy";
import type { DirectoryEntry } from "@/types/directory";

function entry(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
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
    details: null,
    heroImage: {
      mediaId: "m1",
      url: "https://cdn.example/igreja.jpg",
      photographerCredit: null,
      archiveSource: null,
    },
    ...overrides,
  } as DirectoryEntry;
}

/** Spec 034 T-28 / FR-013 — the record states its own gaps. */
describe("heroEyebrow", () => {
  it("names the settlement and the category", () => {
    expect(heroEyebrow(entry())).toBe("Nossa Senhora do Monte · Heritage");
  });

  it("calls accommodation Stay, the label the archive uses", () => {
    expect(heroEyebrow(entry({ category: "Hotel" }))).toBe(
      "Nossa Senhora do Monte · Stay"
    );
    expect(categoryLabel("Heritage")).toBe("Heritage");
  });

  it("drops the separator when no settlement has resolved", () => {
    expect(heroEyebrow(entry({ town: "" }))).toBe("Heritage");
  });
});

describe("heroCredit", () => {
  it("says the photographer is not recorded", () => {
    expect(heroCredit(entry())).toBe("photographer not recorded");
  });

  it("treats 'not known' as not recorded, because it names nobody", () => {
    expect(
      heroCredit(
        entry({
          heroImage: {
            mediaId: "m",
            url: "u",
            photographerCredit: "not known",
            archiveSource: null,
          },
        })
      )
    ).toBe("photographer not recorded");
  });

  it("names the credit and its source when both are recorded", () => {
    expect(
      heroCredit(
        entry({
          heroImage: {
            mediaId: "m",
            url: "u",
            photographerCredit: "NosIlha, 2024",
            archiveSource: "CC BY-SA 4.0",
          },
        })
      )
    ).toBe("NosIlha, 2024 · CC BY-SA 4.0");
  });

  it("has no chip at all when the record carries no hero", () => {
    expect(heroCredit(entry({ heroImage: null }))).toBeNull();
  });
});

describe("photographsNote", () => {
  it("explains that the picture above is a hero, not an archive record", () => {
    expect(photographsNote(entry(), 0)).toEqual({
      note: "None yet. The photograph above came in as the record's hero image, not as an archive record.",
      showEmptyState: true,
      prompt: "Do you have a photograph of Igreja Nossa Senhora do Monte?",
    });
  });

  it("says nothing extra when there is no hero to explain", () => {
    expect(photographsNote(entry({ heroImage: null }), 0).note).toBeNull();
  });

  it("counts the archive's photographs when it holds some", () => {
    const result = photographsNote(entry(), 3);

    expect(result.note).toBe(
      "Three photographs of this place are in the archive."
    );
    expect(result.showEmptyState).toBe(false);
  });

  it("agrees in number for a single photograph", () => {
    expect(photographsNote(entry(), 1).note).toBe(
      "One photograph of this place is in the archive."
    );
  });
});

describe("alsoRecorded", () => {
  it("names the settlement and says when the record is alone in it", () => {
    expect(alsoRecorded(entry(), 0)).toEqual({
      heading: "Also recorded in Nossa Senhora do Monte",
      emptyNote: "Nothing else. This is the only record in the settlement.",
    });
  });

  it("drops the note once there are siblings to list", () => {
    expect(alsoRecorded(entry(), 2).emptyNote).toBeNull();
  });
});

describe("ratingNote", () => {
  it("explains why a heritage record shows no rating", () => {
    expect(ratingNote(entry())).toBe(
      "Heritage records carry no rating. Ratings appear only where a visitor can stay."
    );
  });

  it("is silent on accommodation, where a rating belongs", () => {
    expect(ratingNote(entry({ category: "Hotel" }))).toBeNull();
  });
});
