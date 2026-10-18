import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DesktopTopBar } from "@/components/navigation/desktop-top-bar";
import {
  LanguageSwitcher,
  languageCookie,
  languageSwitchTarget,
} from "@/components/navigation/language-switcher";
import { MoreSheet } from "@/components/navigation/more-sheet";
import { TabletTopBar } from "@/components/navigation/tablet-top-bar";
import { useUiStore } from "@/stores/uiStore";
import { signOut } from "../../../setup/auth-provider-mock";
import { mockMatchMedia } from "../../../setup/match-media-mock";

const state = vi.hoisted(() => ({
  portuguese: true,
  locale: "en" as "en" | "pt-PT",
  pathname: "/settlements",
  push: vi.fn(),
}));

// `PORTUGUESE_ENABLED` is a module constant; a getter lets each case choose.
vi.mock("@/i18n/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n/config")>();
  return {
    ...actual,
    get PORTUGUESE_ENABLED() {
      return state.portuguese;
    },
  };
});

// The setup maps `@/i18n/navigation` onto these, forwarding each call.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push }),
  usePathname: () => state.pathname,
}));

vi.mock("framer-motion", async () => {
  const { createFramerMotionMock } =
    await import("../../../setup/framer-motion-mock");
  return createFramerMotionMock();
});

vi.mock("@/components/providers/auth-provider", async () => {
  const { createAuthProviderMock } =
    await import("../../../setup/auth-provider-mock");
  return createAuthProviderMock();
});

// As the setup's mock, but with the current locale under the test's control.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  const { default: messages } = await import("../../../../messages/en.json");
  return {
    ...actual,
    useLocale: () => state.locale,
    useTranslations: (namespace?: string) =>
      actual.createTranslator({
        locale: "en",
        messages,
        namespace,
      } as any),
  };
});

function clearCookie() {
  document.cookie = "nosilha-lang=; Max-Age=0; Path=/";
}

function setSearch(search: string) {
  window.history.replaceState(null, "", `/settlements${search}`);
}

/** Spec 041 FR-003 / T-21. */
describe("LanguageSwitcher", () => {
  beforeEach(() => {
    state.portuguese = true;
    state.locale = "en";
    state.pathname = "/settlements";
    clearCookie();
    setSearch("");
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearCookie();
    setSearch("");
  });

  describe("languageSwitchTarget", () => {
    it.each([
      ["/settlements", "", "/settlements"],
      ["/settlements", "?", "/settlements"],
      ["/map", "?mode=records", "/map?mode=records"],
      ["/", "?place=nova-sintra&x=1", "/?place=nova-sintra&x=1"],
      ["/photographs/abc", "mode=grid", "/photographs/abc?mode=grid"],
    ])("%s + %s opens %s", (pathname, search, expected) => {
      expect(languageSwitchTarget(pathname, search)).toBe(expected);
    });
  });

  describe("languageCookie", () => {
    it("stores the address segment for a year, site-wide, SameSite=Lax", () => {
      expect(languageCookie("pt-PT")).toBe(
        "nosilha-lang=pt; Max-Age=31536000; Path=/; SameSite=Lax"
      );
      expect(languageCookie("en")).toBe(
        "nosilha-lang=en; Max-Age=31536000; Path=/; SameSite=Lax"
      );
    });

    it("is Secure on https", () => {
      expect(languageCookie("en", true)).toMatch(/; Secure$/);
    });
  });

  describe("with Portuguese on", () => {
    it("shows both languages as links named in their own language", () => {
      render(<LanguageSwitcher />);

      const nav = screen.getByRole("navigation", { name: "Language" });
      const english = screen.getByRole("link", { name: "English" });
      const portuguese = screen.getByRole("link", { name: "Português" });

      expect(nav).toContainElement(english);
      expect(english).toHaveTextContent("EN");
      expect(english).toHaveAttribute("hrefLang", "en");
      expect(english).toHaveAttribute("lang", "en");
      expect(english).toHaveAttribute("href", "/settlements");
      expect(portuguese).toHaveTextContent("PT");
      expect(portuguese).toHaveAttribute("hrefLang", "pt-PT");
      expect(portuguese).toHaveAttribute("lang", "pt-PT");
      expect(portuguese).toHaveAttribute("href", "/pt/settlements");
    });

    it("marks the current language on an English page", () => {
      render(<LanguageSwitcher />);

      expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
        "aria-current",
        "true"
      );
      expect(
        screen.getByRole("link", { name: "Português" })
      ).not.toHaveAttribute("aria-current");
    });

    it("marks the current language on a Portuguese page", () => {
      state.locale = "pt-PT";
      render(<LanguageSwitcher />);

      expect(screen.getByRole("link", { name: "Português" })).toHaveAttribute(
        "aria-current",
        "true"
      );
      expect(screen.getByRole("link", { name: "English" })).not.toHaveAttribute(
        "aria-current"
      );
    });

    it("opens the same page in Portuguese, keeping the query string, and remembers it", async () => {
      const user = userEvent.setup();
      state.pathname = "/map";
      setSearch("?mode=records");
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole("link", { name: "Português" }));

      expect(state.push).toHaveBeenCalledWith("/map?mode=records", {
        locale: "pt-PT",
      });
      expect(document.cookie).toContain("nosilha-lang=pt");
    });

    it("opens the same page in English and remembers that instead", async () => {
      const user = userEvent.setup();
      state.locale = "pt-PT";
      document.cookie = "nosilha-lang=pt; Path=/";
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole("link", { name: "English" }));

      expect(state.push).toHaveBeenCalledWith("/settlements", {
        locale: "en",
      });
      expect(document.cookie).toContain("nosilha-lang=en");
      expect(document.cookie).not.toContain("nosilha-lang=pt");
    });

    it("stays put when the current language is chosen", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole("link", { name: "English" }));

      expect(state.push).not.toHaveBeenCalled();
      expect(document.cookie).toContain("nosilha-lang=en");
    });

    it("leaves a modified click to the browser, still remembering the choice", () => {
      render(<LanguageSwitcher />);

      // Record whether the control let the click through, then stop jsdom from
      // attempting the navigation itself.
      let preventedByControl: boolean | undefined;
      const record = (event: Event) => {
        preventedByControl = event.defaultPrevented;
        event.preventDefault();
      };
      window.addEventListener("click", record);

      fireEvent.click(screen.getByRole("link", { name: "Português" }), {
        metaKey: true,
      });
      window.removeEventListener("click", record);

      expect(preventedByControl).toBe(false);
      expect(state.push).not.toHaveBeenCalled();
      expect(document.cookie).toContain("nosilha-lang=pt");
    });

    it("tells its container a choice was made", async () => {
      const user = userEvent.setup();
      const onChoose = vi.fn();
      render(<LanguageSwitcher onChoose={onChoose} />);

      await user.click(screen.getByRole("link", { name: "Português" }));

      expect(onChoose).toHaveBeenCalledTimes(1);
    });

    it("is reachable and operable by keyboard", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.tab();
      expect(screen.getByRole("link", { name: "English" })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("link", { name: "Português" })).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(state.push).toHaveBeenCalledWith("/settlements", {
        locale: "pt-PT",
      });
    });
  });

  describe("with Portuguese off (FR-009)", () => {
    beforeEach(() => {
      state.portuguese = false;
    });

    it("renders the static chip: no links, no title, nothing about later languages", () => {
      const { container } = render(<LanguageSwitcher className="w-11" />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
      expect(container.querySelector("[title]")).toBeNull();
      expect(container).not.toHaveTextContent(/PT|Kriolu|soon/i);
    });

    it("writes no cookie", () => {
      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText("EN"));

      expect(document.cookie).not.toContain("nosilha-lang");
    });
  });

  /** Rendered through `SiteChrome`'s bars only; no bar carries its own copy. */
  describe("in the site bars", () => {
    let media: ReturnType<typeof mockMatchMedia>;

    beforeEach(() => {
      media = mockMatchMedia({ "(prefers-color-scheme: dark)": false });
      useUiStore.setState({ theme: "light" });
      signOut();
    });

    afterEach(() => media.restore());

    it("is in the desktop bar with Portuguese on, and absent with it off", () => {
      const { unmount } = render(<DesktopTopBar />);
      expect(
        screen.getByRole("navigation", { name: "Language" })
      ).toBeInTheDocument();
      unmount();

      state.portuguese = false;
      render(<DesktopTopBar />);
      expect(
        screen.queryByRole("navigation", { name: "Language" })
      ).not.toBeInTheDocument();
      expect(screen.queryByText("EN")).not.toBeInTheDocument();
    });

    it("is in the tablet bar's More panel", async () => {
      const user = userEvent.setup();
      render(<TabletTopBar />);

      await user.click(screen.getByRole("button", { name: /More/ }));

      expect(
        screen.getByRole("link", { name: "Português" })
      ).toBeInTheDocument();
    });

    it("is in the phone's More sheet, and choosing closes the sheet", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<MoreSheet isOpen onClose={onClose} />);

      await user.click(screen.getByRole("link", { name: "Português" }));

      expect(onClose).toHaveBeenCalled();
      expect(state.push).toHaveBeenCalledWith("/settlements", {
        locale: "pt-PT",
      });
    });
  });
});
