import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { useUiStore } from "@/stores/uiStore";
import { mockMatchMedia } from "../../setup/match-media-mock";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

describe("useResolvedTheme", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [DARK_SCHEME]: false });
    useUiStore.setState({ theme: "system" });
  });

  afterEach(() => {
    media.restore();
  });

  it.each(["light", "dark"] as const)(
    "returns an explicit %s choice as-is",
    (theme) => {
      useUiStore.setState({ theme });
      media.setMatches(DARK_SCHEME, theme === "light");

      const { result } = renderHook(() => useResolvedTheme());

      expect(result.current).toBe(theme);
    }
  );

  it("resolves the system choice from the colour-scheme preference", () => {
    media.setMatches(DARK_SCHEME, true);

    const { result } = renderHook(() => useResolvedTheme());

    expect(result.current).toBe("dark");
  });

  it("updates when the store changes", () => {
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("light");

    act(() => useUiStore.getState().setTheme("dark"));
    expect(result.current).toBe("dark");

    act(() => useUiStore.getState().setTheme("light"));
    expect(result.current).toBe("light");
  });

  it("follows a system scheme change while the choice is system", () => {
    const { result } = renderHook(() => useResolvedTheme());
    expect(result.current).toBe("light");

    act(() => media.setMatches(DARK_SCHEME, true));
    expect(result.current).toBe("dark");
  });

  it("ignores a system scheme change once a theme is chosen", () => {
    useUiStore.setState({ theme: "light" });
    const { result } = renderHook(() => useResolvedTheme());

    act(() => media.setMatches(DARK_SCHEME, true));
    expect(result.current).toBe("light");
  });
});
