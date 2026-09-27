"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { filmedNear, type Film } from "@/lib/films";

import { PlayButton } from "../theatre/theatre-player";
import { useFilmHost } from "../use-film-host";

/**
 * Whether the hero may start on its own: a desktop-width screen, no Save-Data, and
 * motion allowed. Anything else waits for a click. Spec 038 FR-031.
 */
export function heroMayAutoplay(win: Window = window): boolean {
  const connection = (
    win.navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return (
    win.matchMedia("(min-width: 768px)").matches &&
    !win.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    connection?.saveData !== true
  );
}

/**
 * The films index's cinema band. Spec 038 FR-030, FR-031.
 *
 * The featured film plays muted and on a loop behind the title when the autoplay rule
 * allows; the host's iframe loads only then. Otherwise the still waits under a play
 * button. "Watch with sound" goes to the film page and plays it there.
 */
export function CinemaHero({ film }: { film: Film }) {
  const {
    start,
    state,
    live,
    muted,
    progress,
    unplayable,
    containerRef,
    play,
    pause,
    setMuted,
  } = useFilmHost(film, { loop: true, muted: true });
  const running = state === "playing" || state === "loading";

  // Decided on arrival and on every Activity restore (which stopped the film).
  useEffect(() => {
    if (heroMayAutoplay()) start({ muted: true });
  }, [start]);

  const place = filmedNear(film);
  const eyebrow = running
    ? muted
      ? "Playing muted"
      : "Playing"
    : "Film of the month";

  return (
    <section
      aria-label="Featured film"
      className="bg-stage [container-type:size] relative h-[calc((100dvh-var(--chrome-top-bar-height))*0.62)] overflow-hidden md:h-[calc((100dvh-var(--chrome-top-bar-height))*0.84)]"
    >
      {film.thumbnailUrl && (
        <Image
          src={film.thumbnailUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {live && (
        // The 16:9 player scaled to cover the band, and inert: the band is not a
        // player, its buttons are.
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-video w-[max(100cqw,calc(100cqh*16/9))] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
          style={{ opacity: state === "playing" ? 1 : 0 }}
        >
          <div ref={containerRef} className="absolute inset-0" tabIndex={-1} />
        </div>
      )}

      <div aria-hidden className="scrim-hero absolute inset-0" />

      {!running && !unplayable && (
        <PlayButton
          label={`Play ${film.displayTitle}, muted`}
          onClick={() => (state === "paused" ? play() : start({ muted: true }))}
          className="top-[42%]"
        />
      )}

      {running && (
        // Moving content that starts on its own must be stoppable (WCAG 2.2.2).
        <div className="absolute top-4 right-4 flex gap-2 md:right-7">
          <button
            type="button"
            onClick={pause}
            className="focus-ring rounded-full border border-white/28 bg-[rgba(12,10,8,.55)] px-4 py-2.5 text-[13px] text-[#F6F1E9] backdrop-blur-[8px] transition-colors hover:bg-[rgba(12,10,8,.75)]"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="focus-ring rounded-full border border-white/28 bg-[rgba(12,10,8,.55)] px-4 py-2.5 text-[13px] text-[#F6F1E9] backdrop-blur-[8px] transition-colors hover:bg-[rgba(12,10,8,.75)]"
          >
            {muted ? "Sound off · Turn on" : "Sound on · Mute"}
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 flex max-w-[820px] flex-col gap-2.5 px-4 pb-[30px] text-[#F6F1E9] md:px-7">
        <span
          aria-live="polite"
          className="flex items-center gap-2 text-[11px] tracking-[.18em] uppercase opacity-90"
        >
          {eyebrow}
        </span>
        <h1 className="m-0 font-serif text-[32px] leading-[1.04] font-normal tracking-[-0.02em] text-pretty md:text-[58px]">
          {film.displayTitle}
        </h1>
        {place && <span className="text-sm opacity-[.88]">{place}</span>}
        {film.description && (
          <span className="max-w-[56ch] text-[15px] leading-normal opacity-90">
            {film.description}
          </span>
        )}
        <div className="mt-1.5 flex flex-wrap gap-2">
          <Link
            href={`/films/${film.id}?play=1`}
            className="focus-ring rounded-lg bg-[#F6F1E9] px-5 py-3 text-sm font-medium text-[#16130F] transition-opacity hover:opacity-[.92]"
          >
            Watch with sound
          </Link>
          <Link
            href={`/films/${film.id}`}
            className="focus-ring rounded-lg border border-white/30 bg-white/12 px-5 py-3 text-sm text-[#F6F1E9] transition-colors hover:bg-white/20"
          >
            Film page
          </Link>
        </div>
      </div>

      {running && (
        <div
          aria-hidden
          className="bg-primary absolute bottom-0 left-0 h-[3px]"
          style={{ width: `${(progress * 100).toFixed(1)}%` }}
        />
      )}
    </section>
  );
}
