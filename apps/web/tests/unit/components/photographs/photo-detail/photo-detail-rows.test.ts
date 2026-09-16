import { describe, expect, it } from "vitest";

import {
  askRows,
  knownRows,
  positionLine,
  showOnMapLink,
} from "@/components/photographs/photo-detail/photo-detail-rows";
import type { PublicUserUploadMedia } from "@/types/gallery";

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "p1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/DJI_0177.JPG",
    originalName: "DJI_0177.JPG",
    width: 388,
    height: 287,
    ...overrides,
  };
}

/** Spec 034 T-31 / FR-010 — what we know, and what we are asking for. */
describe("knownRows", () => {
  it("reads the file's date, camera and coordinates", () => {
    const rows = knownRows(
      upload({
        dateTaken: "2024-07-12T10:00:00Z",
        cameraMake: "DJI",
        cameraModel: "FC3582",
        latitude: 14.8632,
        longitude: -24.7183,
        category: "Landscape",
      })
    );

    expect(rows).toEqual([
      {
        key: "date",
        label: "Date taken",
        value: "July 12, 2024",
        note: "· read from the file",
      },
      { key: "camera", label: "Camera", value: "DJI FC3582" },
      {
        key: "coordinates",
        label: "Coordinates",
        value: "14.8632, −24.7183",
        note: "· from the file",
        mono: true,
      },
      { key: "category", label: "Category", value: "Landscape" },
    ]);
  });

  it("does not dress a recollection as a measurement", () => {
    const rows = knownRows(
      upload({ approximateDate: "sometime in the sixties" })
    );

    expect(rows[0]).toEqual({
      key: "date",
      label: "Date taken",
      value: "sometime in the sixties",
      note: "· as told to us",
    });
  });

  it("says so when the file is all there is", () => {
    expect(knownRows(upload())).toEqual([
      {
        key: "everything",
        label: "Everything",
        value: "nothing recorded but the file itself",
      },
    ]);
  });

  it("lists a recorded place name and photographer", () => {
    const rows = knownRows(
      upload({ locationName: "Fajã d'Água", photographerCredit: "Ana Lopes" })
    );

    expect(rows.map((r) => r.key)).toEqual(["place", "photographer"]);
  });
});

describe("askRows", () => {
  it("asks for everything a bare record lacks", () => {
    expect(askRows(upload())).toEqual([
      {
        key: "photographerCredit",
        label: "Photographer",
        question: "Do you know who took this?",
      },
      { key: "title", label: "Title", question: "Give it a name" },
      { key: "latitude", label: "Place", question: "Where was this taken?" },
      {
        key: "dateTaken",
        label: "Date",
        question: "Roughly when was it taken?",
      },
    ]);
  });

  it("asks what a located point is called rather than where it is", () => {
    const rows = askRows(upload({ latitude: 14.86, longitude: -24.71 }));

    expect(rows.map((r) => r.label)).toContain("Place name");
    expect(rows.map((r) => r.label)).not.toContain("Place");
  });

  it("stops asking once the place is named", () => {
    const rows = askRows(
      upload({
        latitude: 14.86,
        longitude: -24.71,
        locationName: "Fajã d'Água",
      })
    );

    expect(rows.map((r) => r.key)).not.toContain("locationName");
  });

  it("asks nothing of a fully recorded photograph", () => {
    expect(
      askRows(
        upload({
          title: "Lomba Tantun",
          photographerCredit: "Ana Lopes",
          latitude: 14.86,
          longitude: -24.71,
          locationName: "Lomba Tantun",
          dateTaken: "2024-07-14T10:00:00Z",
        })
      )
    ).toEqual([]);
  });

  it("treats a credit of 'not known' as still unanswered", () => {
    expect(
      askRows(upload({ photographerCredit: "not known" })).map((r) => r.key)
    ).toContain("photographerCredit");
  });
});

describe("positionLine", () => {
  it("places a located record in the sequence and names the keys", () => {
    expect(
      positionLine(upload({ latitude: 14.86, longitude: -24.71 }), {
        id: "p1",
        position: 3,
        total: 11,
        previousId: "p0",
        nextId: "p2",
      })
    ).toBe("Photograph 3 of 11 with coordinates · use the arrow keys");
  });

  it("says an unlocated record has no place", () => {
    expect(
      positionLine(upload(), {
        id: "p1",
        position: null,
        total: 11,
        previousId: null,
        nextId: null,
      })
    ).toBe("This one has no place recorded");
  });

  it("trusts the record's own coordinates over a position the sequence claims", () => {
    // A record with no coordinates is not in the located sequence at all. If the API
    // ever hands one a position anyway, the line must not invent a place for it.
    expect(
      positionLine(upload(), {
        id: "p1",
        position: 3,
        total: 11,
        previousId: "p0",
        nextId: "p2",
      })
    ).toBe("This one has no place recorded");
  });

  it("says the same when the sequence could not be loaded", () => {
    expect(
      positionLine(upload({ latitude: 14.86, longitude: -24.71 }), null)
    ).toBe("This one has no place recorded");
  });
});

describe("showOnMapLink", () => {
  it("selects the pin for a located record", () => {
    expect(showOnMapLink(upload({ latitude: 14.86, longitude: -24.71 }))).toBe(
      "/map?mode=photographs&sel=p%3Ap1"
    );
  });

  it("offers nothing for a record with no pin", () => {
    expect(showOnMapLink(upload())).toBeNull();
  });
});
