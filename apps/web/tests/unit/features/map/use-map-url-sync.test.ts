import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseMapParams,
  serializeMapState,
  useApplyPendingSelection,
  useMapUrlSync,
} from "@/features/map/hooks/use-map-url-sync";
import { initialMapState, useMapStore } from "@/stores/mapStore";
import { useUiStore } from "@/stores/uiStore";
import type { MapItem } from "@/features/map/data/types";

vi.mock("@/lib/api", () => ({}));

function goTo(url: string) {
  window.history.replaceState(null, "", url);
}

describe("parseMapParams", () => {
  it("reads every parameter", () => {
    expect(
      parseMapParams("?mode=records&status=partial&q=igreja&sel=r%3Aigreja")
    ).toEqual({
      mode: "records",
      status: "partial",
      query: "igreja",
      selectedKey: "r:igreja",
    });
  });

  it("falls back to defaults for missing or unknown values", () => {
    expect(parseMapParams("?mode=places&status=bogus&sel=x:1")).toEqual({
      mode: "settlements",
      status: "all",
      query: "",
      selectedKey: null,
    });
  });

  it("drops a selection that belongs to another mode", () => {
    expect(
      parseMapParams("?mode=photographs&sel=s:furna").selectedKey
    ).toBeNull();
    expect(parseMapParams("?sel=s:furna").selectedKey).toBe("s:furna");
  });
});

describe("serializeMapState", () => {
  it("omits defaults, so the plain map has a plain URL", () => {
    expect(
      serializeMapState({
        mode: "settlements",
        status: "all",
        query: "",
        selectedKey: null,
      })
    ).toBe("");
  });

  it("writes what differs, in a stable order", () => {
    expect(
      serializeMapState({
        mode: "settlements",
        status: "name",
        query: " fur ",
        selectedKey: "s:furna",
      })
    ).toBe("status=name&q=fur&sel=s%3Afurna");
  });

  it("round-trips through parse", () => {
    const state = {
      mode: "photographs" as const,
      status: "partial" as const,
      query: "harbour",
      selectedKey: "p:abc",
    };
    expect(parseMapParams(`?${serializeMapState(state)}`)).toEqual(state);
  });
});

describe("useMapUrlSync", () => {
  let replace: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    useMapStore.setState(initialMapState);
    useUiStore.setState({ theme: "light" });
    goTo("/map");
    replace = vi.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    replace.mockRestore();
    vi.useRealTimers();
  });

  it("restores mode, filter and selection from a deep link", () => {
    goTo("/map?mode=settlements&status=name&sel=s:furna");
    replace.mockClear();

    renderHook(() => useMapUrlSync());

    const s = useMapStore.getState();
    expect(s.mode).toBe("settlements");
    expect(s.status).toBe("name");
    expect(s.selectedKey).toBe("s:furna");
  });

  it("does not write on mount when the URL already says the state", () => {
    goTo("/map?mode=settlements&status=name&sel=s:furna");
    replace.mockClear();

    renderHook(() => useMapUrlSync());
    act(() => vi.advanceTimersByTime(1000));

    expect(replace).not.toHaveBeenCalled();
  });

  it("writes a change with replaceState, keeping the history entry's state", () => {
    const { unmount } = renderHook(() => useMapUrlSync());
    window.history.replaceState({ marker: 1 }, "", window.location.href);
    replace.mockClear();

    act(() => useMapStore.getState().setMode("records"));

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace.mock.calls[0][0]).toEqual({ marker: 1 });
    expect(window.location.pathname + window.location.search).toBe(
      "/map?mode=records"
    );
    unmount();
  });

  it("does not write when a change serialises to what was last written", () => {
    renderHook(() => useMapUrlSync());
    act(() => useMapStore.getState().select("s:furna"));
    replace.mockClear();

    act(() => useMapStore.getState().resetTransient());
    act(() => useMapStore.getState().select("s:furna"));

    expect(replace).not.toHaveBeenCalled();
  });

  it("debounces the query by 300ms", () => {
    renderHook(() => useMapUrlSync());

    act(() => useMapStore.getState().setQuery("f"));
    act(() => useMapStore.getState().setQuery("fu"));
    act(() => useMapStore.getState().setQuery("fur"));
    act(() => vi.advanceTimersByTime(299));
    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe("?q=fur");
  });

  it("lets a pending query write carry a change made while it waits", () => {
    renderHook(() => useMapUrlSync());

    act(() => useMapStore.getState().setQuery("fu"));
    act(() => useMapStore.getState().setStatus("name"));
    // Writing the status now would publish a half-typed query.
    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(replace).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe("?status=name&q=fu");
  });

  it("leaves the theme to the visitor's own setting", () => {
    // Spec 034 deviation: `theme` is not map state. It neither lands in the URL
    // nor is taken from it.
    goTo("/map?theme=dark");
    renderHook(() => useMapUrlSync());
    expect(useUiStore.getState().theme).toBe("light");

    act(() => useUiStore.getState().setTheme("dark"));
    act(() => useMapStore.getState().setMode("records"));

    expect(window.location.search).toBe("?mode=records");
  });

  it("re-reads the URL when the route is shown again", () => {
    goTo("/map?mode=records");
    const first = renderHook(() => useMapUrlSync());
    expect(useMapStore.getState().mode).toBe("records");
    // Activity hides the route: effects clean up.
    first.unmount();

    // Someone follows a photo detail's "Show on map" link.
    goTo("/map?mode=photographs&sel=p:abc");
    renderHook(() => useMapUrlSync());

    expect(useMapStore.getState().mode).toBe("photographs");
    expect(useMapStore.getState().selectedKey).toBe("p:abc");
  });

  it("stops writing once hidden, and never writes into another route", () => {
    const { unmount } = renderHook(() => useMapUrlSync());
    act(() => useMapStore.getState().setQuery("fur"));
    unmount();
    goTo("/photographs");
    replace.mockClear();

    act(() => vi.advanceTimersByTime(1000));
    act(() => useMapStore.getState().setMode("records"));

    expect(replace).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/photographs");
  });

  it("drops a pending query write when hidden, even on the same route", () => {
    const { unmount } = renderHook(() => useMapUrlSync());
    act(() => useMapStore.getState().setQuery("fur"));
    unmount();

    act(() => vi.advanceTimersByTime(1000));

    expect(replace).not.toHaveBeenCalled();
    expect(window.location.search).toBe("");
  });

  it("refuses to write once the address has moved to another route", () => {
    // Navigation changes the address before Activity hides the map.
    renderHook(() => useMapUrlSync());
    goTo("/photographs?filter=noplace");
    replace.mockClear();

    act(() => useMapStore.getState().setMode("records"));

    expect(replace).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?filter=noplace");
  });

  it("hands the deep-linked selection over as pending", () => {
    goTo("/map?sel=s:furna");
    const { result } = renderHook(() => useMapUrlSync());
    expect(result.current.current).toBe("s:furna");
  });
});

describe("useApplyPendingSelection", () => {
  const furna = { key: "s:furna", name: "Furna" } as MapItem;

  it("waits until the map and the data are ready, then acts once", () => {
    const pending = { current: "s:furna" as string | null };
    const onFound = vi.fn();
    const onMissing = vi.fn();

    const { rerender } = renderHook(
      ({ ready, items }) =>
        useApplyPendingSelection(pending, { ready, items, onFound, onMissing }),
      { initialProps: { ready: false, items: [] as MapItem[] } }
    );
    expect(onFound).not.toHaveBeenCalled();

    rerender({ ready: true, items: [furna] });
    expect(onFound).toHaveBeenCalledWith(furna);
    expect(pending.current).toBeNull();

    rerender({ ready: true, items: [furna, { ...furna }] });
    expect(onFound).toHaveBeenCalledTimes(1);
    expect(onMissing).not.toHaveBeenCalled();
  });

  it("reports a key the loaded data does not hold", () => {
    const pending = { current: "s:atlantis" as string | null };
    const onFound = vi.fn();
    const onMissing = vi.fn();

    renderHook(() =>
      useApplyPendingSelection(pending, {
        ready: true,
        items: [furna],
        onFound,
        onMissing,
      })
    );

    expect(onFound).not.toHaveBeenCalled();
    expect(onMissing).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a pending key", () => {
    const pending = { current: null as string | null };
    const onMissing = vi.fn();
    renderHook(() =>
      useApplyPendingSelection(pending, {
        ready: true,
        items: [],
        onFound: vi.fn(),
        onMissing,
      })
    );
    expect(onMissing).not.toHaveBeenCalled();
  });
});
