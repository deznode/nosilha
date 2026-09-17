import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  placeLabels,
  useLabelDeclutter,
  type LabelRect,
} from "@/features/map/hooks/use-label-declutter";

function rect(left: number, top: number, width = 60, height = 16): LabelRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

describe("placeLabels", () => {
  it("keeps labels that do not collide", () => {
    const visible = placeLabels([
      { key: "a", priority: 1, rect: rect(0, 0) },
      { key: "b", priority: 1, rect: rect(200, 0) },
    ]);
    expect([...visible!].sort()).toEqual(["a", "b"]);
  });

  it("places higher priority first and hides what it overlaps", () => {
    const visible = placeLabels([
      { key: "has-records", priority: 1, rect: rect(0, 0) },
      { key: "documented", priority: 2, rect: rect(30, 5) },
    ]);
    expect([...visible!]).toEqual(["documented"]);
  });

  it("lets the selected label win over everything", () => {
    const visible = placeLabels([
      { key: "documented", priority: 2, rect: rect(0, 0) },
      { key: "selected", priority: 3, rect: rect(10, 0) },
    ]);
    expect([...visible!]).toEqual(["selected"]);
  });

  it("keeps input order between labels of equal priority", () => {
    const visible = placeLabels([
      { key: "first", priority: 1, rect: rect(0, 0) },
      { key: "second", priority: 1, rect: rect(10, 0) },
    ]);
    expect([...visible!]).toEqual(["first"]);
  });

  it("treats a gap under 6px horizontally as a collision", () => {
    // a ends at 60; b starts 5px later.
    expect(
      placeLabels([
        { key: "a", priority: 2, rect: rect(0, 0) },
        { key: "b", priority: 1, rect: rect(65, 0) },
      ])!.has("b")
    ).toBe(false);
    // 6px later is clear.
    expect(
      placeLabels([
        { key: "a", priority: 2, rect: rect(0, 0) },
        { key: "b", priority: 1, rect: rect(66, 0) },
      ])!.has("b")
    ).toBe(true);
  });

  it("treats a gap under 4px vertically as a collision", () => {
    // a ends at 16; b starts 3px later.
    expect(
      placeLabels([
        { key: "a", priority: 2, rect: rect(0, 0) },
        { key: "b", priority: 1, rect: rect(0, 19) },
      ])!.has("b")
    ).toBe(false);
    expect(
      placeLabels([
        { key: "a", priority: 2, rect: rect(0, 0) },
        { key: "b", priority: 1, rect: rect(0, 20) },
      ])!.has("b")
    ).toBe(true);
  });

  it("returns null when the first label measures nothing (a hidden route)", () => {
    expect(
      placeLabels([
        { key: "a", priority: 3, rect: rect(0, 0, 0, 0) },
        { key: "b", priority: 1, rect: rect(100, 0) },
      ])
    ).toBeNull();
  });
});

// ─── the hook ────────────────────────────────────────────────────────────────

function label(r: LabelRect): HTMLElement {
  const el = document.createElement("span");
  el.getBoundingClientRect = () => ({
    ...r,
    x: r.left,
    y: r.top,
    toJSON: () => r,
  });
  return el;
}

describe("useLabelDeclutter", () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames[id - 1] = () => {};
    });
  });

  afterEach(() => vi.restoreAllMocks());

  const flush = () => act(() => frames.splice(0).forEach((cb) => cb(0)));

  it("hides the lower-priority label of a colliding pair in one frame", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const low = label(rect(0, 0));
    const high = label(rect(20, 0));

    act(() => {
      result.current.registerLabel("low", 1)(low);
      result.current.registerLabel("high", 2)(high);
      result.current.scheduleDeclutter();
    });
    expect(frames).toHaveLength(1);
    flush();

    expect(low.style.visibility).toBe("hidden");
    expect(high.style.visibility).not.toBe("hidden");
  });

  it("runs once per frame however often it is asked", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const el = label(rect(0, 0));
    const read = vi.spyOn(el, "getBoundingClientRect");

    act(() => {
      result.current.registerLabel("a", 1)(el);
      result.current.scheduleDeclutter();
      result.current.scheduleDeclutter();
      result.current.scheduleDeclutter();
    });
    flush();

    expect(read).toHaveBeenCalledTimes(1);
  });

  it("writes only the labels whose visibility changes", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const kept = label(rect(0, 0));
    const hidden = label(rect(10, 0));
    const keptWrites = vi.spyOn(kept.style, "setProperty");

    act(() => {
      result.current.registerLabel("kept", 2)(kept);
      result.current.registerLabel("hidden", 1)(hidden);
      result.current.scheduleDeclutter();
    });
    flush();

    expect(hidden.style.visibility).toBe("hidden");
    expect(keptWrites).not.toHaveBeenCalled();
  });

  it("shows a label again once its neighbour has gone", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const low = label(rect(0, 0));
    const high = label(rect(20, 0));

    let detachHigh: void | (() => void);
    act(() => {
      result.current.registerLabel("low", 1)(low);
      detachHigh = result.current.registerLabel("high", 2)(high);
      result.current.scheduleDeclutter();
    });
    flush();
    expect(low.style.visibility).toBe("hidden");

    act(() => {
      (detachHigh as () => void)();
      result.current.scheduleDeclutter();
    });
    flush();
    expect(low.style.visibility).toBe("visible");
  });

  it("bails without writing when the route is hidden", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const a = label(rect(0, 0, 0, 0));
    const b = label(rect(0, 0, 0, 0));
    b.style.visibility = "hidden";

    act(() => {
      result.current.registerLabel("a", 2)(a);
      result.current.registerLabel("b", 1)(b);
      result.current.scheduleDeclutter();
    });
    flush();

    expect(a.style.visibility).toBe("");
    expect(b.style.visibility).toBe("hidden");
  });

  it("keeps a label that took over its key when the old one detaches late", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const other = label(rect(0, 0));
    const stale = label(rect(500, 500));
    const current = label(rect(10, 0));

    let detachStale: void | (() => void);
    act(() => {
      result.current.registerLabel("other", 2)(other);
      detachStale = result.current.registerLabel("pin", 1)(stale);
      // The pin re-rendered into a new element before the old one was cleaned up.
      result.current.registerLabel("pin", 1)(current);
      (detachStale as () => void)();
      result.current.scheduleDeclutter();
    });
    flush();

    // Still registered, so still measured against its neighbour.
    expect(current.style.visibility).toBe("hidden");
  });

  it("forgets a label's ref callback once the label is gone", () => {
    const { result } = renderHook(() => useLabelDeclutter());
    const first = result.current.registerLabel("a", 1);
    const detach = first(label(rect(0, 0)));

    act(() => (detach as () => void)());

    expect(result.current.registerLabel("a", 1)).not.toBe(first);
  });

  it("hands back the same ref callback for the same label", () => {
    const { result, rerender } = renderHook(() => useLabelDeclutter());
    const first = result.current.registerLabel("a", 1);
    rerender();
    expect(result.current.registerLabel("a", 1)).toBe(first);
    expect(result.current.registerLabel("a", 3)).not.toBe(first);
  });

  it("cancels a pending frame on unmount", () => {
    const { result, unmount } = renderHook(() => useLabelDeclutter());
    const el = label(rect(0, 0));
    const read = vi.spyOn(el, "getBoundingClientRect");

    act(() => {
      result.current.registerLabel("a", 1)(el);
      result.current.scheduleDeclutter();
    });
    unmount();
    flush();

    expect(read).not.toHaveBeenCalled();
  });
});
