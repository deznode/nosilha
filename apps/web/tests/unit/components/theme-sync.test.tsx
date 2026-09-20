import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSync } from "@/components/theme-sync";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

/**
 * Spec 034 FR-001 — dark is the `.dark` class on the root, driven by `uiStore`.
 *
 * Before this the class was applied inside `ThemeToggle`'s own effect, so any screen
 * without that button — every archive screen, which uses the ArchiveBar pill instead —
 * could set the store and see nothing change.
 */
describe("ThemeSync", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "light" });
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    media.restore();
    document.documentElement.classList.remove("dark");
  });

  it("adds the class when the store turns dark", () => {
    render(<ThemeSync />);
    expect(document.documentElement).not.toHaveClass("dark");

    act(() => useUiStore.getState().setTheme("dark"));

    expect(document.documentElement).toHaveClass("dark");
  });

  it("removes the class when the store turns light again", () => {
    useUiStore.setState({ theme: "dark" });
    render(<ThemeSync />);
    expect(document.documentElement).toHaveClass("dark");

    act(() => useUiStore.getState().setTheme("light"));

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("follows the OS only while the choice is system", () => {
    useUiStore.setState({ theme: "system" });
    render(<ThemeSync />);
    expect(document.documentElement).not.toHaveClass("dark");

    act(() => media.setMatches(DARK_SCHEME, true));
    expect(document.documentElement).toHaveClass("dark");

    act(() => useUiStore.getState().setTheme("light"));
    act(() => media.setMatches(DARK_SCHEME, false));
    act(() => media.setMatches(DARK_SCHEME, true));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("renders nothing", () => {
    const { container } = render(<ThemeSync />);

    expect(container).toBeEmptyDOMElement();
  });

  /**
   * Regression, Wave 4 Stage 1 review: `useMediaQuery` returns its server snapshot
   * (`false`) during the hydration render, so resolving through it made ThemeSync
   * strip the `.dark` class that the pre-hydration script had correctly set for a
   * stored "system" choice on a dark OS — one frame of light before the re-render
   * put it back. ThemeSync must read the colour scheme itself.
   */
  it("keeps the pre-hydration class when the media hook still reports the server snapshot", async () => {
    vi.resetModules();
    // Stand in for the hydration render: the hook says light, the OS says dark
    vi.doMock("@/lib/hooks/use-media-query", () => ({
      useMediaQuery: () => false,
    }));

    media.setMatches(DARK_SCHEME, true);
    useUiStore.setState({ theme: "system" });
    document.documentElement.classList.add("dark");

    const { ThemeSync: Subject } = await import("@/components/theme-sync");
    render(<Subject />);

    expect(document.documentElement).toHaveClass("dark");
    vi.doUnmock("@/lib/hooks/use-media-query");
  });
});
