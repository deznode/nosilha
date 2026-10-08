import { describe, expect, it } from "vitest";

import { missingFields, type ArchivePhoto } from "@/lib/archive-photographs";
import {
  ASK_TITLE,
  TOWN_ARRIVAL_LINE,
  askDescription,
  askShareText,
  filmArrivalLine,
  filmShareText,
  photoArrivalLine,
  photoShareText,
  townHoldings,
  townShareText,
} from "@/lib/share-copy";

const FAJA = { slug: "faja-dagua", name: "Fajã d'Água" };

function photo(over: Partial<ArchivePhoto> = {}): ArchivePhoto {
  return {
    id: "a",
    src: "https://media.nosilha.com/a.jpg",
    alt: "",
    title: null,
    description: null,
    near: null,
    located: false,
    placeName: null,
    credit: null,
    monthYear: null,
    dateLabel: null,
    camera: null,
    category: null,
    identifiablePerson: false,
    missing: { photographer: true, date: true },
    ...over,
  };
}

const COMPLETE = photo({
  located: true,
  credit: "Ana",
  dateLabel: "July 12, 1962",
  monthYear: "July 1962",
  missing: { photographer: false, date: false },
});

describe("missingFields", () => {
  it("lists what the record lacks, photographer first", () => {
    expect(missingFields(photo())).toEqual(["photographer", "place", "date"]);
    expect(missingFields(photo({ placeName: "By the harbour" }))).toEqual([
      "photographer",
      "date",
    ]);
    expect(missingFields(COMPLETE)).toEqual([]);
  });
});

describe("askDescription", () => {
  it("names everything missing in one sentence", () => {
    expect(askDescription(photo())).toBe(
      "The Brava archive does not know who took it, where it was taken or when it was taken."
    );
  });

  it("names a single missing thing", () => {
    expect(
      askDescription(
        photo({ located: true, missing: { photographer: false, date: true } })
      )
    ).toBe("The Brava archive does not know when it was taken.");
  });

  it("is null for a complete record", () => {
    expect(askDescription(COMPLETE)).toBeNull();
  });
});

describe("askShareText", () => {
  it("leads with the question", () => {
    expect(askShareText(photo({ located: true }))).toBe(
      `${ASK_TITLE} The Brava archive does not know who took it or when it was taken.`
    );
  });

  it("is null when there is nothing to ask", () => {
    expect(askShareText(COMPLETE)).toBeNull();
  });
});

describe("photoShareText", () => {
  it("uses the title, the place and the month", () => {
    expect(
      photoShareText(
        photo({ title: "The harbour", near: FAJA, monthYear: "July 1962" })
      )
    ).toBe("The harbour, Fajã d'Água, July 1962. From the Brava archive.");
  });

  it("prefers the place as a person wrote it", () => {
    expect(
      photoShareText(
        photo({ title: "The harbour", near: FAJA, placeName: "By the pier" })
      )
    ).toBe("The harbour, By the pier. From the Brava archive.");
  });

  it("does not repeat the settlement when the heading already names it", () => {
    expect(photoShareText(photo({ near: FAJA }))).toBe(
      "Near Fajã d'Água. From the Brava archive."
    );
  });

  it("says something true about a record with nothing recorded", () => {
    expect(photoShareText(photo())).toBe(
      "A photograph of Brava. From the Brava archive."
    );
  });
});

describe("film and town text", () => {
  it("names the film", () => {
    expect(filmShareText({ displayTitle: "Festa de São João" })).toBe(
      "Festa de São João. A film in the Brava archive."
    );
  });

  it("counts a town's holdings, singular and plural", () => {
    expect(townHoldings({ photographCount: 23, entryCount: 5 })).toBe(
      "23 photographs · 5 place records"
    );
    expect(townHoldings({ photographCount: 1, entryCount: 1 })).toBe(
      "1 photograph · 1 place record"
    );
    expect(townHoldings({ photographCount: 0, entryCount: 3 })).toBe(
      "3 place records"
    );
    expect(townHoldings({ photographCount: 0, entryCount: 0 })).toBeNull();
  });

  it("shares a town with its holdings, or without", () => {
    expect(
      townShareText({ name: "Furna", photographCount: 23, entryCount: 5 })
    ).toBe("Furna in the Brava archive: 23 photographs · 5 place records.");
    expect(
      townShareText({ name: "Furna", photographCount: 0, entryCount: 0 })
    ).toBe("Furna in the Brava archive.");
  });
});

describe("arrival lines", () => {
  it("counts the other photographs near the same settlement", () => {
    const here = photo({ id: "a", near: FAJA });
    const photos = [
      here,
      photo({ id: "b", near: FAJA }),
      photo({ id: "c", near: FAJA }),
      photo({ id: "d" }),
    ];

    expect(photoArrivalLine(here, photos)).toEqual({
      text: "From the Brava archive · 2 more photographs near Fajã d'Água",
      href: "/photographs?place=faja-dagua",
    });
  });

  it("uses the singular for one other photograph", () => {
    const here = photo({ id: "a", near: FAJA });

    expect(
      photoArrivalLine(here, [here, photo({ id: "b", near: FAJA })]).text
    ).toBe("From the Brava archive · 1 more photograph near Fajã d'Água");
  });

  it("falls back when the photograph is alone or unplaced", () => {
    const alone = photo({ id: "a", near: FAJA });
    const fallback = {
      text: "From the Brava archive, a community record of Brava Island",
      href: "/photographs",
    };

    expect(photoArrivalLine(alone, [alone])).toEqual(fallback);
    expect(photoArrivalLine(photo(), [photo()])).toEqual(fallback);
  });

  it("counts the other films, or leaves the count out", () => {
    const films = [{ id: "a" }, { id: "b" }, { id: "c" }];

    expect(filmArrivalLine({ id: "a" }, films)).toEqual({
      text: "From the Brava archive · 2 more films",
      href: "/films",
    });
    expect(filmArrivalLine({ id: "a" }, [{ id: "a" }, { id: "b" }]).text).toBe(
      "From the Brava archive · 1 more film"
    );
    expect(filmArrivalLine({ id: "a" }, [{ id: "a" }]).text).toBe(
      "From the Brava archive · more films"
    );
    expect(filmArrivalLine({ id: "a" }, null).text).toBe(
      "From the Brava archive · more films"
    );
  });

  it("sends a town arrival to the settlements", () => {
    expect(TOWN_ARRIVAL_LINE).toEqual({
      text: "Part of the Brava archive · all settlements",
      href: "/settlements",
    });
  });
});
