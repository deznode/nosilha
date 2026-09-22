import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MoreSheet } from "@/components/navigation/more-sheet";
import { useUiStore } from "@/stores/uiStore";
import { signIn, signOut } from "../../../setup/auth-provider-mock";
import { mockMatchMedia } from "../../../setup/match-media-mock";

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/providers/auth-provider", async () => {
  const { createAuthProviderMock } =
    await import("../../../setup/auth-provider-mock");
  return createAuthProviderMock();
});

/** Spec 037 FR-006 / FR-013. */
describe("MoreSheet", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ "(prefers-color-scheme: dark)": false });
    useUiStore.setState({ theme: "light" });
    signOut();
  });

  afterEach(() => {
    media.restore();
    vi.clearAllMocks();
  });

  it("renders nothing while closed", () => {
    render(<MoreSheet isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("carries the destinations the bottom bar has no room for", () => {
    render(<MoreSheet isOpen onClose={vi.fn()} />);
    const sheet = screen.getByRole("dialog", { name: "More" });

    const expected: [string, string][] = [
      ["Photographs", "/photographs"],
      ["Films", "/films"],
      ["Stay", "/stay"],
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ];

    for (const [label, href] of expected) {
      expect(within(sheet).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }
  });

  describe("account", () => {
    it("offers Sign in and no account block when signed out", () => {
      render(<MoreSheet isOpen onClose={vi.fn()} />);
      const sheet = screen.getByRole("dialog");

      expect(
        within(sheet).getByRole("link", { name: "Sign in" })
      ).toHaveAttribute("href", "/login");
      expect(within(sheet).queryByText("Signed in")).not.toBeInTheDocument();
    });

    it("offers Profile and an account block when signed in", () => {
      signIn();
      render(<MoreSheet isOpen onClose={vi.fn()} />);
      const sheet = screen.getByRole("dialog");

      expect(
        within(sheet).getByRole("link", { name: "Profile" })
      ).toHaveAttribute("href", "/profile");
      expect(within(sheet).getByText("Signed in")).toBeInTheDocument();
      expect(
        within(sheet).queryByRole("link", { name: "Sign in" })
      ).not.toBeInTheDocument();
    });
  });

  describe("focus order", () => {
    // FR-013: language and theme come AFTER navigation. In the popover this
    // replaced they preceded it, which put appearance settings ahead of the
    // site's destinations in the tab order.
    it("orders destinations, then Contribute, then theme, then legal", () => {
      render(<MoreSheet isOpen onClose={vi.fn()} />);
      const sheet = screen.getByRole("dialog");

      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const labelAt = (index: number) =>
        focusables[index]?.textContent?.trim() ?? "";
      const indexOf = (text: string) =>
        focusables.findIndex((el) => el.textContent?.trim() === text);

      expect(labelAt(0)).toBe("Photographs");

      const lastDestination = indexOf("Sign in");
      const contribute = indexOf("Contribute");
      const privacy = indexOf("Privacy");
      const terms = indexOf("Terms");
      const themeToggle = focusables.findIndex((el) =>
        el.getAttribute("aria-label")?.startsWith("Current theme")
      );

      expect(lastDestination).toBeLessThan(contribute);
      expect(contribute).toBeLessThan(themeToggle);
      expect(themeToggle).toBeLessThan(privacy);
      expect(privacy).toBeLessThan(terms);
    });
  });

  describe("dismissal", () => {
    it("closes on Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MoreSheet isOpen onClose={onClose} />);

      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalled();
    });

    it("closes when a destination is chosen", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MoreSheet isOpen onClose={onClose} />);

      await user.click(screen.getByRole("link", { name: "Films" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("language", () => {
    it("shows the enabled locale only, never a disabled one", () => {
      render(<MoreSheet isOpen onClose={vi.fn()} />);
      const sheet = screen.getByRole("dialog");

      expect(within(sheet).getByText("EN")).toBeInTheDocument();
      expect(within(sheet).queryByText("PT")).not.toBeInTheDocument();
      expect(within(sheet).queryByText("CV")).not.toBeInTheDocument();
    });
  });
});
