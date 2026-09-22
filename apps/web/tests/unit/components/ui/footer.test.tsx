import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/ui/footer";

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

vi.mock("@/components/newsletter/footer-newsletter-form", () => ({
  FooterNewsletterForm: () => <div data-testid="newsletter" />,
}));

/** Spec 037 FR-007 / FR-008 / FR-009. */
describe("Footer", () => {
  it("is a colophon, not a second navigation", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    // The two link columns are gone — the menu carries the destinations at every
    // width and the desktop bar carries them above 1024, so these were a third copy.
    for (const gone of [
      "Settlements",
      "Photographs",
      "Films",
      "Share a Memory",
    ]) {
      expect(
        within(footer).queryByRole("link", { name: gone })
      ).not.toBeInTheDocument();
    }
  });

  it("carries the legal row, reachable at every width", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    const expected: [string, string][] = [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ];
    for (const [label, href] of expected) {
      expect(within(footer).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }
  });

  it("keeps the tagline and copyright wording unchanged", () => {
    render(<Footer />);

    expect(
      screen.getByText("Nos terra, nos gente, nos memoria.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Open Source Cultural Heritage Project\./)
    ).toBeInTheDocument();
  });

  it("keeps the newsletter form", () => {
    render(<Footer />);
    expect(screen.getByTestId("newsletter")).toBeInTheDocument();
  });

  // FR-009: a component dropped in here later must not be able to reintroduce
  // the audit's contrast failures, so nothing in the footer may resolve against
  // the page's light/dark tokens.
  it("uses no theme-reactive `dark:` classes anywhere", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    const offenders = Array.from(footer.querySelectorAll<HTMLElement>("*"))
      .concat(footer)
      .filter((el) =>
        Array.from(el.classList).some((cls) => cls.startsWith("dark:"))
      );

    expect(offenders.map((el) => el.className)).toEqual([]);
  });

  it("reserves clearance for the bottom bar on phones only", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    expect(footer.className).toContain(
      "pb-[calc(56px+env(safe-area-inset-bottom))]"
    );
    expect(footer.className).toContain("md:pb-0");
  });
});
