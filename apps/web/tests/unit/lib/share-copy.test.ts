import { getTranslations } from "next-intl/server";
import { describe, expect, it } from "vitest";

import { missingFields, type ArchivePhoto } from "@/lib/archive-photographs";
import {
  askDescription,
  askShareText,
  filmArrivalLine,
  filmShareText,
  photoArrivalLine,
  photoShareText,
  askTitle,
  townArrivalLine,
  townHoldings,
  townShareText,
} from "@/lib/share-copy";

const t = await getTranslations("share");
const tPhotographs = await getTranslations("photographs");

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
    expect(askDescription(photo(), t, "en")).toBe(
      "The Brava archive does not know who took it, where it was taken or when it was taken."
    );
  });

  it("names a single missing thing", () => {
    expect(
      askDescription(
        photo({ located: true, missing: { photographer: false, date: true } }),
        t,
        "en"
      )
    ).toBe("The Brava archive does not know when it was taken.");
  });

  it("is null for a complete record", () => {
    expect(askDescription(COMPLETE, t, "en")).toBeNull();
  });
});

describe("askTitle", () => {
  it("asks the question", () => {
    expect(askTitle(t)).toBe("Do you recognise this photograph?");
  });
});

describe("askShareText", () => {
  it("leads with the question", () => {
    expect(askShareText(photo({ located: true }), t, "en")).toBe(
      "Do you recognise this photograph? The Brava archive does not know who took it or when it was taken."
    );
  });

  it("is null when there is nothing to ask", () => {
    expect(askShareText(COMPLETE, t, "en")).toBeNull();
  });
});

describe("photoShareText", () => {
  it("uses the title, the place and the month", () => {
    expect(
      photoShareText(
        photo({ title: "The harbour", near: FAJA, monthYear: "July 1962" }),
        t,
        tPhotographs
      )
    ).toBe("The harbour, Fajã d'Água, July 1962. From the Brava archive.");
  });

  it("prefers the place as a person wrote it", () => {
    expect(
      photoShareText(
        photo({ title: "The harbour", near: FAJA, placeName: "By the pier" }),
        t,
        tPhotographs
      )
    ).toBe("The harbour, By the pier. From the Brava archive.");
  });

  it("does not repeat the settlement when the heading already names it", () => {
    expect(photoShareText(photo({ near: FAJA }), t, tPhotographs)).toBe(
      "Near Fajã d'Água. From the Brava archive."
    );
  });

  it("says something true about a record with nothing recorded", () => {
    expect(photoShareText(photo(), t, tPhotographs)).toBe(
      "A photograph of Brava. From the Brava archive."
    );
  });
});

describe("film and town text", () => {
  it("names the film", () => {
    expect(filmShareText({ displayTitle: "Festa de São João" }, t)).toBe(
      "Festa de São João. A film in the Brava archive."
    );
  });

  it("counts a town's holdings, singular and plural", () => {
    expect(townHoldings({ photographCount: 23, entryCount: 5 }, t)).toBe(
      "23 photographs · 5 place records"
    );
    expect(townHoldings({ photographCount: 1, entryCount: 1 }, t)).toBe(
      "1 photograph · 1 place record"
    );
    expect(townHoldings({ photographCount: 0, entryCount: 3 }, t)).toBe(
      "3 place records"
    );
    expect(townHoldings({ photographCount: 0, entryCount: 0 }, t)).toBeNull();
  });

  it("writes a large count without a thousands separator, as before", () => {
    expect(townHoldings({ photographCount: 1234, entryCount: 0 }, t)).toBe(
      "1234 photographs"
    );
  });

  it("shares a town with its holdings, or without", () => {
    expect(
      townShareText({ name: "Furna", photographCount: 23, entryCount: 5 }, t)
    ).toBe("Furna in the Brava archive: 23 photographs · 5 place records.");
    expect(
      townShareText({ name: "Furna", photographCount: 0, entryCount: 0 }, t)
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

    expect(photoArrivalLine(here, photos, t)).toEqual({
      text: "From the Brava archive · 2 more photographs near Fajã d'Água",
      href: "/photographs?place=faja-dagua",
    });
  });

  it("uses the singular for one other photograph", () => {
    const here = photo({ id: "a", near: FAJA });

    expect(
      photoArrivalLine(here, [here, photo({ id: "b", near: FAJA })], t).text
    ).toBe("From the Brava archive · 1 more photograph near Fajã d'Água");
  });

  it("falls back when the photograph is alone or unplaced", () => {
    const alone = photo({ id: "a", near: FAJA });
    const fallback = {
      text: "From the Brava archive, a community record of Brava Island",
      href: "/photographs",
    };

    expect(photoArrivalLine(alone, [alone], t)).toEqual(fallback);
    expect(photoArrivalLine(photo(), [photo()], t)).toEqual(fallback);
  });

  it("counts the other films, or leaves the count out", () => {
    const films = [{ id: "a" }, { id: "b" }, { id: "c" }];

    expect(filmArrivalLine({ id: "a" }, films, t)).toEqual({
      text: "From the Brava archive · 2 more films",
      href: "/films",
    });
    expect(
      filmArrivalLine({ id: "a" }, [{ id: "a" }, { id: "b" }], t).text
    ).toBe("From the Brava archive · 1 more film");
    expect(filmArrivalLine({ id: "a" }, [{ id: "a" }], t).text).toBe(
      "From the Brava archive · more films"
    );
    expect(filmArrivalLine({ id: "a" }, null, t).text).toBe(
      "From the Brava archive · more films"
    );
  });

  it("sends a town arrival to the settlements", () => {
    expect(townArrivalLine(t)).toEqual({
      text: "Part of the Brava archive · all settlements",
      href: "/settlements",
    });
  });
});
