import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArchiveBar } from "@/components/navigation/archive-bar";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

const mockPathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

/**
 * Spec 034 T-22 / FR-003 — the prototype's single sticky bar. The pills are the
 * six production screens; the demo-only screens in the prototype are not ported.
 * Spec 035 FR-009 added Films after Photographs.
 */
describe("ArchiveBar", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "light" });
    mockPathname.mockReturnValue("/");
  });

  afterEach(() => {
    media.restore();
    vi.clearAllMocks();
  });

  describe("wordmark", () => {
    it("reads Nos Ilha with an Archive label", () => {
      render(<ArchiveBar />);

      expect(screen.getByText("Nos")).toBeInTheDocument();
      expect(screen.getByText("Ilha")).toBeInTheDocument();
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });
  });

  describe("navigation pills", () => {
    it("routes the six screens to their paths", () => {
      render(<ArchiveBar />);

      const expected: [string, string][] = [
        ["Home", "/"],
        ["Settlements", "/settlements"],
        ["Photographs", "/photographs"],
        ["Films", "/films"],
        ["Map", "/map"],
        ["Stay", "/stay"],
      ];

      for (const [label, href] of expected) {
        expect(screen.getByRole("link", { name: label })).toHaveAttribute(
          "href",
          href
        );
      }
    });

    it.each([
      ["/", "Home"],
      ["/settlements", "Settlements"],
      ["/photographs", "Photographs"],
      ["/films", "Films"],
      ["/map", "Map"],
      ["/stay", "Stay"],
    ])("marks the pill for %s as the current page", (pathname, label) => {
      mockPathname.mockReturnValue(pathname);
      render(<ArchiveBar />);

      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("activates Photographs on a photo detail route", () => {
      mockPathname.mockReturnValue("/photographs/abc-123");
      render(<ArchiveBar />);

      expect(screen.getByRole("link", { name: "Photographs" })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("activates Films on a film page and keeps the pills in order", () => {
      mockPathname.mockReturnValue("/films/abc-123");
      render(<ArchiveBar />);

      expect(screen.getByRole("link", { name: "Films" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      const labels = screen
        .getAllByRole("link")
        .map((link) => link.textContent);
      expect(labels.indexOf("Films")).toBe(labels.indexOf("Photographs") + 1);
    });

    it.each(["/nova-sintra", "/nova-sintra/casa-eugenio-tavares"])(
      "activates no pill on %s",
      (pathname) => {
        mockPathname.mockReturnValue(pathname);
        render(<ArchiveBar />);

        expect(
          screen.queryByRole("link", { current: "page" })
        ).not.toBeInTheDocument();
      }
    );

    it("does not let /settlements activate Home", () => {
      mockPathname.mockReturnValue("/settlements");
      render(<ArchiveBar />);

      expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
        "aria-current"
      );
    });
  });

  describe("theme pill", () => {
    it("offers dark while the resolved theme is light", () => {
      render(<ArchiveBar />);

      const pill = screen.getByRole("button", { name: "Dark" });
      expect(pill).toHaveAttribute("title", "Switch to the dark theme");
    });

    it("offers light while the resolved theme is dark", () => {
      useUiStore.setState({ theme: "dark" });
      render(<ArchiveBar />);

      const pill = screen.getByRole("button", { name: "Light" });
      expect(pill).toHaveAttribute("title", "Switch to the light theme");
    });

    it("offers light when system resolves to dark", () => {
      useUiStore.setState({ theme: "system" });
      media.setMatches(DARK_SCHEME, true);
      render(<ArchiveBar />);

      expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    });

    it("sets the store to the opposite of the resolved theme", async () => {
      const user = userEvent.setup();
      render(<ArchiveBar />);

      await user.click(screen.getByRole("button", { name: "Dark" }));
      expect(useUiStore.getState().theme).toBe("dark");
    });

    it("resolves system before flipping, so one click leaves system behind", async () => {
      const user = userEvent.setup();
      useUiStore.setState({ theme: "system" });
      media.setMatches(DARK_SCHEME, true);
      render(<ArchiveBar />);

      await user.click(screen.getByRole("button", { name: "Light" }));
      expect(useUiStore.getState().theme).toBe("light");
    });
  });
});
