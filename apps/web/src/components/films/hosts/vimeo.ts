import type { HostCallbacks, HostHandle } from "./types";

/**
 * Vimeo, through the player's documented postMessage API. Spec 035 FR-008.
 *
 * The player announces `ready`; we then subscribe to `loaded` (the film can play) and
 * `error`. A `PrivacyError` is Vimeo's refusal to embed here; `NotFoundError` means the
 * film is gone.
 */

const ORIGIN = "https://player.vimeo.com";

interface VimeoMessage {
  event?: string;
  data?: { name?: string };
}

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
  callbacks: HostCallbacks
): HostHandle {
  const iframe = document.createElement("iframe");
  iframe.src = `${ORIGIN}/video/${encodeURIComponent(id)}?autoplay=1&playsinline=1&dnt=1`;
  iframe.title = title;
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.cssText = "width:100%;height:100%;border:0";

  const post = (method: string, value?: string) =>
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
        post("addEventListener", "loaded");
        post("addEventListener", "error");
        break;
      case "loaded":
        callbacks.onPlaying();
        break;
      case "error":
        if (message.data?.name === "PrivacyError") callbacks.onBlocked();
        else if (message.data?.name === "NotFoundError") callbacks.onRemoved();
        break;
    }
  };

  window.addEventListener("message", onMessage);
  container.appendChild(iframe);

  return {
    pause: () => post("pause"),
    destroy() {
      window.removeEventListener("message", onMessage);
      container.replaceChildren();
    },
  };
}
