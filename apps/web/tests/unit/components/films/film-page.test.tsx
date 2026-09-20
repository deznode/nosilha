import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilmPage } from "@/components/films/film-page";
import type { Film } from "@/lib/films";

/** Spec 035 FR-005 — the film page. */

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

function film(id: string, overrides: Partial<Film> = {}): Film {
  return {
    id,
    title: `Film ${id}`,
    source: "YouTube",
    thumbnailUrl: null,
    durationSeconds: null,
    place: null,
    filmmaker: null,
    featured: false,
    identifiablePerson: false,
    playback: { kind: "youtube", id },
    watchUrl: null,
    ...overrides,
  };
}

describe("FilmPage", () => {
  it("shows the film, its source pill and the others", () => {
    render(<FilmPage film={film("a")} others={[film("b"), film("c")]} />);

    expect(screen.getByRole("link", { name: "← All films" })).toHaveAttribute(
      "href",
      "/films"
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Film a" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Embedded from YouTube · plays here")
    ).toBeInTheDocument();
    expect(screen.getByText("2 others in the archive")).toBeInTheDocument();
    expect(screen.queryByText(/can be downloaded/)).toBeNull();
  });

  it("names an untitled film as an absence", () => {
    render(
      <FilmPage
        film={film("a", { title: null, source: null, playback: null })}
        others={[]}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Title not recorded" })
    ).toHaveStyle({ fontStyle: "italic" });
    expect(screen.getByText("Source not recorded")).toBeInTheDocument();
    expect(screen.queryByText("More films")).toBeNull();
  });

  it("offers the original only for an archive file", () => {
    render(
      <FilmPage
        film={film("a", {
          source: "Archive file",
          playback: { kind: "file", url: "https://media.nosilha.com/a.mp4" },
        })}
        others={[film("b")]}
      />
    );

    const download = screen.getByRole("link", { name: "Download original ↓" });
    expect(download).toHaveAttribute("href", "https://media.nosilha.com/a.mp4");
    expect(download).toHaveAttribute("download");
    expect(screen.getByText("Archive file · plays here")).toBeInTheDocument();
    expect(screen.getByText("1 other in the archive")).toBeInTheDocument();
  });
});
