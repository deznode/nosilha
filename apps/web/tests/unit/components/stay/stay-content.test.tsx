import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { StayContent } from "@/components/stay/stay-content";
import { stayStandfirst } from "@/components/stay/stay-copy";
import { useIdentifyStore } from "@/stores/identifyStore";
import type { DirectoryEntry } from "@/types/directory";

function stay(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "s1",
    slug: "pensao-paulo",
    name: "Pensão Paulo",
    category: "Hotel",
    imageUrl: null,
    town: "Nova Sintra",
    townId: "town-1",
    latitude: 14.86,
    longitude: -24.71,
    description: "A pensão where guests become part of the town.",
    rating: null,
    reviewCount: 0,
    createdAt: "",
    updatedAt: "",
    tags: [],
    details: { amenities: [] },
    ...overrides,
  } as DirectoryEntry;
}

const TOWN_SLUGS = { "town-1": "nova-sintra" };

/** Spec 034 T-29 / FR-014 — the only part of the archive where a rating belongs. */
describe("stayStandfirst", () => {
  it("counts the places and says none is rated", () => {
    expect(
      stayStandfirst([
        stay(),
        stay({ id: "s2" }),
        stay({ id: "s3" }),
        stay({ id: "s4" }),
      ])
    ).toBe(
      "Four places to stay on Brava. This is the only part of the archive where a " +
        "rating belongs, and none of the four has been rated yet."
    );
  });

  it("counts the rated ones once any exist", () => {
    expect(stayStandfirst([stay({ rating: 4.5 }), stay({ id: "s2" })])).toBe(
      "Two places to stay on Brava. This is the only part of the archive where a " +
        "rating belongs, and one of the two has been rated."
    );
  });

  it("uses a pronoun rather than a fraction for a single record", () => {
    expect(stayStandfirst([stay()])).toContain("it has not been rated yet");
    expect(stayStandfirst([stay({ rating: 4.5 })])).toContain(
      "it has been rated"
    );
  });

  it("says so when nothing is recorded", () => {
    expect(stayStandfirst([])).toBe(
      "No place to stay is recorded on Brava yet."
    );
  });
});

describe("StayContent", () => {
  beforeEach(() => {
    useIdentifyStore.setState({ context: null });
  });

  it("heads the screen and states the counts", () => {
    render(<StayContent stays={[stay()]} townSlugs={TOWN_SLUGS} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Stay" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "One place to stay on Brava. This is the only part of the archive where a " +
          "rating belongs, and it has not been rated yet."
      )
    ).toBeInTheDocument();
  });

  it("says a card has no photograph rather than showing an empty box", () => {
    render(<StayContent stays={[stay()]} townSlugs={TOWN_SLUGS} />);

    expect(screen.getByText("no photograph recorded")).toBeInTheDocument();
  });

  it("shows the hero when the record carries one", () => {
    render(
      <StayContent
        stays={[stay({ imageUrl: "https://cdn.example/p.jpg" })]}
        townSlugs={TOWN_SLUGS}
      />
    );

    expect(
      screen.queryByText("no photograph recorded")
    ).not.toBeInTheDocument();
    expect(
      screen.getByAltText("Pensão Paulo, Nova Sintra")
    ).toBeInTheDocument();
  });

  it("marks an unrated place in ochre and prints a real rating", () => {
    render(
      <StayContent
        stays={[
          stay(),
          stay({ id: "s2", slug: "pousada", name: "Pousada", rating: 4.5 }),
        ]}
        townSlugs={TOWN_SLUGS}
      />
    );

    expect(screen.getByText("Not yet rated")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("opens the identify sheet from Stayed here?", async () => {
    const user = userEvent.setup();
    render(<StayContent stays={[stay()]} townSlugs={TOWN_SLUGS} />);

    await user.click(screen.getByRole("button", { name: "Stayed here?" }));

    expect(useIdentifyStore.getState().context).toEqual({
      contentType: "entry",
      contentId: "s1",
      field: "rating",
      pageTitle: "Pensão Paulo",
    });
  });

  it("links the card at its record under the settlement", () => {
    render(<StayContent stays={[stay()]} townSlugs={TOWN_SLUGS} />);

    expect(screen.getByRole("link", { name: "Pensão Paulo" })).toHaveAttribute(
      "href",
      "/nova-sintra/pensao-paulo"
    );
  });

  it("leaves the name unlinked when the settlement has not resolved", () => {
    render(
      <StayContent stays={[stay({ townId: null })]} townSlugs={TOWN_SLUGS} />
    );

    expect(
      screen.queryByRole("link", { name: "Pensão Paulo" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Pensão Paulo")).toBeInTheDocument();
  });

  it("shows the town and description on every card", () => {
    render(<StayContent stays={[stay()]} townSlugs={TOWN_SLUGS} />);

    expect(screen.getByText("Nova Sintra")).toBeInTheDocument();
    expect(
      screen.getByText("A pensão where guests become part of the town.")
    ).toBeInTheDocument();
  });
});
