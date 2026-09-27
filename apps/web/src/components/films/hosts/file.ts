import type { HostCallbacks, HostHandle, MountOptions } from "./types";

/**
 * An archive file, played by the browser's own `<video>`. Spec 038 FR-041.
 *
 * The element carries no native controls: the frame draws the bar. A load error means
 * the file is missing, which is the can't-play state.
 */
export function mountFile(
  container: HTMLElement,
  url: string,
  title: string,
  callbacks: HostCallbacks,
  options: MountOptions
): HostHandle {
  const video = document.createElement("video");
  video.src = url;
  video.title = title;
  video.playsInline = true;
  video.autoplay = true;
  video.muted = options.muted;
  video.loop = options.loop;
  video.style.cssText =
    "width:100%;height:100%;object-fit:contain;background:#000";

  const onPlaying = () => callbacks.onPlaying();
  const onPause = () => {
    if (!video.ended) callbacks.onPaused?.();
  };
  const onEnded = () => callbacks.onEnded?.();
  const onTime = () => {
    if (video.duration > 0) {
      callbacks.onProgress?.(video.currentTime / video.duration);
    }
  };
  const onError = () => callbacks.onRemoved();

  video.addEventListener("playing", onPlaying);
  video.addEventListener("pause", onPause);
  video.addEventListener("ended", onEnded);
  video.addEventListener("timeupdate", onTime);
  video.addEventListener("error", onError);
  container.appendChild(video);
  callbacks.onControls?.("custom");
  // A refused autoplay leaves the film paused with the bar's Play ready.
  video.play()?.catch(() => callbacks.onPaused?.());

  return {
    play: () => void video.play()?.catch(() => callbacks.onPaused?.()),
    pause: () => video.pause(),
    setMuted: (muted) => {
      video.muted = muted;
    },
    seek: (fraction) => {
      if (video.duration > 0) video.currentTime = fraction * video.duration;
    },
    destroy() {
      video.pause();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("error", onError);
      container.replaceChildren();
    },
  };
}
