"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { canPlay, type Film } from "@/lib/films";

import { mountFile } from "./hosts/file";
import type {
  ControlsMode,
  HostCallbacks,
  HostHandle,
  MountOptions,
} from "./hosts/types";
import { mountVimeo } from "./hosts/vimeo";
import { mountYouTube } from "./hosts/youtube";

/**
 * One film's playback, whatever hosts it. Spec 038 FR-031, FR-041, T-09.
 *
 * `idle` shows the still and a play button; `loading` has asked the host; `playing`,
 * `paused` and `ended` keep the host mounted so play, seek and replay are instant;
 * `blocked` and `removed` tear it down. A film nothing can play never leaves `idle`,
 * and the frame draws it as can't-play (`unplayable`).
 */
export type FilmHostState =
  "idle" | "loading" | "playing" | "paused" | "ended" | "blocked" | "removed";

/** Only one film plays at a time, across every player on the page. */
let stopActive: (() => void) | null = null;

const LIVE = new Set<FilmHostState>(["loading", "playing", "paused", "ended"]);

export function useFilmHost(
  film: Film,
  { loop = false }: { loop?: boolean } = {}
) {
  const [state, setState] = useState<FilmHostState>("idle");
  const [muted, setMutedState] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controls, setControls] = useState<ControlsMode>("custom");
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HostHandle | null>(null);
  const mutedRef = useRef(muted);

  const playable = canPlay(film);
  const live = LIVE.has(state);
  const engaged = state !== "idle";
  const { playback } = film;
  // Keyed on what plays, not the object, so a parent re-render never restarts it.
  const kind = playback?.kind ?? null;
  const source =
    playback?.kind === "file" ? playback.url : (playback?.id ?? null);
  // The title only labels the iframe; read at mount so a rename never restarts playback.
  const readTitle = useEffectEvent(() => film.displayTitle);

  const stop = useCallback(() => {
    handleRef.current?.pause();
    setState("idle");
  }, []);

  /** Starts the film, stopping whichever other film was playing. */
  const start = useCallback(
    (options?: { muted?: boolean }) => {
      if (!playable) return;
      if (stopActive !== stop) stopActive?.();
      stopActive = stop;
      if (options?.muted !== undefined) {
        mutedRef.current = options.muted;
        setMutedState(options.muted);
      }
      setProgress(0);
      setState("loading");
    },
    [playable, stop]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!live || !container || !kind || !source) return;

    const callbacks: HostCallbacks = {
      onPlaying: () => setState("playing"),
      onPaused: () =>
        setState((s) => (s === "playing" || s === "loading" ? "paused" : s)),
      onEnded: () => setState("ended"),
      onProgress: setProgress,
      onControls: setControls,
      onBlocked: () => setState("blocked"),
      onRemoved: () => setState("removed"),
    };
    const options: MountOptions = { muted: mutedRef.current, loop };
    const title = readTitle();
    const handle =
      kind === "youtube"
        ? mountYouTube(container, source, title, callbacks, options)
        : kind === "vimeo"
          ? mountVimeo(container, source, title, callbacks, options)
          : mountFile(container, source, title, callbacks, options);
    handleRef.current = handle;

    return () => {
      handle.destroy();
      handleRef.current = null;
      setControls("custom");
    };
  }, [live, kind, source, loop]);

  // Activity hides a route without unmounting it. Layout-effect cleanup runs before
  // paint on hide, so the film stops before the next screen shows.
  useLayoutEffect(() => {
    if (!engaged) return;
    return () => {
      handleRef.current?.pause();
      if (stopActive === stop) stopActive = null;
      setState("idle");
    };
  }, [engaged, stop]);

  const play = useCallback(() => {
    if (!handleRef.current) return;
    handleRef.current.play();
    setState("playing");
  }, []);

  const pause = useCallback(() => {
    handleRef.current?.pause();
    setState((s) => (s === "playing" || s === "loading" ? "paused" : s));
  }, []);

  const replay = useCallback(() => {
    if (!handleRef.current) return;
    handleRef.current.seek(0);
    handleRef.current.play();
    setProgress(0);
    setState("playing");
  }, []);

  const toggle = useCallback(() => {
    if (state === "playing" || state === "loading") pause();
    else if (state === "paused") play();
    else if (state === "ended") replay();
    else if (state === "idle") start();
  }, [state, pause, play, replay, start]);

  const setMuted = useCallback((next: boolean) => {
    mutedRef.current = next;
    setMutedState(next);
    handleRef.current?.setMuted(next);
  }, []);

  const seek = useCallback((fraction: number) => {
    const clamped = Math.min(0.99, Math.max(0, fraction));
    handleRef.current?.seek(clamped);
    setProgress(clamped);
  }, []);

  return {
    state,
    /** True for a film nothing can play: the frame shows can't-play from the start. */
    unplayable: !playable || state === "blocked" || state === "removed",
    live,
    muted,
    progress,
    controls,
    containerRef,
    start,
    play,
    pause,
    toggle,
    replay,
    setMuted,
    seek,
  };
}
