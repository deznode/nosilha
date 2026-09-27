import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  useCrossfade,
  type StageImage,
} from "@/components/photographs/viewer/use-crossfade";

/** Each fake image's decode resolves only when the test says so. */
const pending = new Map<string, () => void>();
class FakeImage {
  sizes = "";
  srcset = "";
  src = "";
  decode() {
    return new Promise<void>((resolve) => pending.set(this.src, resolve));
  }
}

const img = (id: string): StageImage => ({
  id,
  src: `https://media.nosilha.com/${id}.jpg`,
  alt: id,
});

async function decode(id: string) {
  await act(async () => {
    pending.get(img(id).src ?? "")?.();
    await Promise.resolve();
  });
}

/** Spec 038 FR-023 — two layers, decode before swap, stale loads ignored. */
describe("useCrossfade", () => {
  const RealImage = window.Image;
  beforeEach(() => {
    pending.clear();
    (window as unknown as { Image: unknown }).Image = FakeImage;
  });
  afterEach(() => {
    window.Image = RealImage;
  });

  it("keeps the current photograph up until the next one decodes", async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCrossfade(target, "100vw"),
      { initialProps: { target: img("a") } }
    );
    expect(result.current.shownId).toBe("a");

    rerender({ target: img("b") });
    expect(result.current.shownId).toBe("a");
    expect(result.current.layers[1]).toBeNull();

    await decode("b");
    expect(result.current.shownId).toBe("b");
    expect(result.current.front).toBe(1);
    // The previous photograph stays on the back layer to fade out.
    expect(result.current.layers[0]?.id).toBe("a");
  });

  it("settles on the last photograph asked for", async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCrossfade(target, "100vw"),
      { initialProps: { target: img("a") } }
    );
    rerender({ target: img("b") });
    rerender({ target: img("c") });

    await decode("b"); // stale: ignored
    expect(result.current.shownId).toBe("a");
    await decode("c");
    expect(result.current.shownId).toBe("c");
  });

  it("ignores a load that was overtaken by a return to the photograph on screen", async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCrossfade(target, "100vw"),
      { initialProps: { target: img("a") } }
    );
    rerender({ target: img("b") });
    rerender({ target: img("a") });
    await decode("b");
    expect(result.current.shownId).toBe("a");
  });
});
