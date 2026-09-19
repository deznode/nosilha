"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";

import { filmTitleLabel, type Film } from "@/lib/films";

import { mountVimeo } from "./hosts/vimeo";
import { mountYouTube } from "./hosts/youtube";
import type { HostCallbacks, HostHandle } from "./hosts/types";
import {
  FRAME_DARK,
  PlayerStateFrame,
  type PlayerFrameState,
} from "./player-state-frame";

/**
 * A film, played in place. Spec 035 FR-008.
 *
 * The frame reserves its 16:9 box before anything loads and keeps it in every state,
 * so nothing below it moves. It starts idle — the thumbnail, if one exists, under a play
 * circle — and only reaches out to the host when the viewer asks. From there the host's
 * own player says whether the film plays, is refused here, or is gone.
 */

type PlayerState = "idle" | "playing" | PlayerFrameState;

/** Only one film plays at a time, across every player on the page. */
let stopActive: (() => void) | null = null;

const SIZES = {
  hero: { circle: 58, glyph: 16 },
  page: { circle: 62, glyph: 17 },
} as const;

export function FilmPlayer({
  film,
  size,
  slot,
  priority,
}: {
  film: Film;
  size: keyof typeof SIZES;
  /** Laid over the frame while idle or loading — the film page's source pill. */
  slot?: ReactNode;
  /** Loads the thumbnail eagerly when the player is above the fold. */
  priority?: boolean;
}) {
  const [state, setState] = useState<PlayerState>("idle");
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HostHandle | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engaged = state !== "idle";
  // A host that has said the film cannot play is torn down; its frame stays.
  const live = state === "loading" || state === "playing";
  const { playback } = film;
  const title = filmTitleLabel(film);
  const hostLabel = film.source ?? "its host";

  const stop = useCallback(() => setState("idle"), []);

  const play = () => {
    if (!playback) return;
    if (stopActive !== stop) stopActive?.();
    stopActive = stop;
    setState("loading");
  };

  // Embedded hosts mount into a plain div React never renders children into. Keyed on
  // the host and id, not the object, so a parent re-render never restarts the film.
  const embedKind = playback && playback.kind !== "file" ? playback.kind : null;
  const embedId = playback && playback.kind !== "file" ? playback.id : null;

  useEffect(() => {
    if (!live || !hostRef.current || !embedKind || !embedId) return;

    const callbacks: HostCallbacks = {
      onPlaying: () => setState((s) => (s === "loading" ? "playing" : s)),
      onBlocked: () => setState("blocked"),
      onRemoved: () => setState("removed"),
    };
    const mount = embedKind === "youtube" ? mountYouTube : mountVimeo;
    const handle = mount(hostRef.current, embedId, title, callbacks);
    handleRef.current = handle;

    return () => {
      handle.destroy();
      handleRef.current = null;
    };
  }, [live, embedKind, embedId, title]);

  // Activity hides a route without unmounting it. Layout-effect cleanup runs before
  // paint on hide, so the film stops before the next screen shows — the same pattern
  // as `YouTubeFacade`.
  useLayoutEffect(() => {
    if (!engaged) return;
    const video = videoRef.current;
    return () => {
      handleRef.current?.pause();
      video?.pause();
      if (stopActive === stop) stopActive = null;
      setState("idle");
    };
  }, [engaged, stop]);

  const { circle, glyph } = SIZES[size];
  const frameState: PlayerFrameState | null =
    state === "idle" || state === "playing" ? null : state;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        borderRadius: "12px",
        background: FRAME_DARK,
      }}
    >
      {live && playback?.kind === "file" && (
        <video
          ref={videoRef}
          src={playback.url}
          controls
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full"
          onCanPlay={() => setState((s) => (s === "loading" ? "playing" : s))}
          onError={() => setState("removed")}
        />
      )}
      {live && embedKind && <div ref={hostRef} className="absolute inset-0" />}

      {state === "idle" && (
        <>
          {film.thumbnailUrl && (
            <Image
              src={film.thumbnailUrl}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-cover"
            />
          )}
          <button
            type="button"
            onClick={play}
            disabled={!playback}
            aria-label={
              playback ? `Play ${title}` : `${title} cannot be played here`
            }
            className="focus-ring absolute inset-0 flex cursor-pointer items-center justify-center disabled:cursor-default"
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: `${circle}px`,
                height: `${circle}px`,
                border: "1.5px solid rgba(255,255,255,.55)",
                color: "rgba(255,255,255,.85)",
                fontSize: `${glyph}px`,
              }}
            >
              ▶
            </span>
          </button>
        </>
      )}

      {frameState && (
        <PlayerStateFrame
          state={frameState}
          hostLabel={hostLabel}
          watchUrl={film.watchUrl}
        />
      )}

      {(state === "idle" || state === "loading") && slot}
    </div>
  );
}
