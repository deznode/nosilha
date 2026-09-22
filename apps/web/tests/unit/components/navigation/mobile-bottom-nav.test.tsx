import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

// Without this the sheet's exit animation never completes in jsdom, so a closed
// sheet stays in the DOM and every close assertion reads as a failure.
vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

const mockPathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const auth: { session: unknown } = { session: null };
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({ session: auth.session, user: null, loading: false }),
}));

/**
 * Spec 037 FR-003 / FR-006. Ported from `archive-bar.test.tsx`, which was the
 * repo's only chrome test before the bars converged.
 */
describe("MobileBottomNav", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "light" });
    mockPathname.mockReturnValue("/");
    auth.session = null;
  });

  afterEach(() => {
    media.restore();
    vi.clearAllMocks();
  });

  describe("items", () => {
    it("routes the four destinations to their paths", () => {
      render(<MobileBottomNav />);

      const expected: [string, string][] = [
        ["Home", "/"],
        ["Settlements", "/settlements"],
        ["Culture", "/history"],
        ["Map", "/map"],
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
      ["/history", "Culture"],
      ["/map", "Map"],
    ])("marks the item for %s as the current page", (pathname, label) => {
      mockPathname.mockReturnValue(pathname);
      render(<MobileBottomNav />);

      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("activates Culture on a historical figure route", () => {
      mockPathname.mockReturnValue("/people/eugenio-tavares");
      render(<MobileBottomNav />);

      expect(screen.getByRole("link", { name: "Culture" })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("does not let /settlements activate Home", () => {
      mockPathname.mockReturnValue("/settlements");
      render(<MobileBottomNav />);

      expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
        "aria-current"
      );
    });
  });

  describe("persistence", () => {
    // The bar used to carry a HIDDEN_ROUTES list holding exactly this pattern,
    // so a visitor reading a historical figure lost all navigation. FR-003.
    it.each([
      "/people/eugenio-tavares",
      "/people/some-one-else",
      "/nova-sintra/casa-eugenio-tavares",
      "/photographs/abc-123",
    ])("renders on %s", (pathname) => {
      mockPathname.mockReturnValue(pathname);
      render(<MobileBottomNav />);

      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();
    });
  });

  describe("More", () => {
    it("is closed until asked", () => {
      render(<MobileBottomNav />);

      const trigger = screen.getByRole("button", { name: "Open menu" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens a sheet and flips the trigger", async () => {
      const user = userEvent.setup();
      render(<MobileBottomNav />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));

      expect(screen.getByRole("dialog", { name: "More" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Close menu" })
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("closes on Escape", async () => {
      const user = userEvent.setup();
      render(<MobileBottomNav />);

      await user.click(screen.getByRole("button", { name: "Open menu" }));
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
