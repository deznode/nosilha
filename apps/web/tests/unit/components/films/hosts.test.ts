import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountVimeo } from "@/components/films/hosts/vimeo";
import {
  mountYouTube,
  YOUTUBE_API_TIMEOUT_MS,
} from "@/components/films/hosts/youtube";

/** Spec 035 FR-008 — how each host's report becomes a player state. */

function callbacks() {
  return { onPlaying: vi.fn(), onBlocked: vi.fn(), onRemoved: vi.fn() };
}

describe("mountYouTube", () => {
  let events: { onReady: () => void; onError: (e: { data: number }) => void };
  let options: Record<string, unknown>;
  const pauseVideo = vi.fn();
  const destroy = vi.fn();

  beforeEach(() => {
    window.YT = {
      Player: vi.fn(function (_el: HTMLElement, opts: typeof options) {
        options = opts;
        events = opts.events as typeof events;
        return { pauseVideo, destroy };
      }) as never,
    };
  });

  afterEach(() => {
    delete window.YT;
    pauseVideo.mockClear();
    destroy.mockClear();
  });

  it("plays through youtube-nocookie and reports ready as playing", async () => {
    const cb = callbacks();
    const container = document.createElement("div");
    mountYouTube(container, "abc", "A film", cb);
    await Promise.resolve();

    expect(options).toMatchObject({
      host: "https://www.youtube-nocookie.com",
      videoId: "abc",
    });
    events.onReady();
    expect(cb.onPlaying).toHaveBeenCalled();
  });

  it.each([
    [101, "onBlocked"],
    [150, "onBlocked"],
    [100, "onRemoved"],
    [2, "onRemoved"],
    [5, "onRemoved"],
  ] as const)("maps error %i to %s", async (code, expected) => {
    const cb = callbacks();
    mountYouTube(document.createElement("div"), "abc", "A film", cb);
    await Promise.resolve();

    events.onError({ data: code });
    expect(cb[expected]).toHaveBeenCalledTimes(1);
  });

  it("pauses and destroys the player", async () => {
    const container = document.createElement("div");
    const handle = mountYouTube(container, "abc", "A film", callbacks());
    await Promise.resolve();

    handle.pause();
    handle.destroy();
    expect(pauseVideo).toHaveBeenCalled();
    expect(destroy).toHaveBeenCalled();
    expect(container.childElementCount).toBe(0);
  });

  it("falls back to a plain iframe when the API never loads", () => {
    vi.useFakeTimers();
    delete window.YT;
    const cb = callbacks();
    const container = document.createElement("div");
    const handle = mountYouTube(container, "abc", "A film", cb);

    vi.advanceTimersByTime(YOUTUBE_API_TIMEOUT_MS);
    const iframe = container.querySelector("iframe")!;
    expect(iframe.src).toContain("https://www.youtube-nocookie.com/embed/abc");

    iframe.dispatchEvent(new Event("load"));
    expect(cb.onPlaying).toHaveBeenCalled();

    handle.destroy();
    vi.useRealTimers();
  });
});

describe("mountVimeo", () => {
  function message(
    iframe: HTMLIFrameElement,
    data: unknown,
    origin = "https://player.vimeo.com"
  ) {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify(data),
        origin,
        source: iframe.contentWindow,
      })
    );
  }

  function mount() {
    const cb = callbacks();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const handle = mountVimeo(container, "76979871", "A film", cb);
    const iframe = container.querySelector("iframe")!;
    return { cb, container, handle, iframe };
  }

  it("embeds the Vimeo player", () => {
    const { iframe, handle } = mount();
    expect(iframe.src).toContain("https://player.vimeo.com/video/76979871");
    handle.destroy();
  });

  it("reports loaded as playing", () => {
    const { cb, iframe, handle } = mount();
    message(iframe, { event: "loaded" });
    expect(cb.onPlaying).toHaveBeenCalled();
    handle.destroy();
  });

  it("maps PrivacyError to blocked and NotFoundError to removed", () => {
    const { cb, iframe, handle } = mount();
    message(iframe, { event: "error", data: { name: "PrivacyError" } });
    message(iframe, { event: "error", data: { name: "NotFoundError" } });
    expect(cb.onBlocked).toHaveBeenCalledTimes(1);
    expect(cb.onRemoved).toHaveBeenCalledTimes(1);
    handle.destroy();
  });

  it("reads a password as blocked and any other load failure as removed", () => {
    const { cb, iframe, handle } = mount();
    message(iframe, { event: "error", data: { name: "PasswordError" } });
    expect(cb.onBlocked).toHaveBeenCalledTimes(1);

    // A playback hiccup after load is not a verdict on the film.
    message(iframe, { event: "error", data: { name: "SomeError" } });
    expect(cb.onRemoved).not.toHaveBeenCalled();

    message(iframe, {
      event: "error",
      data: { name: "UnsupportedViewerError", method: "ready" },
    });
    expect(cb.onRemoved).toHaveBeenCalledTimes(1);
    handle.destroy();
  });

  it("ignores messages from other origins and after destroy", () => {
    const { cb, iframe, handle, container } = mount();
    message(iframe, { event: "loaded" }, "https://evil.example");
    expect(cb.onPlaying).not.toHaveBeenCalled();

    handle.destroy();
    message(iframe, { event: "loaded" });
    expect(cb.onPlaying).not.toHaveBeenCalled();
    expect(container.childElementCount).toBe(0);
  });
});
