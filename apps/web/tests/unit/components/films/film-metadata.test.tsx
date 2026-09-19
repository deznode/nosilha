import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilmMetadata } from "@/components/films/film-metadata";
import type { Film } from "@/lib/films";

/** Spec 035 FR-003 / FR-005 — the film's facts, each absence named. */
function film(overrides: Partial<Film> = {}): Film {
  return {
    id: "f1",
    title: "Nova Sintra em Agosto",
    source: "YouTube",
    thumbnailUrl: null,
    durationSeconds: null,
    place: null,
    filmmaker: null,
    featured: false,
    playback: null,
    watchUrl: null,
    ...overrides,
  };
}

const terms = () => screen.getAllByRole("term").map((t) => t.textContent);

describe("FilmMetadata", () => {
  it("compact: Source, Length, Place", () => {
    render(<FilmMetadata film={film()} variant="compact" />);

    expect(terms()).toEqual(["Source", "Length", "Place"]);
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getAllByText("Not recorded")).toHaveLength(2);
  });

  it("full: adds Filmed near and Filmmaker, formats a recorded length", () => {
    render(
      <FilmMetadata film={film({ durationSeconds: 125 })} variant="full" />
    );

    expect(terms()).toEqual(["Source", "Length", "Filmed near", "Filmmaker"]);
    expect(screen.getByText("2:05")).toBeInTheDocument();
    expect(screen.getAllByText("Not recorded")).toHaveLength(2);
  });

  it("reads an unknown source as Not recorded in ochre", () => {
    render(<FilmMetadata film={film({ source: null })} variant="full" />);

    const missing = screen.getAllByText("Not recorded");
    expect(missing).toHaveLength(4);
    expect(missing[0]).toHaveStyle({ color: "var(--brand-sobrado-ochre)" });
  });
});
