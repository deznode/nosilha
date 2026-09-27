import { describe, it, expect } from "vitest";
import {
  canPlay,
  filmEyebrow,
  filmHelpLine,
  filmedNear,
  filmsCountWords,
  filmSourceLine,
  nextPlayable,
  upNext,
  facetCounts,
  filmFacet,
  pickFeatured,
  searchFilms,
  sortFilms,
  toFilm,
  toFilms,
  type Film,
} from "@/lib/films";
import type {
  PublicExternalMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";

// ─── Fixtures ────────────────────────────────────────────────────────────────

let seq = 0;

/** Production shape (2026-09-18): titled, YouTube, a thumbnail, `author` "Nos Ilha". */
function youtube(
  overrides: Partial<PublicExternalMedia> = {}
): PublicExternalMedia {
  seq += 1;
  return {
    id: `yt-${seq}`,
    title: `Film ${seq}`,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "EXTERNAL",
    altText: null,
    createdAt: "2026-01-01T00:00:00Z",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: `vid${seq}abcdef`,
    url: null,
    thumbnailUrl: `https://i.ytimg.com/vi/vid${seq}abcdef/maxresdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/vid${seq}abcdef`,
    author: "Nos Ilha",
    ...overrides,
  };
}

function film(overrides: Partial<Film> = {}): Film {
  seq += 1;
  const title =
    "title" in overrides ? (overrides.title ?? null) : `Film ${seq}`;
  return {
    id: `f-${seq}`,
    title,
    displayTitle: title ?? "Untitled film",
    sourceTitle: title,
    description: null,
    source: "YouTube",
    thumbnailUrl: null,
    durationSeconds: null,
    place: null,
    filmmaker: null,
    featured: false,
    identifiablePerson: false,
    playback: { kind: "youtube", id: `id${seq}` },
    watchUrl: null,
    ...overrides,
  };
}

/** The handoff's fixture: four titled YouTube films, five with nothing recorded. */
const HANDOFF: Film[] = [
  film({ id: "f1", title: "Explorando Furna — Ilha Brava" }),
  film({ id: "f2", title: "Brava — A ilha das Flores Vai Te Encantar" }),
  film({
    id: "f3",
    title: "Holidays in Cabo Verde: Brava Island, the “island of flowers”",
  }),
  film({ id: "f4", title: "Nova Sintra em Agosto" }),
  ...[5, 6, 7, 8, 9].map((n) =>
    film({ id: `f${n}`, title: null, source: null, playback: null })
  ),
];

// ─── toFilm ──────────────────────────────────────────────────────────────────

describe("toFilm", () => {
  it("reads a production YouTube record", () => {
    const f = toFilm(youtube({ id: "a", title: "Nova Sintra em Agosto" }));

    expect(f).toMatchObject({
      id: "a",
      title: "Nova Sintra em Agosto",
      source: "YouTube",
      durationSeconds: null,
      place: null,
      filmmaker: null,
      featured: false,
      identifiablePerson: false,
    });
    expect(f?.playback).toEqual({ kind: "youtube", id: expect.any(String) });
    expect(f?.thumbnailUrl).toMatch(/i\.ytimg\.com/);
    expect(f?.watchUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
  });

  it("never uses author as the filmmaker", () => {
    expect(toFilm(youtube({ author: "Someone Real" }))?.filmmaker).toBeNull();
  });

  it("treats a blank title as not recorded", () => {
    expect(toFilm(youtube({ title: "   " }))?.title).toBeNull();
    expect(toFilm(youtube({ title: null }))?.title).toBeNull();
  });

  it("falls back to the embed URL for a YouTube id", () => {
    const f = toFilm(
      youtube({
        externalId: null,
        embedUrl: "https://www.youtube.com/embed/AbC123xyz",
      })
    );
    expect(f?.playback).toEqual({ kind: "youtube", id: "AbC123xyz" });
  });

  it("reads a Vimeo record", () => {
    const f = toFilm(
      youtube({
        platform: "VIMEO",
        externalId: null,
        thumbnailUrl: null,
        embedUrl: "https://player.vimeo.com/video/76979871",
      })
    );
    expect(f?.source).toBe("Vimeo");
    expect(f?.playback).toEqual({ kind: "vimeo", id: "76979871" });
    expect(f?.watchUrl).toBe("https://vimeo.com/76979871");
    expect(f?.thumbnailUrl).toBeNull();
  });

  it("reads a self-hosted file as an archive file", () => {
    const f = toFilm(
      youtube({
        platform: "SELF_HOSTED",
        externalId: null,
        embedUrl: null,
        thumbnailUrl: null,
        url: "https://media.nosilha.com/films/a.mp4",
        durationSeconds: 125,
      })
    );
    expect(f?.source).toBe("Archive file");
    expect(f?.playback).toEqual({
      kind: "file",
      url: "https://media.nosilha.com/films/a.mp4",
    });
    expect(f?.durationSeconds).toBe(125);
  });

  it("reads an unknown host as source not recorded", () => {
    const f = toFilm(youtube({ platform: "SOUNDCLOUD" }));
    expect(f?.source).toBeNull();
    expect(f?.playback).toBeNull();
  });

  it("returns null for photographs and uploads", () => {
    expect(toFilm(youtube({ mediaType: "IMAGE" }))).toBeNull();
    const upload = {
      id: "u",
      mediaSource: "USER_UPLOAD",
    } as PublicUserUploadMedia;
    expect(toFilm(upload)).toBeNull();
    expect(toFilms([upload, youtube()])).toHaveLength(1);
  });
});

// ─── filmToMediaItem ─────────────────────────────────────────────────────────

describe("facets", () => {
  it("counts every facet, zeros included", () => {
    expect(facetCounts(HANDOFF)).toEqual({
      all: 9,
      titled: 4,
      youtube: 4,
      vimeo: 0,
      file: 0,
    });
  });

  it("falls back to all for an unknown key", () => {
    expect(filmFacet("nope" as never).key).toBe("all");
  });
});

describe("searchFilms", () => {
  it("matches title and source, case-insensitively", () => {
    expect(searchFilms(HANDOFF, "BRAVA").map((f) => f.id)).toEqual([
      "f1",
      "f2",
      "f3",
    ]);
    expect(searchFilms(HANDOFF, "youtube")).toHaveLength(4);
    expect(searchFilms(HANDOFF, "not recorded")).toHaveLength(5);
    expect(searchFilms(HANDOFF, "  ")).toHaveLength(9);
  });
});

describe("sortFilms", () => {
  const ids = (films: Film[]) => films.map((f) => f.id);

  it("title: titled A–Z, untitled last", () => {
    const sorted = sortFilms(HANDOFF, "title");
    expect(ids(sorted).slice(0, 4)).toEqual(["f2", "f1", "f3", "f4"]);
    expect(sorted.slice(4).every((f) => f.title === null)).toBe(true);
  });

  it("needs: untitled first", () => {
    const sorted = sortFilms(HANDOFF, "needs");
    expect(sorted.slice(0, 5).every((f) => f.title === null)).toBe(true);
    expect(ids(sorted).slice(5)).toEqual(["f2", "f1", "f3", "f4"]);
  });

  it("source: by source label, then title", () => {
    const sorted = sortFilms(HANDOFF, "source");
    expect(sorted.slice(0, 5).every((f) => f.source === null)).toBe(true);
    expect(ids(sorted).slice(5)).toEqual(["f2", "f1", "f3", "f4"]);
  });
});

describe("pickFeatured", () => {
  it("prefers the featured record", () => {
    const films = [film({ title: "A" }), film({ title: "Z", featured: true })];
    expect(pickFeatured(films)?.title).toBe("Z");
  });

  it("otherwise takes the first by title", () => {
    expect(pickFeatured(HANDOFF)?.id).toBe("f2");
    expect(pickFeatured(HANDOFF, "needs")?.title).toBeNull();
    expect(pickFeatured([])).toBeNull();
  });

  it("never features a film flagged as showing an identifiable person", () => {
    const films = [
      film({ title: "A", identifiablePerson: true }),
      film({ title: "B" }),
      film({ title: "Z", featured: true, identifiablePerson: true }),
    ];
    expect(pickFeatured(films)?.title).toBe("B");
    expect(pickFeatured([films[0]])).toBeNull();
  });
});

// ─── Display values ──────────────────────────────────────────────────────────

// ─── Spec 038: display fields, Up next and immersion copy ───────────────────

const TOWNS = [
  { id: "t-ns", slug: "nova-sintra", name: "Nova Sintra" },
  { id: "t-fu", slug: "furna", name: "Furna" },
];

describe("toFilm display fields (spec 038 FR-004)", () => {
  it("prefers the curated title and keeps the source title", () => {
    const f = toFilm(
      youtube({
        title: "[4K 60fps] - BRAVA Island - NOVA SINTRA HIKE",
        displayTitle: "Walking Nova Sintra",
        placeId: "t-ns",
        description: "A walk through the town.",
      }),
      TOWNS
    );
    expect(f?.displayTitle).toBe("Walking Nova Sintra");
    expect(f?.title).toBe("Walking Nova Sintra");
    expect(f?.sourceTitle).toBe("[4K 60fps] - BRAVA Island - NOVA SINTRA HIKE");
    expect(f?.description).toBe("A walk through the town.");
    expect(f?.place).toEqual({ slug: "nova-sintra", name: "Nova Sintra" });
  });

  it("tolerates a response without the new fields", () => {
    const f = toFilm(youtube({ title: "Pesca na Brava" }));
    expect(f?.displayTitle).toBe("Pesca na Brava");
    expect(f?.sourceTitle).toBe("Pesca na Brava");
    expect(f?.place).toBeNull();
  });

  it("falls back to Untitled film and drops a description equal to the title", () => {
    expect(toFilm(youtube({ title: null }))?.displayTitle).toBe(
      "Untitled film"
    );
    expect(
      toFilm(youtube({ title: "Same", description: "Same" }))?.description
    ).toBeNull();
    expect(
      toFilm(youtube({ displayTitle: "  ", title: "Host" }))?.displayTitle
    ).toBe("Host");
  });

  it("leaves the place null for an unknown settlement id", () => {
    expect(toFilm(youtube({ placeId: "gone" }), TOWNS)?.place).toBeNull();
  });
});

describe("upNext and nextPlayable (spec 038 FR-043)", () => {
  const NS = { slug: "nova-sintra", name: "Nova Sintra" };
  const current = film({ id: "cur", place: NS });
  const blockedSame = film({ id: "bs", place: NS, playback: null });
  const same = film({ id: "same", place: NS });
  const other = film({ id: "other" });
  const blocked = film({ id: "blocked", playback: null });
  const list = [current, blocked, other, blockedSame, same];

  it("orders same place, then playable, then unplayable", () => {
    expect(upNext(current, list).map((f) => f.id)).toEqual([
      "bs",
      "same",
      "other",
      "blocked",
    ]);
  });

  it("picks the first playable film as next", () => {
    expect(nextPlayable(current, list)?.id).toBe("same");
    expect(nextPlayable(current, [current, blocked])).toBeNull();
    expect(canPlay(blocked)).toBe(false);
  });

  it("has no same-place group when the film has no place", () => {
    expect(upNext(other, list).map((f) => f.id)).toEqual([
      "cur",
      "same",
      "blocked",
      "bs",
    ]);
  });
});

describe("immersion copy (spec 038)", () => {
  it("builds the eyebrow and filmed-near line", () => {
    expect(filmEyebrow(film())).toBe("Film · YouTube");
    expect(filmEyebrow(film({ source: "Archive file" }))).toBe(
      "Film · Archive file"
    );
    expect(filmEyebrow(film({ source: null }))).toBe("Film");
    expect(filmedNear(film({ place: { slug: "furna", name: "Furna" } }))).toBe(
      "Filmed near Furna"
    );
    expect(filmedNear(film())).toBeNull();
  });

  it("builds the source line", () => {
    expect(filmSourceLine(film({ sourceTitle: "Pesca na Brava" }))).toBe(
      "Listed on YouTube as “Pesca na Brava”"
    );
    expect(
      filmSourceLine(
        film({
          source: "Archive file",
          playback: {
            kind: "file",
            url: "https://media.nosilha.com/films/brava_cliffs_final.mp4?v=2",
          },
        })
      )
    ).toBe("Archive file: brava_cliffs_final.mp4");
    expect(filmSourceLine(film({ sourceTitle: null }))).toBeNull();
  });

  it("names only what is missing in the help line", () => {
    expect(filmHelpLine(film())).toBe(
      "Not yet recorded: where it was filmed or who filmed it."
    );
    expect(
      filmHelpLine(film({ place: { slug: "furna", name: "Furna" } }))
    ).toBe("Not yet recorded: who filmed it.");
    expect(
      filmHelpLine(
        film({ place: { slug: "furna", name: "Furna" }, filmmaker: "Ana" })
      )
    ).toBeNull();
  });

  it("counts films in words", () => {
    expect(filmsCountWords(9)).toBe("Nine in the archive");
    expect(filmsCountWords(1)).toBe("One in the archive");
    expect(filmsCountWords(0)).toBe("None in the archive yet");
  });
});
