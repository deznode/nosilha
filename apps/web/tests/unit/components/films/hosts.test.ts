import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountFile } from "@/components/films/hosts/file";
import {
  PROGRESS_POLL_MS,
  type HostCallbacks,
} from "@/components/films/hosts/types";
import {
  mountVimeo,
  VIMEO_START_GRACE_MS,
} from "@/components/films/hosts/vimeo";
import {
  mountYouTube,
  YOUTUBE_API_TIMEOUT_MS,
  YOUTUBE_START_GRACE_MS,
} from "@/components/films/hosts/youtube";

/** Spec 035 FR-008 — how each host's report becomes a player state. */

function callbacks() {
  return { onPlaying: vi.fn(), onBlocked: vi.fn(), onRemoved: vi.fn() };
}

describe("mountYouTube", () => {
  let events: {
    onReady: () => void;
    onStateChange: (e: { data: number }) => void;
    onError: (e: { data: number }) => void;
  };
  let options: Record<string, unknown>;
  const player = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    seekTo: vi.fn(),
    getCurrentTime: vi.fn(() => 30),
    getDuration: vi.fn(() => 120),
    destroy: vi.fn(),
  };

  beforeEach(() => {
    window.YT = {
      Player: vi.fn(function (_el: HTMLElement, opts: typeof options) {
        options = opts;
        events = opts.events as typeof events;
        return player;
      }) as never,
    };
  });

  afterEach(() => {
    delete window.YT;
    vi.useRealTimers();
    Object.values(player).forEach((fn) => fn.mockClear());
  });

  it("plays through youtube-nocookie with its own controls hidden", async () => {
    const cb = { ...callbacks(), onControls: vi.fn() };
    const container = document.createElement("div");
    mountYouTube(container, "abc", "A film", cb);
    await Promise.resolve();

    expect(options).toMatchObject({
      host: "https://www.youtube-nocookie.com",
      videoId: "abc",
      playerVars: { controls: 0, mute: 0 },
    });
    expect(cb.onControls).toHaveBeenCalledWith("custom");
    events.onReady();
    expect(player.playVideo).toHaveBeenCalled();
    expect(cb.onPlaying).not.toHaveBeenCalled();
    events.onStateChange({ data: 1 });
    expect(cb.onPlaying).toHaveBeenCalled();
  });

  it("starts muted when asked, and reports pause and end", async () => {
    const cb = {
      ...callbacks(),
      onPaused: vi.fn(),
      onEnded: vi.fn(),
      onProgress: vi.fn(),
    };
    mountYouTube(document.createElement("div"), "abc", "A film", cb, {
      muted: true,
      loop: false,
    });
    await Promise.resolve();
    expect(options).toMatchObject({ playerVars: { mute: 1 } });
    events.onReady();
    expect(player.mute).toHaveBeenCalled();

    events.onStateChange({ data: 2 });
    expect(cb.onPaused).toHaveBeenCalled();
    events.onStateChange({ data: 0 });
    expect(cb.onProgress).toHaveBeenCalledWith(1);
    expect(cb.onEnded).toHaveBeenCalled();
  });

  it("replays instead of ending when looping", async () => {
    const cb = { ...callbacks(), onEnded: vi.fn() };
    mountYouTube(document.createElement("div"), "abc", "A film", cb, {
      muted: true,
      loop: true,
    });
    await Promise.resolve();
    events.onReady();
    events.onStateChange({ data: 0 });
    expect(player.seekTo).toHaveBeenCalledWith(0, true);
    expect(cb.onEnded).not.toHaveBeenCalled();
  });

  it("polls progress while playing", async () => {
    vi.useFakeTimers();
    const cb = { ...callbacks(), onProgress: vi.fn() };
    const handle = mountYouTube(
      document.createElement("div"),
      "abc",
      "A film",
      cb
    );
    await Promise.resolve();
    await Promise.resolve();
    events.onReady();
    events.onStateChange({ data: 1 });
    vi.advanceTimersByTime(PROGRESS_POLL_MS);
    expect(cb.onProgress).toHaveBeenCalledWith(0.25);
    handle.destroy();
  });

  it("does not mistake buffering for a refused start", async () => {
    vi.useFakeTimers();
    const cb = { ...callbacks(), onPaused: vi.fn() };
    const handle = mountYouTube(
      document.createElement("div"),
      "abc",
      "A film",
      cb
    );
    await Promise.resolve();
    await Promise.resolve();
    events.onReady();
    events.onStateChange({ data: 3 });
    vi.advanceTimersByTime(YOUTUBE_START_GRACE_MS);
    expect(cb.onPaused).not.toHaveBeenCalled();
    handle.destroy();
  });

  it("treats a start the browser refused as paused", async () => {
    vi.useFakeTimers();
    const cb = { ...callbacks(), onPaused: vi.fn() };
    const handle = mountYouTube(
      document.createElement("div"),
      "abc",
      "A film",
      cb
    );
    await Promise.resolve();
    await Promise.resolve();
    events.onReady();
    vi.advanceTimersByTime(YOUTUBE_START_GRACE_MS);
    expect(cb.onPaused).toHaveBeenCalled();
    handle.destroy();
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

  it("drives the player and destroys it", async () => {
    const container = document.createElement("div");
    const handle = mountYouTube(container, "abc", "A film", callbacks());
    await Promise.resolve();
    events.onReady();
    player.playVideo.mockClear();

    handle.play();
    handle.pause();
    handle.setMuted(true);
    handle.setMuted(false);
    handle.seek(0.5);
    handle.destroy();
    expect(player.playVideo).toHaveBeenCalled();
    expect(player.pauseVideo).toHaveBeenCalled();
    expect(player.mute).toHaveBeenCalled();
    expect(player.unMute).toHaveBeenCalled();
    expect(player.seekTo).toHaveBeenCalledWith(60, true);
    expect(player.destroy).toHaveBeenCalled();
    expect(container.childElementCount).toBe(0);
  });

  it("leaves a player that isn't ready alone", async () => {
    // The real API adds playVideo, pauseVideo and the rest only when the embed
    // reports in, just before onReady; until then only destroy exists.
    const early = { destroy: vi.fn() };
    window.YT = {
      Player: vi.fn(function (_el: HTMLElement, opts: typeof options) {
        events = opts.events as typeof events;
        return early;
      }) as never,
    };
    const handle = mountYouTube(
      document.createElement("div"),
      "abc",
      "A film",
      callbacks()
    );
    await Promise.resolve();

    expect(() => {
      handle.pause();
      handle.play();
      handle.setMuted(false);
      handle.seek(0.5);
    }).not.toThrow();
    handle.destroy();
    expect(early.destroy).toHaveBeenCalled();
  });

  it("falls back to a plain iframe with the host's controls", () => {
    vi.useFakeTimers();
    delete window.YT;
    const cb = { ...callbacks(), onControls: vi.fn() };
    const container = document.createElement("div");
    const handle = mountYouTube(container, "abc", "A film", cb, {
      muted: true,
      loop: true,
    });

    vi.advanceTimersByTime(YOUTUBE_API_TIMEOUT_MS);
    const iframe = container.querySelector("iframe")!;
    expect(iframe.src).toContain("https://www.youtube-nocookie.com/embed/abc");
    expect(iframe.src).toContain("mute=1");
    expect(iframe.src).toContain("loop=1");
    expect(cb.onControls).toHaveBeenCalledWith("host");

    iframe.dispatchEvent(new Event("load"));
    expect(cb.onPlaying).toHaveBeenCalled();

    handle.destroy();
  });
});

describe("mountFile", () => {
  it("plays the file with no native controls and reports its events", () => {
    const cb = {
      ...callbacks(),
      onEnded: vi.fn(),
      onProgress: vi.fn(),
      onControls: vi.fn(),
    };
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const container = document.createElement("div");
    const handle = mountFile(
      container,
      "https://media.nosilha.com/a.mp4",
      "A",
      cb,
      {
        muted: true,
        loop: false,
      }
    );
    const video = container.querySelector("video")!;
    expect(video.controls).toBe(false);
    expect(video.muted).toBe(true);
    expect(cb.onControls).toHaveBeenCalledWith("custom");

    video.dispatchEvent(new Event("playing"));
    expect(cb.onPlaying).toHaveBeenCalled();
    video.dispatchEvent(new Event("ended"));
    expect(cb.onEnded).toHaveBeenCalled();
    video.dispatchEvent(new Event("error"));
    expect(cb.onRemoved).toHaveBeenCalled();

    handle.destroy();
    expect(container.childElementCount).toBe(0);
    play.mockRestore();
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

  function mount(extra: Partial<HostCallbacks> = {}) {
    const cb = { ...callbacks(), ...extra };
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

  it("asks for the player's events and drives it", () => {
    const { iframe, handle } = mount();
    const post = vi.spyOn(iframe.contentWindow!, "postMessage");
    message(iframe, { event: "ready" });
    const sent = post.mock.calls.map(([data]) => JSON.parse(data as string));
    expect(sent).toContainEqual({ method: "addEventListener", value: "ended" });
    expect(sent).toContainEqual({
      method: "addEventListener",
      value: "timeupdate",
    });
    message(iframe, {
      event: "timeupdate",
      data: { percent: 0.5, duration: 80 },
    });
    handle.seek(0.25);
    handle.setMuted(true);
    const later = post.mock.calls.map(([data]) => JSON.parse(data as string));
    expect(later).toContainEqual({ method: "setCurrentTime", value: 20 });
    expect(later).toContainEqual({ method: "setMuted", value: true });
    handle.destroy();
  });

  it("reports progress and the end", () => {
    const onProgress = vi.fn();
    const onEnded = vi.fn();
    const { iframe, handle } = mount({ onProgress, onEnded });
    message(iframe, { event: "timeupdate", data: { percent: 0.4 } });
    message(iframe, { event: "ended" });
    expect(onProgress).toHaveBeenCalledWith(0.4);
    expect(onEnded).toHaveBeenCalled();
    handle.destroy();
  });

  it("reports play as playing, and a load that never starts as paused", () => {
    vi.useFakeTimers();
    const onPaused = vi.fn();
    const { cb, iframe, handle } = mount({ onPaused });
    message(iframe, { event: "loaded" });
    expect(cb.onPlaying).not.toHaveBeenCalled();
    vi.advanceTimersByTime(VIMEO_START_GRACE_MS);
    expect(onPaused).toHaveBeenCalled();
    message(iframe, { event: "play" });
    expect(cb.onPlaying).toHaveBeenCalled();
    handle.destroy();
    vi.useRealTimers();
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
    message(iframe, { event: "play" }, "https://evil.example");
    expect(cb.onPlaying).not.toHaveBeenCalled();

    handle.destroy();
    message(iframe, { event: "play" });
    expect(cb.onPlaying).not.toHaveBeenCalled();
    expect(container.childElementCount).toBe(0);
  });
});
