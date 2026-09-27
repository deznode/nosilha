import {
  DEFAULT_MOUNT,
  type HostCallbacks,
  type HostHandle,
  type MountOptions,
} from "./types";

/**
 * Vimeo, through the player's documented postMessage API. Spec 035 FR-008.
 *
 * The player announces `ready`; we then subscribe to `loaded` (the film can play) and
 * `error`. A `PrivacyError` or `PasswordError` is Vimeo's refusal to embed here;
 * `NotFoundError`, or any other error that stops the player loading, means the film
 * cannot be reached.
 */

const ORIGIN = "https://player.vimeo.com";
/** How long after `loaded` a film that hasn't started counts as paused. */
export const VIMEO_START_GRACE_MS = 3000;

interface VimeoMessage {
  event?: string;
  /**
   * `method: "ready"` marks an error that stopped the player from loading at all.
   * `timeupdate` carries `percent` (0–1) and `duration` in seconds.
   */
  data?: {
    name?: string;
    method?: string;
    percent?: number;
    duration?: number;
  };
}

/** Vimeo's refusals to play here: a private or password-protected film. */
const BLOCKED_ERRORS = new Set(["PrivacyError", "PasswordError"]);

function parse(data: unknown): VimeoMessage | null {
  if (typeof data === "object" && data !== null) return data as VimeoMessage;
  if (typeof data !== "string") return null;
  try {
    return JSON.parse(data) as VimeoMessage;
  } catch {
    return null;
  }
}

export function mountVimeo(
  container: HTMLElement,
  id: string,
  title: string,
  callbacks: HostCallbacks,
  options: MountOptions = DEFAULT_MOUNT
): HostHandle {
  const params = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    dnt: "1",
    // Hides Vimeo's bar on plans that allow it; the frame draws its own either way.
    controls: "0",
    muted: options.muted ? "1" : "0",
    loop: options.loop ? "1" : "0",
  });
  const iframe = document.createElement("iframe");
  iframe.src = `${ORIGIN}/video/${encodeURIComponent(id)}?${params.toString()}`;
  iframe.title = title;
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.cssText = "width:100%;height:100%;border:0";

  let duration = 0;
  let started = false;
  let grace: number | null = null;

  const post = (method: string, value?: string | number | boolean) =>
    iframe.contentWindow?.postMessage(
      JSON.stringify(value === undefined ? { method } : { method, value }),
      ORIGIN
    );

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== ORIGIN || event.source !== iframe.contentWindow) {
      return;
    }
    const message = parse(event.data);
    switch (message?.event) {
      case "ready":
        for (const name of [
          "loaded",
          "error",
          "play",
          "pause",
          "ended",
          "timeupdate",
        ]) {
          post("addEventListener", name);
        }
        callbacks.onControls?.("custom");
        break;
      case "loaded":
        // Loaded is not playing: a refused autoplay leaves it here, so after a grace
        // period the frame shows Play rather than a Pause that does nothing.
        grace = window.setTimeout(() => {
          if (!started) callbacks.onPaused?.();
        }, VIMEO_START_GRACE_MS);
        break;
      case "play":
        started = true;
        callbacks.onPlaying();
        break;
      case "pause":
        callbacks.onPaused?.();
        break;
      case "ended":
        callbacks.onProgress?.(1);
        callbacks.onEnded?.();
        break;
      case "timeupdate":
        if (message.data?.duration) duration = message.data.duration;
        if (typeof message.data?.percent === "number") {
          callbacks.onProgress?.(message.data.percent);
        }
        break;
      case "error": {
        const name = message.data?.name ?? "";
        if (BLOCKED_ERRORS.has(name)) callbacks.onBlocked();
        // Any other error that kept the player from loading would otherwise leave the
        // frame on "Loading" forever, covering Vimeo's own message.
        else if (name === "NotFoundError" || message.data?.method === "ready") {
          callbacks.onRemoved();
        }
        break;
      }
    }
  };

  window.addEventListener("message", onMessage);
  container.appendChild(iframe);

  return {
    play: () => post("play"),
    pause: () => post("pause"),
    setMuted: (muted) => post("setMuted", muted),
    seek: (fraction) => {
      if (duration > 0) post("setCurrentTime", fraction * duration);
    },
    destroy() {
      if (grace !== null) window.clearTimeout(grace);
      window.removeEventListener("message", onMessage);
      container.replaceChildren();
    },
  };
}
