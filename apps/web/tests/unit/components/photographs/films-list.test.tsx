import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilmsList } from "@/components/photographs/films-list";
import type { PublicExternalMedia } from "@/types/gallery";

/**
 * The films section. Spec 034 FR-009, FR-018.
 *
 * A film card opens the film's own page, where it plays in place. Spec 035 FR-007
 * replaced the link out to the host, so a record with no host address is still
 * reachable.
 */
function film(
  overrides: Partial<PublicExternalMedia> = {}
): PublicExternalMedia {
  return {
    id: overrides.id ?? "film-1",
    title: "Brava Island, Furna Port",
    description: null,
    altText: null,
    category: null,
    displayOrder: 0,
    createdAt: "2026-01-01T00:00:00Z",
    mediaSource: "EXTERNAL",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: "e9bsJlvXK4I",
    url: null,
    thumbnailUrl: "https://i.ytimg.com/vi/e9bsJlvXK4I/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/e9bsJlvXK4I",
    author: "Nos Ilha",
    ...overrides,
  } as PublicExternalMedia;
}

describe("FilmsList", () => {
  it("opens the film's own page, never its host (spec 035 FR-007)", () => {
    render(<FilmsList films={[film()]} />);

    const link = screen.getByRole("link", {
      name: /Brava Island, Furna Port/,
    });
    expect(link).toHaveAttribute("href", "/films/film-1");
    expect(link).not.toHaveAttribute("target");
  });

  it("routes a film with no host address to its page too", () => {
    render(
      <FilmsList
        films={[film({ id: "film-9", externalId: null, embedUrl: null })]}
      />
    );

    expect(
      screen.getByRole("link", { name: /Brava Island, Furna Port/ })
    ).toHaveAttribute("href", "/films/film-9");
  });

  it("counts the whole archive's films, not the loaded page (FR-018)", () => {
    render(<FilmsList films={[film(), film({ id: "film-2" })]} total={9} />);

    expect(
      screen.getByText(/^Nine, synced from YouTube\./)
    ).toBeInTheDocument();
  });

  it("counts the loaded films when no total is given", () => {
    render(<FilmsList films={[film(), film({ id: "film-2" })]} />);

    expect(screen.getByText(/^Two, synced from YouTube\./)).toBeInTheDocument();
  });
});
