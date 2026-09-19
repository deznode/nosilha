import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilmsIndex } from "@/components/films/films-index";
import type { Film } from "@/lib/films";

/** Spec 035 FR-002 – FR-004 — the films index. */

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

/** Production today: nine titled YouTube films, one of them featured. */
const NINE = [
  film("a", { title: "Brava" }),
  film("b", { title: "Explorando Furna", featured: true }),
  film("c", { title: "Nova Sintra em Agosto" }),
  ...["d", "e", "f", "g", "h", "i"].map((id) => film(id)),
];

/** Cards in the desktop grid (the mobile carousel repeats them). */
function desktopCards() {
  return screen
    .getAllByRole("link", {
      name: /^Film|^Brava|^Explorando|^Nova/,
    })
    .filter((b) => b.closest(".md\\:grid"));
}

describe("FilmsIndex", () => {
  it("states the archive from its own counts", () => {
    render(<FilmsIndex films={NINE} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Films" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nine films in the archive. None records a length, and the collection grows as footage is contributed."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 9 of 9")).toBeInTheDocument();
  });

  it("offers the five facets with counts, zeros included", () => {
    render(<FilmsIndex films={NINE} />);

    for (const [label, count] of [
      ["All films", "9"],
      ["Titled", "9"],
      ["YouTube", "9"],
      ["Vimeo", "0"],
      ["Archive file", "0"],
    ]) {
      const chip = screen.getByRole("button", {
        name: new RegExp(`^${label}`),
      });
      expect(chip).toHaveTextContent(count);
    }
  });

  it("features the curated film and leaves it out of the grid", () => {
    render(<FilmsIndex films={NINE} />);

    expect(screen.getByText("Now playing")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open film page" })
    ).toHaveAttribute("href", "/films/b");
    expect(desktopCards()).toHaveLength(8);
  });

  it("keeps the hero's film in the grid while searching", () => {
    render(<FilmsIndex films={NINE} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search films" }), {
      target: { value: "furna" },
    });

    expect(screen.getByText("Showing 1 of 9")).toBeInTheDocument();
    expect(desktopCards()).toHaveLength(1);
  });

  it("keeps the hero's film in the grid when a facet holds nothing else", () => {
    const films = [
      film("a"),
      film("v", {
        source: "Vimeo",
        playback: { kind: "vimeo", id: "1" },
        featured: true,
      }),
    ];
    render(<FilmsIndex films={films} />);

    fireEvent.click(screen.getByRole("button", { name: /^Vimeo/ }));
    expect(screen.getByText("Showing 1 of 2")).toBeInTheDocument();
    expect(desktopCards()).toHaveLength(1);
  });

  it("shows the grid's own empty state for an empty facet", () => {
    render(<FilmsIndex films={NINE} />);

    fireEvent.click(screen.getByRole("button", { name: /^Vimeo/ }));
    expect(screen.getByText("Showing 0 of 9")).toBeInTheDocument();
    expect(screen.getByText("No videos found")).toBeInTheDocument();
  });

  it("opens a card's film page instead of leaving the archive", () => {
    const { container } = render(<FilmsIndex films={NINE} />);

    expect(desktopCards()[0]).toHaveAttribute("href", "/films/a");
    expect(container.querySelector("[target=_blank]")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("explains paging at nine films and pages at twenty-five", () => {
    const { unmount } = render(<FilmsIndex films={NINE} />);
    expect(
      screen.getByText(
        "Every film fits on one page today. Pagination starts past twenty-four."
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
    unmount();

    const many = Array.from({ length: 25 }, (_, i) =>
      film(`m${String(i).padStart(2, "0")}`)
    );
    render(<FilmsIndex films={many} />);
    expect(screen.queryByText(/Every film fits on one page today/)).toBeNull();
    const pagination = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(pagination).getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("drops the footer when a large archive is narrowed to one page", () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      film(`m${String(i).padStart(2, "0")}`)
    );
    render(<FilmsIndex films={many} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search films" }), {
      target: { value: "film m01" },
    });

    expect(screen.getByText("Showing 1 of 25")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
    expect(screen.queryByText(/Every film fits on one page today/)).toBeNull();
  });
});
