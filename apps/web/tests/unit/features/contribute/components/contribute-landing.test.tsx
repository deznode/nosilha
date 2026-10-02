import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContributeLanding } from "@/features/contribute/components/contribute-landing";

/** Spec 039 E1 — the two-choice landing page, copy exact per the handoff. */
describe("ContributeLanding", () => {
  it("shows the heading and lead text", () => {
    render(<ContributeLanding />);
    expect(
      screen.getByRole("heading", { name: "Give something to the archive" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Photographs and films of Brava, from anyone who has them. You keep the copyright. We record who took it and who gave it."
      )
    ).toBeInTheDocument();
  });

  it("links the photograph card to the photo form", () => {
    render(<ContributeLanding />);
    expect(screen.getByText("A photograph")).toBeInTheDocument();
    expect(
      screen.getByText("A print, a slide, or a phone picture of one.")
    ).toBeInTheDocument();
    const card = screen.getByRole("link", { name: /Give a photograph/ });
    expect(card).toHaveAttribute("href", "/contribute/media");
  });

  it("links the film card to the film form with ?kind=film", () => {
    render(<ContributeLanding />);
    expect(screen.getByText("A film link")).toBeInTheDocument();
    expect(
      screen.getByText("A YouTube or Vimeo link to a film of Brava.")
    ).toBeInTheDocument();
    const card = screen.getByRole("link", { name: /Send a film link/ });
    expect(card).toHaveAttribute("href", "/contribute/media?kind=film");
  });

  it("links Write to us to /contact", () => {
    render(<ContributeLanding />);
    expect(
      screen.getByText(
        /A person reviews everything before it appears\. Knowing something about a place instead\?/
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Write to us" })).toHaveAttribute(
      "href",
      "/contact"
    );
  });
});
