import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useNarrow } from "@/hooks/use-narrow";
import { mockMatchMedia } from "../../setup/match-media-mock";

const NARROW = "(max-width: 860px)";

describe("useNarrow", () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    media = mockMatchMedia({ [NARROW]: false });
  });

  afterEach(() => {
    media.restore();
  });

  it("listens to the 860px breakpoint by default", () => {
    media.setMatches(NARROW, true);

    const { result } = renderHook(() => useNarrow());

    expect(result.current).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith(NARROW);
  });

  it("accepts another query", () => {
    const query = "(max-width: 480px)";
    media.setMatches(query, true);

    const { result } = renderHook(() => useNarrow(query));

    expect(result.current).toBe(true);
  });

  it("updates when the viewport crosses the breakpoint", () => {
    const { result } = renderHook(() => useNarrow());
    expect(result.current).toBe(false);

    act(() => media.setMatches(NARROW, true));
    expect(result.current).toBe(true);

    act(() => media.setMatches(NARROW, false));
    expect(result.current).toBe(false);
  });

  it("subscribes to change events and cleans up on unmount", () => {
    const { unmount } = renderHook(() => useNarrow());
    expect(media.listenerCount(NARROW)).toBe(1);

    unmount();
    expect(media.listenerCount(NARROW)).toBe(0);
  });

  it("renders as wide on the server", () => {
    media.setMatches(NARROW, true);

    function Probe() {
      return createElement("span", null, useNarrow() ? "narrow" : "wide");
    }

    expect(renderToString(createElement(Probe))).toContain("wide");
  });
});
