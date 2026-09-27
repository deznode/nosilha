import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tileSpan } from "@/components/photographs/immersion/immersion-grid";
import { PhotographsImmersion } from "@/components/photographs/immersion/photographs-immersion";

import { makeFilm } from "../../films/film-fixture";
import { FURNA, NOVA_SINTRA, makePhoto } from "../archive-photo-fixture";

const push = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  useSearchParams: () => searchParams,
}));

/** Grid tiles: every photo link but the feature band. */
const gridHrefs = () =>
  screen
    .getAllByRole("link", { name: /Photo [a-d]/ })
    .filter((l) => !l.textContent?.includes("Today"))
    .map((l) => l.getAttribute("href"));

const PHOTOS = [
  makePhoto("a", {
    near: NOVA_SINTRA,
    description: "Rooftops.",
    monthYear: "July 2024",
  }),
  makePhoto("b", { near: NOVA_SINTRA }),
  makePhoto("c", { near: FURNA }),
  makePhoto("d"),
];

/** Spec 038 FR-010 to FR-013 — the photographs index. */
describe("PhotographsImmersion", () => {
  let replaceState: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    searchParams = new URLSearchParams();
    push.mockClear();
    replaceState = vi.spyOn(window.history, "replaceState");
  });
  afterEach(() => {
    replaceState.mockRestore();
    window.sessionStorage.clear();
  });

  it("opens on the feature and leaves it out of the grid under All", () => {
    render(<PhotographsImmersion photos={PHOTOS} featureId="a" films={[]} />);
    const feature = screen.getByRole("link", { name: /Today’s photograph/ });
    expect(feature).toHaveAttribute("href", "/photographs/a");
    expect(within(feature).getByText("Near Nova Sintra")).toBeInTheDocument();
    expect(within(feature).getByText("Rooftops.")).toBeInTheDocument();
    expect(
      within(feature).getByText("Near Nova Sintra · July 2024")
    ).toBeInTheDocument();

    expect(gridHrefs()).toEqual([
      "/photographs/b",
      "/photographs/c",
      "/photographs/d",
    ]);
  });

  it("lists place chips by count and filters from ?place=", () => {
    searchParams = new URLSearchParams("place=nova-sintra");
    render(<PhotographsImmersion photos={PHOTOS} featureId="a" films={[]} />);
    const chips = within(
      screen.getByRole("group", { name: "Filter by place" })
    ).getAllByRole("button");
    expect(chips.map((c) => c.textContent)).toEqual([
      "All4",
      "Nova Sintra2",
      "Furna1",
      "Not yet placed1",
    ]);
    expect(chips[1]).toHaveAttribute("aria-pressed", "true");

    // The feature stays out of the grid only under All.
    expect(gridHrefs()).toEqual([
      "/photographs/a?place=nova-sintra",
      "/photographs/b?place=nova-sintra",
    ]);
  });

  it("replaces the URL when a chip is chosen", async () => {
    render(<PhotographsImmersion photos={PHOTOS} featureId="a" films={[]} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Not yet placed/ })
    );
    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/photographs?place=unplaced"
    );
  });

  it("offers one line of help and opens an unplaced photograph", async () => {
    render(<PhotographsImmersion photos={PHOTOS} featureId="a" films={[]} />);
    expect(
      screen.getByText(
        "Every photograph here is still missing its photographer, and one has no place. Recognise one?"
      )
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Show me one that needs help" })
    );
    expect(push).toHaveBeenCalledWith("/photographs/d?place=unplaced");
  });

  it("shows up to the films given as cards", () => {
    render(
      <PhotographsImmersion
        photos={PHOTOS}
        featureId="a"
        films={[makeFilm("f1"), makeFilm("f2")]}
      />
    );
    expect(screen.getByRole("heading", { name: "Films" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See all films →" })
    ).toHaveAttribute("href", "/films");
    expect(screen.getByRole("link", { name: /Film f1/ })).toHaveAttribute(
      "href",
      "/films/f1"
    );
  });
});

describe("tileSpan", () => {
  it("follows the desktop and mobile span patterns", () => {
    expect(tileSpan(0)).toEqual({ desktop: [2, 2], mobile: [2, 1] });
    expect(tileSpan(3)).toEqual({ desktop: [1, 2], mobile: [1, 1] });
    expect(tileSpan(2)).toEqual({ desktop: [1, 1], mobile: [1, 2] });
    expect(tileSpan(5)).toEqual({ desktop: [1, 1], mobile: [2, 1] });
    expect(tileSpan(7)).toEqual({ desktop: [2, 2], mobile: [1, 1] });
    expect(tileSpan(8)).toEqual({ desktop: [1, 2], mobile: [1, 1] });
  });
});
