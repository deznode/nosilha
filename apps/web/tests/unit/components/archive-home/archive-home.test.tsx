import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArchiveHome } from "@/components/archive-home/archive-home";
import type { GalleryFacets, PublicUserUploadMedia } from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

function town(overrides: Partial<TownStatusSummary> = {}): TownStatusSummary {
  return {
    id: "t",
    slug: "slug",
    name: "Name",
    description: "",
    latitude: 14.86,
    longitude: -24.71,
    entryCount: 0,
    hasPhotograph: false,
    status: "NAME_ONLY",
    population: null,
    elevation: null,
    photographCount: 0,
    unconfirmedPhotographCount: 0,
    ...overrides,
  };
}

function upload(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "m1",
    title: null,
    description: null,
    category: null,
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: null,
    createdAt: "2024-01-01T00:00:00Z",
    publicUrl: "https://cdn.example/a.jpg",
    originalName: "a.jpg",
    width: 388,
    height: 300,
    ...overrides,
  };
}

const FACETS: GalleryFacets = {
  total: 26,
  photographs: 17,
  films: 9,
  withPlace: 11,
  withoutPlace: 15,
  withoutDate: 14,
  uncredited: 26,
};

const TOWNS: TownStatusSummary[] = [
  town({
    slug: "monte",
    name: "Monte",
    status: "DOCUMENTED",
    entryCount: 1,
    hasPhotograph: true,
  }),
  town({
    slug: "nova-sintra",
    name: "Nova Sintra",
    status: "PARTIAL",
    entryCount: 5,
  }),
  town({ slug: "cova-joana", name: "Cova Joana" }),
  town({ slug: "campo-baixo", name: "Campo Baixo" }),
];

function renderHome(
  overrides: Partial<React.ComponentProps<typeof ArchiveHome>> = {}
) {
  return render(
    <ArchiveHome
      towns={TOWNS}
      recordCount={8}
      facets={FACETS}
      stayCount={4}
      ratedStayCount={0}
      hero={upload({
        id: "hero",
        photographerCredit: "NosIlha, 2024",
        archiveSource: "CC BY-SA 4.0",
      })}
      photographRow={[
        upload({ id: "p1" }),
        upload({ id: "p2", title: "Lomba Tantun", category: "Landscape" }),
      ]}
      {...overrides}
    />
  );
}

/** Spec 034 T-25 / FR-006 — the front door of the archive. */
describe("ArchiveHome", () => {
  it("carries the handoff headline over the hero", () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "An archive of Brava, built from what people send us",
      })
    ).toBeInTheDocument();
  });

  it("states the archive's size from live counts", () => {
    renderHome();

    expect(
      screen.getByText(
        "Four settlements, eight place records, seventeen photographs. " +
          "Most of it is still missing, and every gap here is a question."
      )
    ).toBeInTheDocument();
  });

  it("credits the hero and admits what it does not know about it", () => {
    renderHome();

    expect(
      screen.getByText("NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded")
    ).toBeInTheDocument();
  });

  it("falls back to the shipped hero, which states its own credit and gap", () => {
    renderHome({ hero: null });

    expect(screen.getByAltText(/rocky coastline/i)).toHaveAttribute(
      "src",
      "/images/hero.jpg"
    );
    expect(
      screen.getByText("NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded")
    ).toBeInTheDocument();
  });

  it("offers the four routes with live notes", () => {
    renderHome();

    const nav = screen.getByRole("navigation", { name: "The archive" });
    for (const [label, href, note] of [
      ["Settlements", "/settlements", "Four names. One documented."],
      ["Photographs", "/photographs", "Twenty-six records. None credited."],
      ["Map", "/map", "Every point we hold, coloured by what is known."],
      ["Stay", "/stay", "Four places. None rated."],
    ]) {
      const link = within(nav).getByRole("link", { name: new RegExp(label) });
      expect(link).toHaveAttribute("href", href);
      expect(within(link).getByText(note)).toBeInTheDocument();
    }
  });

  it("heads the photograph row with the number it shows", () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        name: "Two photographs, and what each one is missing",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nobody has told us who took any of these.")
    ).toBeInTheDocument();
  });

  it("names each tile's gaps and opens its detail", () => {
    renderHome();

    const tile = screen.getByRole("link", { name: /Untitled/ });
    expect(tile).toHaveAttribute("href", "/photographs/p1");
    expect(within(tile).getByText("no title")).toBeInTheDocument();
    expect(within(tile).getByText("no photographer")).toBeInTheDocument();
    expect(within(tile).getByText("no place")).toBeInTheDocument();
    expect(within(tile).getByText("no category")).toBeInTheDocument();
  });

  it("drops the row entirely when there is nothing showable", () => {
    renderHome({ photographRow: [] });

    expect(
      screen.queryByText(/and what each one is missing/)
    ).not.toBeInTheDocument();
  });

  it("chips every empty settlement through to its pin", () => {
    renderHome();

    expect(
      screen.getByText(
        "Two of the four have a name and a point on the map and nothing else. " +
          "No photograph, no description, no record of who lives there."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cova Joana" })).toHaveAttribute(
      "href",
      "/map?mode=settlements&status=name&sel=s%3Acova-joana"
    );
    expect(
      screen.queryByRole("link", { name: "Nova Sintra" })
    ).not.toBeInTheDocument();
  });
});
