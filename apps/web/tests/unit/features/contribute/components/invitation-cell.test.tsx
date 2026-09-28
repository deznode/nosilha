import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationCell } from "@/features/contribute/components/invitation-cell";

/** Spec 039 E3/E4 — the dashed cell that closes the photographs and films grids. */
describe("InvitationCell", () => {
  it("renders the question, body and CTA exactly as given", () => {
    render(
      <InvitationCell
        question="Have a photograph of Brava?"
        body="A family print, a slide, or a phone picture of one. You keep the copyright."
        ctaLabel="Give a photograph"
        href="/contribute/media"
      />
    );

    expect(screen.getByText("Have a photograph of Brava?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A family print, a slide, or a phone picture of one. You keep the copyright."
      )
    ).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Give a photograph" });
    expect(cta).toHaveAttribute("href", "/contribute/media");
  });

  it("carries the exact dashed-cell shape from the handoff", () => {
    const { container } = render(
      <InvitationCell
        question="Have a film of Brava?"
        body="A link is enough."
        ctaLabel="Send a film link"
        href="/contribute/media?kind=film"
      />
    );
    const cell = container.firstElementChild as HTMLElement;

    // 1.5px dashed border-strong, radius 8, min-height 190, padding 16,
    // centered column with an 8px gap.
    expect(cell.className).toContain("border-[1.5px]");
    expect(cell.className).toContain("border-dashed");
    expect(cell.className).toContain("border-border-strong");
    expect(cell.className).toContain("rounded-badge");
    expect(cell.className).toContain("min-h-[190px]");
    expect(cell.className).toContain("p-4");
    expect(cell.className).toContain("gap-2");

    const cta = screen.getByRole("link", { name: "Send a film link" });
    // 44px, padding 0 16, radius 8, 14/500.
    expect(cta.className).toContain("h-11");
    expect(cta.className).toContain("px-4");
    expect(cta.className).toContain("rounded-badge");
    expect(cta.className).toContain("text-sm");
    expect(cta.className).toContain("font-medium");
  });

  it("passes className through for grid placement only", () => {
    const { container } = render(
      <InvitationCell
        question="Q"
        body="B"
        ctaLabel="Go"
        href="/contribute/media"
        className="order-[9999] col-span-1 row-span-2"
      />
    );
    const cell = container.firstElementChild as HTMLElement;
    expect(cell.className).toContain("order-[9999]");
    expect(cell.className).toContain("row-span-2");
    // The dashed shape still applies; className never replaces it.
    expect(cell.className).toContain("border-dashed");
  });
});
