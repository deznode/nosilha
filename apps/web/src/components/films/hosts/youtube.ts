import type { HostCallbacks, HostHandle } from "./types";

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
  pauseVideo(): void;
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
      playerVars: Record<string, number>;
      events: {
        onReady: () => void;
        onError: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
}

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
  onReady: () => void
): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = `${EMBED_HOST}/embed/${encodeURIComponent(id)}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`;
  iframe.title = title;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.cssText = "width:100%;height:100%;border:0";
  iframe.addEventListener("load", onReady, { once: true });
  container.appendChild(iframe);
  return iframe;
}

export function mountYouTube(
  container: HTMLElement,
  id: string,
  title: string,
  callbacks: HostCallbacks
): HostHandle {
  let player: YTPlayer | null = null;
  let fallback: HTMLIFrameElement | null = null;
  let done = false;

  const useFallback = () => {
    if (done || player || fallback) return;
    fallback = plainIframe(container, id, title, callbacks.onPlaying);
  };
  const timer = window.setTimeout(useFallback, YOUTUBE_API_TIMEOUT_MS);

  loadApi()
    .then((YT) => {
      if (done || fallback) return;
      window.clearTimeout(timer);
      // The API replaces the element it is given; hand it a child, not the container
      // React owns.
      const target = document.createElement("div");
      container.appendChild(target);
      player = new YT.Player(target, {
        host: EMBED_HOST,
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: callbacks.onPlaying,
          onError: ({ data }) =>
            BLOCKED_CODES.has(data)
              ? callbacks.onBlocked()
              : callbacks.onRemoved(),
        },
      });
    })
    .catch(() => {
      window.clearTimeout(timer);
      useFallback();
    });

  return {
    pause() {
      player?.pauseVideo();
      fallback?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
        EMBED_HOST
      );
    },
    destroy() {
      done = true;
      window.clearTimeout(timer);
      player?.destroy();
      container.replaceChildren();
    },
  };
}
