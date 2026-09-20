import { describe, expect, it } from "vitest";

import {
  ASPECT_FALLBACK,
  photoAspectRatio,
  photoDateLabel,
  photoFacts,
  photoFilename,
  photoTitle,
} from "@/lib/photo-facts";
import type {
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "m-1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-07-12T10:00:00Z",
    publicUrl: "https://cdn.example/DJI_0177.JPG",
    originalName: "DJI_0177.JPG",
    width: 388,
    height: 287,
    latitude: 14.8632,
    longitude: -24.7183,
    dateTaken: "2024-07-12T10:00:00Z",
    cameraMake: "DJI",
    cameraModel: "FC3582",
    ...overrides,
  };
}

function film(
  overrides: Partial<PublicExternalMedia> = {}
): PublicExternalMedia {
  return {
    id: "f-1",
    title: "Brava from the sea",
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "EXTERNAL",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: "abc",
    url: "https://youtu.be/abc",
    thumbnailUrl: null,
    embedUrl: null,
    author: null,
    ...overrides,
  };
}

/** Spec 034 T-25 / T-30 / T-31 — one derivation for every photograph surface. */
describe("photoTitle", () => {
  it("falls back to Untitled in italic secondary ink", () => {
    expect(photoTitle(upload({ title: null }))).toEqual({
      text: "Untitled",
      untitled: true,
    });
  });

  it("keeps a recorded title", () => {
    expect(photoTitle(upload({ title: "Lomba Tantun" }))).toEqual({
      text: "Lomba Tantun",
      untitled: false,
    });
  });

  it("treats a blank title as untitled", () => {
    expect(photoTitle(upload({ title: "   " })).untitled).toBe(true);
  });
});

describe("photoFilename", () => {
  it("is the name the file arrived under", () => {
    expect(photoFilename(upload())).toBe("DJI_0177.JPG");
  });

  it("is null for a film, which has no file", () => {
    expect(photoFilename(film())).toBeNull();
  });
});

describe("photoDateLabel", () => {
  it("reads a date taken as a long date", () => {
    expect(photoDateLabel(upload({ dateTaken: "2024-07-12T10:00:00Z" }))).toBe(
      "July 12, 2024"
    );
  });

  it("passes an approximate date through as written", () => {
    expect(
      photoDateLabel(
        upload({
          dateTaken: undefined,
          approximateDate: "sometime in the sixties",
        })
      )
    ).toBe("sometime in the sixties");
  });

  it("is null when neither is recorded", () => {
    expect(
      photoDateLabel(
        upload({ dateTaken: undefined, approximateDate: undefined })
      )
    ).toBeNull();
  });
});

describe("photoAspectRatio", () => {
  it("uses the stored dimensions so the tile reserves its shape", () => {
    expect(photoAspectRatio(upload({ width: 388, height: 287 }))).toBe(
      "388 / 287"
    );
  });

  it("falls back for a row that predates the backfill", () => {
    expect(photoAspectRatio(upload({ width: null, height: null }))).toBe(
      ASPECT_FALLBACK
    );
  });

  it("falls back when a dimension is zero rather than dividing by it", () => {
    expect(photoAspectRatio(upload({ width: 0, height: 300 }))).toBe(
      ASPECT_FALLBACK
    );
  });

  it("falls back on a negative dimension, which CSS would reject outright", () => {
    // Zero is caught by falsiness alone; only this case exercises the `<= 0` guard.
    expect(photoAspectRatio(upload({ width: -388, height: 300 }))).toBe(
      ASPECT_FALLBACK
    );
    expect(photoAspectRatio(upload({ width: 388, height: -300 }))).toBe(
      ASPECT_FALLBACK
    );
  });
});

describe("photoFacts", () => {
  it("names every missing field in ochre and every known one plainly", () => {
    const facts = photoFacts(
      upload({
        title: null,
        category: null,
        dateTaken: undefined,
        latitude: undefined,
        longitude: undefined,
      })
    );

    expect(facts.missing).toEqual([
      "no title",
      "no photographer",
      "no place",
      "no date",
      "no category",
    ]);
    expect(facts.known).toEqual([]);
    expect(facts.located).toBe(false);
  });

  it("drops the pills that are answered and lists what is known", () => {
    const facts = photoFacts(
      upload({
        title: "Lomba Tantun",
        category: "Landscape",
        photographerCredit: "Ana Lopes",
      })
    );

    expect(facts.missing).toEqual([]);
    expect(facts.known).toEqual(["July 12, 2024", "Landscape"]);
    expect(facts.located).toBe(true);
  });

  it('counts "not known" as no photographer, because it is an answer not a name', () => {
    const facts = photoFacts(upload({ photographerCredit: "not known" }));

    expect(facts.missing).toContain("no photographer");
  });

  it("reads a film's credit from its author", () => {
    expect(photoFacts(film({ author: "RTC" })).missing).not.toContain(
      "no photographer"
    );
  });

  it("never asks a film for a place: films carry no coordinates", () => {
    expect(photoFacts(film()).missing).not.toContain("no place");
  });
});
