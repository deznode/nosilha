import {
  DEFAULT_MOUNT,
  PROGRESS_POLL_MS,
  type HostCallbacks,
  type HostHandle,
  type MountOptions,
} from "./types";

/**
 * YouTube, through its IFrame API, so the player can tell us why a film won't play.
 * Spec 035 FR-008.
 *
 * The API is the only way to learn that a film is embed-restricted or region-locked:
 * that is decided per viewer, in the viewer's browser. Error 101/150 means the owner
 * forbids embedding here; 100 means the video is gone; 2 and 5 mean the player cannot
 * play what it was given, which to a viewer is the same as gone.
 */

/** The slice of the IFrame API this module touches. */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      host: string;
      videoId: string;
      width: string;
      height: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
}

/** `YT.PlayerState`, which the API only defines once it has loaded. */
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";
const EMBED_HOST = "https://www.youtube-nocookie.com";
/** After this long without the API, play in a plain iframe and stop detecting failures. */
export const YOUTUBE_API_TIMEOUT_MS = 10_000;

const BLOCKED_CODES = new Set([101, 150]);
/**
 * A browser that refuses to autoplay leaves the player cued, reporting neither
 * playing nor paused. After this long the frame treats it as paused, so the bar's
 * Play is there to press.
 */
export const YOUTUBE_START_GRACE_MS = 3000;

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads the IFrame API once per page, keeping any callback already installed. */
function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube IFrame API failed to load"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

function plainIframe(
  container: HTMLElement,
  id: string,
  title: string,
  options: MountOptions,
  onReady: () => void
): HTMLIFrameElement {
  const params = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
    mute: options.muted ? "1" : "0",
  });
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }
  const iframe = document.createElement("iframe");
  iframe.src = `${EMBED_HOST}/embed/${encodeURIComponent(id)}?${params.toString()}`;
  iframe.title = title;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.cssText = "width:100%;height:100%;border:0";
  iframe.addEventListener("load", onReady, { once: true });
  container.appendChild(iframe);
  return iframe;
}

/**
 * Mounts the player with its own controls hidden, so the frame can draw the bar
 * (spec 038 FR-041). When the API never arrives, the plain-iframe fallback plays with
 * YouTube's own controls and says so through `onControls("host")`.
 */
export function mountYouTube(
  container: HTMLElement,
  id: string,
  title: string,
  callbacks: HostCallbacks,
  options: MountOptions = DEFAULT_MOUNT
): HostHandle {
  let player: YTPlayer | null = null;
  // `new YT.Player()` returns at once, but its playback methods (playVideo,
  // pauseVideo, mute, getDuration, ...) only exist once the embed reports in, just
  // before onReady. Until then every call on the player would throw.
  let ready = false;
  let fallback: HTMLIFrameElement | null = null;
  let done = false;
  let poll: number | null = null;
  let started = false;
  let grace: number | null = null;
  const live = () => (ready ? player : null);

  const command = (func: string) =>
    fallback?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      EMBED_HOST
    );

  const startFallback = () => {
    if (done || player || fallback) return;
    callbacks.onControls?.("host");
    fallback = plainIframe(container, id, title, options, callbacks.onPlaying);
  };
  const timer = window.setTimeout(startFallback, YOUTUBE_API_TIMEOUT_MS);

  const stopPoll = () => {
    if (poll !== null) window.clearInterval(poll);
    poll = null;
  };
  const startPoll = () => {
    if (poll !== null || !callbacks.onProgress) return;
    poll = window.setInterval(() => {
      const duration = live()?.getDuration() ?? 0;
      if (duration > 0) {
        callbacks.onProgress?.((live()?.getCurrentTime() ?? 0) / duration);
      }
    }, PROGRESS_POLL_MS);
  };

  loadApi()
    .then((YT) => {
      if (done || fallback) return;
      window.clearTimeout(timer);
      callbacks.onControls?.("custom");
      // The API replaces the element it is given; hand it a child, not the container
      // React owns.
      const target = document.createElement("div");
      container.appendChild(target);
      player = new YT.Player(target, {
        host: EMBED_HOST,
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          controls: 0,
          disablekb: 1,
          iv_load_policy: 3,
          mute: options.muted ? 1 : 0,
        },
        events: {
          onReady: () => {
            ready = true;
            if (options.muted) player?.mute();
            player?.playVideo();
            grace = window.setTimeout(() => {
              if (!started && !done) callbacks.onPaused?.();
            }, YOUTUBE_START_GRACE_MS);
          },
          onStateChange: ({ data }) => {
            // Buffering means the start was allowed, just slow: not a refusal.
            if (data === YT_BUFFERING) started = true;
            if (data === YT_PLAYING) {
              started = true;
              startPoll();
              callbacks.onPlaying();
            } else if (data === YT_PAUSED) {
              stopPoll();
              callbacks.onPaused?.();
            } else if (data === YT_ENDED) {
              if (options.loop) {
                live()?.seekTo(0, true);
                live()?.playVideo();
                return;
              }
              stopPoll();
              callbacks.onProgress?.(1);
              callbacks.onEnded?.();
            }
          },
          onError: ({ data }) =>
            BLOCKED_CODES.has(data)
              ? callbacks.onBlocked()
              : callbacks.onRemoved(),
        },
      });
    })
    .catch(() => {
      window.clearTimeout(timer);
      startFallback();
    });

  return {
    play() {
      live()?.playVideo();
      command("playVideo");
    },
    pause() {
      live()?.pauseVideo();
      command("pauseVideo");
    },
    setMuted(muted) {
      if (muted) live()?.mute();
      else live()?.unMute();
      command(muted ? "mute" : "unMute");
    },
    seek(fraction) {
      const duration = live()?.getDuration() ?? 0;
      if (duration > 0) live()?.seekTo(fraction * duration, true);
    },
    destroy() {
      done = true;
      window.clearTimeout(timer);
      if (grace !== null) window.clearTimeout(grace);
      stopPoll();
      player?.destroy();
      container.replaceChildren();
    },
  };
}
