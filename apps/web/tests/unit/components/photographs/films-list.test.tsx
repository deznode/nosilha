import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilmsList } from "@/components/photographs/films-list";
import type { PublicExternalMedia } from "@/types/gallery";

/**
 * The films section. Spec 034 FR-009, FR-018.
 *
 * A film card has to reach its film. The YouTube sync records `embedUrl`,
 * `thumbnailUrl` and `externalId` but leaves `url` null, so a card keyed on `url`
 * alone renders as a dead div — which is what shipped.
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
  it("opens the film from its externalId when url is null", () => {
    render(<FilmsList films={[film()]} />);

    const link = screen.getByRole("link", {
      name: /Brava Island, Furna Port/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=e9bsJlvXK4I"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("prefers a recorded url over the derived one", () => {
    render(<FilmsList films={[film({ url: "https://vimeo.com/12345" })]} />);

    expect(
      screen.getByRole("link", { name: /Brava Island, Furna Port/ })
    ).toHaveAttribute("href", "https://vimeo.com/12345");
  });

  it("falls back to the embed url when there is no externalId", () => {
    render(<FilmsList films={[film({ externalId: null })]} />);

    expect(
      screen.getByRole("link", { name: /Brava Island, Furna Port/ })
    ).toHaveAttribute("href", "https://www.youtube.com/embed/e9bsJlvXK4I");
  });

  it("stays a plain card when nothing can reach the film", () => {
    render(<FilmsList films={[film({ externalId: null, embedUrl: null })]} />);

    expect(screen.queryByRole("link")).toBeNull();
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
