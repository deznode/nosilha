import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DesktopTopBar } from "@/components/navigation/desktop-top-bar";
import { MobileTopBar } from "@/components/navigation/mobile-top-bar";
import { TabletTopBar } from "@/components/navigation/tablet-top-bar";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

const mockPathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const auth: { session: unknown; email: string | null } = {
  session: null,
  email: null,
};
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    session: auth.session,
    user: auth.email ? { id: "u1", email: auth.email } : null,
    loading: false,
  }),
}));

const signIn = () => {
  auth.session = { user: { email: "maria.tavares@example.com" } };
  auth.email = "maria.tavares@example.com";
};

/** Spec 037 FR-002 / FR-004 / FR-005. */
describe("site chrome top bars", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "light" });
    mockPathname.mockReturnValue("/");
    auth.session = null;
    auth.email = null;
  });

  afterEach(() => {
    media.restore();
    vi.clearAllMocks();
  });

  describe("MobileTopBar", () => {
    it("reads Nos Ilha and links home", () => {
      render(<MobileTopBar />);

      expect(
        screen.getByRole("link", { name: "Nos Ilha home" })
      ).toHaveAttribute("href", "/");
    });

    it("carries no navigation — the bottom bar does that", () => {
      render(<MobileTopBar />);

      expect(
        screen.queryByRole("link", { name: "Settlements" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Map" })
      ).not.toBeInTheDocument();
    });

    // The slot must not collapse, or the bar reflows the moment a visitor
    // signs in. FR-002.
    it("offers Sign in when signed out", () => {
      render(<MobileTopBar />);

      expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
        "href",
        "/login"
      );
    });

    it("offers the profile avatar when signed in", () => {
      signIn();
      render(<MobileTopBar />);

      expect(
        screen.getByRole("link", { name: "Your profile" })
      ).toHaveAttribute("href", "/profile");
      expect(screen.getByText("MA")).toBeInTheDocument();
    });

    it("fills the account slot in both states", () => {
      const { unmount } = render(<MobileTopBar />);
      expect(screen.getAllByRole("link")).toHaveLength(2);
      unmount();

      signIn();
      render(<MobileTopBar />);
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });
  });

  describe("TabletTopBar", () => {
    it("shows exactly three inline destinations, in order", () => {
      render(<TabletTopBar />);
      const nav = screen.getByRole("navigation", { name: "Primary" });

      const labels = within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent);
      expect(labels).toEqual(["Settlements", "Culture", "Map"]);
    });

    it.each([
      ["/settlements", "Settlements"],
      ["/history", "Culture"],
      ["/map", "Map"],
    ])("marks the pill for %s as the current page", (pathname, label) => {
      mockPathname.mockReturnValue(pathname);
      render(<TabletTopBar />);

      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("activates Culture on a historical figure route", () => {
      mockPathname.mockReturnValue("/people/eugenio-tavares");
      render(<TabletTopBar />);

      expect(screen.getByRole("link", { name: "Culture" })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    it("keeps Contribute and the account slot outside the collapsible nav", () => {
      render(<TabletTopBar />);

      expect(screen.getByRole("link", { name: "Contribute" })).toHaveAttribute(
        "href",
        "/contribute/story"
      );
      expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    });

    describe("More dropdown", () => {
      it("is closed until asked", () => {
        render(<TabletTopBar />);

        expect(screen.getByRole("button", { name: /More/ })).toHaveAttribute(
          "aria-expanded",
          "false"
        );
        expect(
          screen.queryByRole("link", { name: "Photographs" })
        ).not.toBeInTheDocument();
      });

      it("holds the destinations the inline set has no room for", async () => {
        const user = userEvent.setup();
        render(<TabletTopBar />);

        await user.click(screen.getByRole("button", { name: /More/ }));

        const expected: [string, string][] = [
          ["Photographs", "/photographs"],
          ["Films", "/films"],
          ["Stay", "/stay"],
        ];
        for (const [label, href] of expected) {
          expect(screen.getByRole("link", { name: label })).toHaveAttribute(
            "href",
            href
          );
        }
      });

      it("puts language and theme after the destinations", async () => {
        const user = userEvent.setup();
        render(<TabletTopBar />);

        await user.click(screen.getByRole("button", { name: /More/ }));

        expect(screen.getByText("EN")).toBeInTheDocument();
        expect(screen.queryByText("PT")).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Current theme/ })
        ).toBeInTheDocument();
      });
    });
  });

  /**
   * The archive bar's pill row, restored by preference and now rendered on every
   * public route rather than only the archive screens.
   */
  describe("DesktopTopBar", () => {
    it("shows the seven destinations as pills, in order", () => {
      render(<DesktopTopBar />);
      const nav = screen.getByRole("navigation", { name: "Primary" });

      const labels = within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent);
      expect(labels).toEqual([
        "Home",
        "Settlements",
        "Culture",
        "Photographs",
        "Films",
        "Map",
        "Stay",
      ]);
    });

    it("carries the archive wordmark home", () => {
      render(<DesktopTopBar />);

      const wordmark = screen.getByRole("link", { name: "Nos Ilha home" });
      expect(wordmark).toHaveAttribute("href", "/");
      expect(wordmark).toHaveTextContent("NosIlha");
      expect(wordmark).toHaveTextContent("Archive");
    });

    it.each([
      ["/", "Home"],
      ["/settlements", "Settlements"],
      ["/history", "Culture"],
      ["/photographs", "Photographs"],
      ["/films", "Films"],
      ["/map", "Map"],
      ["/stay", "Stay"],
    ])("lights the pill for %s", (pathname, label) => {
      mockPathname.mockReturnValue(pathname);
      render(<DesktopTopBar />);

      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // A prefix match on "/" would light Home on every route.
    it("does not light Home on a sub-route", () => {
      mockPathname.mockReturnValue("/settlements");
      render(<DesktopTopBar />);

      expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
        "aria-current"
      );
    });

    it("keeps Contribute and the account slot the archive bar had no room for", () => {
      render(<DesktopTopBar />);

      expect(screen.getByRole("link", { name: "Contribute" })).toHaveAttribute(
        "href",
        "/contribute/story"
      );
      expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
        "href",
        "/login"
      );

      signIn();
      render(<DesktopTopBar />);
      expect(
        screen.getAllByRole("link", { name: "Your profile" })[0]
      ).toHaveAttribute("href", "/profile");
    });

    // Two states, resolved first, so one click always lands on an explicit
    // choice rather than toggling within "system".
    it("offers the theme one click away as a text pill", async () => {
      const user = userEvent.setup();
      render(<DesktopTopBar />);

      const pill = screen.getByRole("button", { name: "Dark" });
      await user.click(pill);
      expect(useUiStore.getState().theme).toBe("dark");
    });

    it("names the light theme when the resolved theme is dark", () => {
      useUiStore.setState({ theme: "dark" });
      render(<DesktopTopBar />);

      expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    });
  });
});
