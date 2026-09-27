import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilmCard } from "@/components/films/film-card";

import { makeFilm } from "./film-fixture";

/** Spec 038 FR-002 — the shared film card. */
describe("FilmCard", () => {
  it("links to the film with its display title and place", () => {
    render(
      <FilmCard
        film={makeFilm("a", {
          displayTitle: "Walking Nova Sintra",
          place: { slug: "nova-sintra", name: "Nova Sintra" },
        })}
      />
    );
    const link = screen.getByRole("link", { name: /Walking Nova Sintra/ });
    expect(link).toHaveAttribute("href", "/films/a");
    expect(screen.getByText("Filmed near Nova Sintra")).toBeInTheDocument();
    expect(screen.getByText("Preview · muted")).toBeInTheDocument();
    expect(screen.queryByText("Can’t play here")).not.toBeInTheDocument();
  });

  it("omits the place when unknown and honours a custom href", () => {
    render(<FilmCard film={makeFilm("b")} href="/films/b?play=1" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/films/b?play=1");
    expect(screen.queryByText(/Filmed near/)).not.toBeInTheDocument();
  });

  it("says when a film cannot play, with no preview", () => {
    render(<FilmCard film={makeFilm("c", { playback: null })} />);
    expect(screen.getByText("Can’t play here")).toBeInTheDocument();
    expect(screen.queryByText("Preview · muted")).not.toBeInTheDocument();
  });
});
