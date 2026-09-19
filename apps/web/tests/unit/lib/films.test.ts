import { describe, it, expect } from "vitest";
import {
  archiveCountLine,
  facetCounts,
  filmFacet,
  filmMetaTitle,
  filmsIntro,
  filmsStripNote,
  filmToMediaItem,
  formatFilmLength,
  ONE_PAGE_LINE,
  othersLine,
  pickFeatured,
  playerNote,
  searchFilms,
  sortFilms,
  sourceDotColor,
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
  return {
    id: `f-${seq}`,
    title: `Film ${seq}`,
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

/** Production today: nine titled YouTube films, no lengths. */
const PRODUCTION: Film[] = Array.from({ length: 9 }, (_, i) =>
  film({ id: `p${i}`, title: `Title ${String.fromCharCode(73 - i)}` })
);

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

describe("filmToMediaItem", () => {
  it("maps the prototype's card shape", () => {
    expect(filmToMediaItem(HANDOFF[5])).toMatchObject({
      id: "f6",
      title: "Title not recorded",
      category: "Film",
      author: "Source not recorded",
      thumbnailUrl: undefined,
      duration: undefined,
      type: "VIDEO",
    });
    expect(filmToMediaItem(HANDOFF[0]).author).toBe("YouTube");
  });
});

// ─── Facets, search, sorts ───────────────────────────────────────────────────

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

describe("display values", () => {
  it("colours the source dot", () => {
    expect(sourceDotColor("YouTube")).toBe("var(--brand-ocean-blue)");
    expect(sourceDotColor("Archive file")).toBe("var(--brand-ocean-blue)");
    expect(sourceDotColor("Vimeo")).toBe("var(--brand-valley-green)");
    expect(sourceDotColor(null)).toBe("var(--brand-sobrado-ochre)");
  });

  it("formats a length only when one is recorded", () => {
    expect(formatFilmLength(null)).toBeNull();
    expect(formatFilmLength(0)).toBeNull();
    expect(formatFilmLength(125)).toBe("2:05");
    expect(formatFilmLength(3725)).toBe("1:02:05");
  });

  it("writes the player note per source", () => {
    expect(playerNote(HANDOFF[0])).toBe("Embedded from YouTube · plays here");
    expect(playerNote(film({ source: "Archive file" }))).toBe(
      "Archive file · plays here"
    );
    expect(playerNote(HANDOFF[5])).toBe("Source not recorded");
  });

  it("titles an untitled film page", () => {
    expect(filmMetaTitle(HANDOFF[5])).toBe("An untitled film of Brava");
    expect(filmMetaTitle(HANDOFF[3])).toBe("Nova Sintra em Agosto");
  });
});

// ─── Copy ────────────────────────────────────────────────────────────────────

describe("filmsIntro", () => {
  it("returns the handoff's sentence for the handoff's data", () => {
    expect(filmsIntro(HANDOFF)).toBe(
      "Nine films in the archive. Four carry a title, none records a length, and the collection grows as footage is contributed."
    );
  });

  it("drops the titled clause when every film has a title", () => {
    expect(filmsIntro(PRODUCTION)).toBe(
      "Nine films in the archive. None records a length, and the collection grows as footage is contributed."
    );
  });

  it("drops the length clause once any film records one", () => {
    const films = [...PRODUCTION.slice(1), film({ durationSeconds: 60 })];
    expect(filmsIntro(films)).toBe(
      "Nine films in the archive. The collection grows as footage is contributed."
    );
  });

  it("agrees in the singular and at zero", () => {
    expect(filmsIntro([film({ title: null })])).toBe(
      "One film in the archive. None carries a title, it records no length, and the collection grows as footage is contributed."
    );
    expect(filmsIntro([])).toBe(
      "No films in the archive yet. The collection grows as footage is contributed."
    );
  });
});

describe("filmsStripNote", () => {
  it("returns the handoff's sentence for the handoff's data", () => {
    expect(filmsStripNote(HANDOFF)).toBe(
      "Footage contributed to the archive. Four carry a title; the rest are waiting on the sync."
    );
  });

  it("says nothing about titles when all are titled", () => {
    expect(filmsStripNote(PRODUCTION)).toBe(
      "Footage contributed to the archive."
    );
  });

  it("counts no titles from a partial list", () => {
    expect(filmsStripNote(HANDOFF, 120)).toBe(
      "Footage contributed to the archive."
    );
  });

  it("agrees in the singular", () => {
    expect(filmsStripNote([film(), film({ title: null })])).toBe(
      "Footage contributed to the archive. One carries a title; the rest are waiting on the sync."
    );
  });
});

describe("count lines", () => {
  it("formats the prototype's count lines", () => {
    expect(othersLine(8)).toBe("8 others in the archive");
    expect(othersLine(1)).toBe("1 other in the archive");
    expect(archiveCountLine(9)).toBe("9 in the archive");
    expect(ONE_PAGE_LINE).toBe(
      "Every film fits on one page today. Pagination starts past twenty-four."
    );
  });
});
