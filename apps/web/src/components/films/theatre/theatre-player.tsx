"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

import type { Film } from "@/lib/films";

import { useFilmHost } from "../use-film-host";

/** Whether the browser can put an element in full screen (not an iPhone, say). */
const noSubscription = () => () => {};
const canFullScreen = () => document.fullscreenEnabled === true;
const cannotFullScreenOnServer = () => false;

/** Where "Send a copy" goes: the film form of the media contribution flow. */
export const SEND_A_COPY_HREF = "/contribute/media?kind=film";

export const COUNTDOWN_SECONDS = 5;

const BAR_BUTTON =
  "focus-ring rounded-md bg-white/14 px-3 py-[7px] text-xs text-[#F6F1E9] transition-colors hover:bg-white/24";
const OUTLINE_BUTTON =
  "focus-ring rounded-lg border border-white/40 bg-transparent px-4 py-[9px] text-[13px] text-[#F6F1E9] transition-colors hover:bg-white/10";

/**
 * The theatre's player. Spec 038 FR-041.
 *
 * One 16:9 frame in every state: idle (solid play button), playing (the frame's own
 * bar; the host's controls are hidden), can't play (no play button, a way to help),
 * and ended (Up next, counting down when autoplay is on). When the host API is
 * unavailable, the plain iframe shows the host's own controls and the bar stands down.
 * The bar adds a full screen control where the browser supports one, since the
 * host's own (and its `f` key) are hidden.
 */
export function TheatrePlayer({
  film,
  next,
  lastFilm,
  autoNext,
  onPlayNext,
  className,
}: {
  film: Film;
  /** The film the countdown opens: the first playable in Up next order. */
  next: Film | null;
  /** True when the archive's films are known and none is left to play. */
  lastFilm: boolean;
  autoNext: boolean;
  onPlayNext: (film: Film) => void;
  className?: string;
}) {
  const {
    state,
    start,
    toggle,
    live,
    unplayable,
    controls,
    containerRef,
    muted,
    progress,
    seek,
    setMuted,
    replay,
  } = useFilmHost(film);
  const [countdown, setCountdown] = useState(0);

  // `?play=1`: play with sound on arrival. Client navigation keeps the user's
  // activation, so the browser allows it. The live URL is read every time the page
  // shows, not a prop or a ref: Next re-shows a recently visited film page (Activity)
  // rather than mounting it again, so a new visit asking to play must still start it.
  // The parameter is dropped at once, so Back and a reload don't start it again.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("play") !== "1") return;
    url.searchParams.delete("play");
    window.history.replaceState(null, "", url.pathname + url.search);
    start();
  }, [start]);

  // Full screen on the frame itself, so the bar, Space and Up next stay in it.
  const frameRef = useRef<HTMLDivElement>(null);
  const fullScreenSupported = useSyncExternalStore(
    noSubscription,
    canFullScreen,
    cannotFullScreenOnServer
  );
  const [fullScreen, setFullScreen] = useState(false);
  useEffect(() => {
    const onChange = () =>
      setFullScreen(
        frameRef.current !== null &&
          document.fullscreenElement === frameRef.current
      );
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  // Leaving the page (an Activity hide included) leaves full screen with it.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    return () => {
      if (frame && document.fullscreenElement === frame) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);
  const toggleFullScreen = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !document.fullscreenEnabled) return;
    if (document.fullscreenElement === frame) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void frame.requestFullscreen().catch(() => {});
    }
  }, []);

  // Ended with autoplay on: count down to the next film.
  const ended = state === "ended";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the count restarts when the host reports the end, which only arrives through state
    setCountdown(ended && autoNext && next ? COUNTDOWN_SECONDS : 0);
  }, [ended, autoNext, next]);

  useEffect(() => {
    if (countdown <= 0 || !next) return;
    const timer = window.setTimeout(() => {
      if (countdown === 1) onPlayNext(next);
      else setCountdown(countdown - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, next, onPlayNext]);

  // Space plays and pauses a film that is under way, unless a control has focus (it
  // would click it too); F toggles full screen. Before the film plays (idle, or still
  // loading, when the host can't take a command yet) Space scrolls the page as usual.
  const underway = state === "playing" || state === "paused";
  useEffect(() => {
    if (!underway) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select, [contenteditable]")) {
        return;
      }
      if (event.key === "f" || event.key === "F") {
        toggleFullScreen();
        return;
      }
      if (event.key !== " ") return;
      if (target?.closest?.("button, a, [role=slider]")) return;
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [underway, toggle, toggleFullScreen]);

  const showStill = !live || state === "loading";
  const idle = state === "idle" && !unplayable;
  const barOn =
    (state === "playing" || state === "paused") && controls === "custom";

  return (
    <div
      ref={frameRef}
      className={clsx(
        "relative aspect-video w-full overflow-hidden bg-[#0A0908] [&:fullscreen]:rounded-none",
        className
      )}
    >
      {live && <div ref={containerRef} className="absolute inset-0" />}

      {showStill && film.thumbnailUrl && (
        <div
          className="absolute inset-0 transition-[filter] duration-300"
          style={{
            filter: unplayable ? "grayscale(.85) brightness(.45)" : "none",
          }}
        >
          <Image
            src={film.thumbnailUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      )}

      {idle && (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(10,8,6,.5), rgba(10,8,6,.2) 60%)",
            }}
          />
          <PlayButton
            label={`Play ${film.displayTitle}`}
            onClick={() => start()}
            className="top-1/2"
          />
        </>
      )}

      {state === "loading" && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-[rgba(10,8,6,.35)] text-xs text-[#F6F1E9]/80"
        >
          Loading from {film.source ?? "its host"}
        </div>
      )}

      {unplayable && <CantPlay film={film} blocked={state === "blocked"} />}

      {barOn && (
        <>
          {muted && (
            <span className="absolute top-3 right-3 rounded-full bg-[rgba(10,8,6,.6)] px-3 py-1.5 text-xs text-[#F6F1E9]">
              Sound off
            </span>
          )}
          <div
            className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-3.5 pt-[30px] pb-3 text-[#F6F1E9]"
            style={{
              background:
                "linear-gradient(to top, rgba(10,8,6,.78), transparent)",
            }}
          >
            <button type="button" onClick={toggle} className={BAR_BUTTON}>
              {state === "playing" ? "Pause" : "Play"}
            </button>
            <SeekTrack progress={progress} onSeek={seek} />
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className={BAR_BUTTON}
            >
              {muted ? "Sound on" : "Mute"}
            </button>
            {fullScreenSupported && (
              <button
                type="button"
                onClick={toggleFullScreen}
                aria-pressed={fullScreen}
                className={BAR_BUTTON}
              >
                {fullScreen ? "Exit full screen" : "Full screen"}
              </button>
            )}
          </div>
        </>
      )}

      {ended && (
        <EndedOverlay
          next={next}
          lastFilm={lastFilm}
          countdown={countdown}
          onPlayNext={() => next && onPlayNext(next)}
          onCancel={() => setCountdown(0)}
          onReplay={() => {
            setCountdown(0);
            replay();
          }}
        />
      )}
    </div>
  );
}

/** The solid 84px play button shared by the theatre and the cinema hero. */
export function PlayButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={clsx(
        "focus-ring absolute left-1/2 flex h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F6F1E9] transition-transform duration-[220ms] ease-(--ease-archive) hover:scale-[1.06] motion-reduce:transition-none",
        className
      )}
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}
    >
      <span className="ml-1.5 h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-[#16130F]" />
    </button>
  );
}

function SeekTrack({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (fraction: number) => void;
}) {
  const percent = Math.round(progress * 100);
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width > 0) onSeek((event.clientX - rect.left) / rect.width);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") onSeek(progress + 0.05);
        else if (event.key === "ArrowLeft") onSeek(progress - 0.05);
      }}
      className="focus-ring flex h-4 flex-1 cursor-pointer items-center"
    >
      <div className="relative h-1 w-full rounded-full bg-white/25">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#F6F1E9]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CantPlay({ film, blocked }: { film: Film; blocked: boolean }) {
  const host = film.source ?? "its host";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-5 text-center text-[#F6F1E9]">
      <span className="text-[11px] tracking-[.18em] text-[#E3C39E] uppercase">
        Can&rsquo;t play here
      </span>
      <span className="max-w-[26ch] font-serif text-[22px] leading-[1.2]">
        {blocked
          ? `${host} won’t let this film play here`
          : "The source file is missing from the archive"}
      </span>
      <span className="max-w-[44ch] text-[13px] leading-normal opacity-[.82]">
        {blocked
          ? "The record stays. You can still watch it on its host."
          : "The record stays. If you have a copy of this film, the curators would like to hear from you."}
      </span>
      {blocked && film.watchUrl ? (
        <a
          href={film.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(OUTLINE_BUTTON, "mt-1")}
        >
          Watch on {host}
        </a>
      ) : (
        <Link href={SEND_A_COPY_HREF} className={clsx(OUTLINE_BUTTON, "mt-1")}>
          Send a copy
        </Link>
      )}
    </div>
  );
}

function EndedOverlay({
  next,
  lastFilm,
  countdown,
  onPlayNext,
  onCancel,
  onReplay,
}: {
  next: Film | null;
  /** Say "That was the last film" only when the list is known to be exhausted. */
  lastFilm: boolean;
  countdown: number;
  onPlayNext: () => void;
  onCancel: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,8,6,.84)] p-5 text-[#F6F1E9]">
      <div className="flex max-w-[560px] flex-wrap items-center justify-center gap-[18px]">
        {next?.thumbnailUrl && (
          <div className="relative hidden aspect-video w-[200px] flex-none overflow-hidden rounded-lg md:block">
            <Image
              src={next.thumbnailUrl}
              alt=""
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-2">
          {(next || lastFilm) && (
            <>
              <span
                aria-live="polite"
                className="text-[11px] tracking-[.16em] uppercase opacity-[.78]"
              >
                {countdown > 0 ? `Up next in ${countdown}` : "Up next"}
              </span>
              <span className="font-serif text-[22px] leading-[1.2]">
                {next ? next.displayTitle : "That was the last film"}
              </span>
            </>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            {next && (
              <button
                type="button"
                onClick={onPlayNext}
                className="focus-ring rounded-lg bg-[#F6F1E9] px-4 py-[9px] text-[13px] font-medium text-[#16130F]"
              >
                Play now
              </button>
            )}
            {countdown > 0 && (
              <button
                type="button"
                onClick={onCancel}
                className={OUTLINE_BUTTON}
              >
                Cancel
              </button>
            )}
            <button type="button" onClick={onReplay} className={OUTLINE_BUTTON}>
              Watch again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
