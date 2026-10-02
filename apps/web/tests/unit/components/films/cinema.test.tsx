import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FilmsCinema } from "@/components/films/cinema/films-cinema";
import {
  AllFilmsGrid,
  narrowingFacets,
} from "@/components/films/cinema/all-films-grid";
import { heroMayAutoplay } from "@/components/films/cinema/cinema-hero";
import { FilmsStrip } from "@/components/films/films-strip";
import type {
  HostCallbacks,
  MountOptions,
} from "@/components/films/hosts/types";

import { mockMatchMedia } from "../../../setup/match-media-mock";
import { makeFilm } from "./film-fixture";

const mounts: {
  cb: HostCallbacks;
  options: MountOptions;
  handle: { setMuted: ReturnType<typeof vi.fn> };
}[] = [];
function fakeMount(
  _c: HTMLElement,
  _id: string,
  _t: string,
  cb: HostCallbacks,
  options: MountOptions
) {
  const handle = {
    play: vi.fn(),
    pause: vi.fn(),
    setMuted: vi.fn(),
    seek: vi.fn(),
    destroy: vi.fn(),
  };
  mounts.push({ cb, options, handle });
  return handle;
}
vi.mock("@/components/films/hosts/youtube", () => ({
  mountYouTube: fakeMount,
}));
vi.mock("@/components/films/hosts/vimeo", () => ({ mountVimeo: fakeMount }));
vi.mock("@/components/films/hosts/file", () => ({ mountFile: fakeMount }));

const DESKTOP = "(min-width: 768px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const FEATURED = makeFilm("f1", {
  displayTitle: "Walking Nova Sintra",
  place: { slug: "nova-sintra", name: "Nova Sintra" },
  description: "A walk through the town.",
});
const FILMS = [FEATURED, makeFilm("f2"), makeFilm("f3", { playback: null })];

/** Spec 038 FR-030 to FR-032 — the films index. */
describe("FilmsCinema", () => {
  let media: ReturnType<typeof mockMatchMedia>;
  beforeEach(() => {
    mounts.length = 0;
  });
  afterEach(() => media?.restore());

  it("plays the featured film muted on a desktop", () => {
    media = mockMatchMedia({ [DESKTOP]: true, [REDUCED]: false });
    render(<FilmsCinema films={FILMS} featured={FEATURED} />);
    expect(mounts).toHaveLength(1);
    expect(mounts[0].options).toEqual({ muted: true, loop: true });

    act(() => mounts[0].cb.onPlaying());
    expect(screen.getByText("Playing muted")).toBeInTheDocument();
    act(() => {
      screen.getByRole("button", { name: "Sound off · Turn on" }).click();
    });
    expect(mounts[0].handle.setMuted).toHaveBeenCalledWith(false);
    expect(screen.getByText("Playing")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sound on · Mute" })
    ).toBeInTheDocument();

    // The loop can be stopped (WCAG 2.2.2), and started again.
    act(() => {
      screen.getByRole("button", { name: "Pause" }).click();
    });
    expect(screen.getByText("Film of the month")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play Walking Nova Sintra, muted" })
    ).toBeInTheDocument();
  });

  it("waits for a click on a phone or with reduced motion", async () => {
    media = mockMatchMedia({ [DESKTOP]: false, [REDUCED]: false });
    render(<FilmsCinema films={FILMS} featured={FEATURED} />);
    expect(mounts).toHaveLength(0);
    expect(screen.getByText("Film of the month")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Play Walking Nova Sintra, muted" })
    );
    expect(mounts).toHaveLength(1);
  });

  it("shows the hero's record, links and every other film", () => {
    media = mockMatchMedia({ [DESKTOP]: false });
    render(<FilmsCinema films={FILMS} featured={FEATURED} />);
    const hero = within(screen.getByRole("region", { name: "Featured film" }));
    expect(
      hero.getByRole("heading", { level: 1, name: "Walking Nova Sintra" })
    ).toBeInTheDocument();
    expect(hero.getByText("Filmed near Nova Sintra")).toBeInTheDocument();
    expect(
      hero.getByRole("link", { name: "Watch with sound" })
    ).toHaveAttribute("href", "/films/f1?play=1");
    expect(hero.getByRole("link", { name: "Film page" })).toHaveAttribute(
      "href",
      "/films/f1"
    );
    expect(screen.getByText("Three in the archive")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Film f2/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Film f3/ })).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});

/** Spec 039 E4 — the films grid always ends with the dashed invitation cell. */
describe("AllFilmsGrid invitation cell", () => {
  it("closes the grid with a link to the film form", () => {
    render(<AllFilmsGrid films={[makeFilm("a"), makeFilm("b")]} />);
    const links = screen.getAllByRole("link");
    const last = links[links.length - 1];

    expect(screen.getByText("Have a film of Brava?")).toBeInTheDocument();
    expect(screen.getByText("A link is enough.")).toBeInTheDocument();
    expect(last).toHaveAccessibleName("Send a film link");
    expect(last).toHaveAttribute("href", "/contribute/media?kind=film");
  });
});

describe("narrowingFacets (FR-032)", () => {
  it("shows no facet while every one equals all or nothing", () => {
    expect(narrowingFacets([makeFilm("a"), makeFilm("b")])).toEqual([]);
  });

  it("brings back a facet that would narrow the list", () => {
    const facets = narrowingFacets([
      makeFilm("a"),
      makeFilm("b", { title: null }),
    ]);
    expect(facets.map((f) => [f.key, f.count])).toEqual([["titled", 1]]);
  });
});

describe("heroMayAutoplay", () => {
  it("needs desktop width, motion and no Save-Data", () => {
    const win = (desktop: boolean, reduced: boolean, saveData?: boolean) =>
      ({
        matchMedia: (q: string) => ({
          matches: q === DESKTOP ? desktop : q === REDUCED ? reduced : false,
        }),
        navigator: { connection: { saveData } },
      }) as unknown as Window;
    expect(heroMayAutoplay(win(true, false))).toBe(true);
    expect(heroMayAutoplay(win(false, false))).toBe(false);
    expect(heroMayAutoplay(win(true, true))).toBe(false);
    expect(heroMayAutoplay(win(true, false, true))).toBe(false);
  });
});

/** Spec 038 FR-050 — the home strip. */
describe("FilmsStrip", () => {
  it("shows three promotable films as cards", () => {
    render(
      <FilmsStrip
        films={[
          makeFilm("a", { identifiablePerson: true }),
          makeFilm("b"),
          makeFilm("c"),
          makeFilm("d"),
          makeFilm("e"),
        ]}
      />
    );
    expect(screen.getByRole("heading", { name: "Films" })).toBeInTheDocument();
    expect(
      screen.getByText("Footage of Brava contributed to the archive.")
    ).toBeInTheDocument();
    const cards = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.startsWith("/films/"));
    expect(cards.map((c) => c.getAttribute("href"))).toEqual([
      "/films/b",
      "/films/c",
      "/films/d",
    ]);
  });

  it("is absent with nothing to show", () => {
    const { container } = render(<FilmsStrip films={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
