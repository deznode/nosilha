"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { ShareArrivalLine } from "@/components/share/share-arrival";
import { ShareAction } from "@/components/ui/archive-actions";
import { photographsHref } from "@/lib/archive-photographs";
import {
  canPlay,
  filmEyebrow,
  filmHelpLine,
  filmHref,
  filmSourceLine,
  filmedNear,
  upNext,
  type Film,
} from "@/lib/films";
import { filmArrivalLine, filmShareText } from "@/lib/share-copy";

import { TheatrePlayer } from "./theatre-player";
import { UpNext } from "./up-next";

/**
 * The film page (4a Theatre). Spec 038 FR-040 to FR-043.
 *
 * A full-width stage band with the player centred and sized to fit the screen, then
 * the record and Up next side by side. Rows the record can't fill are left out.
 */
export function FilmTheatre({
  film,
  films,
  hasPlacePhotos,
}: {
  film: Film;
  /**
   * Every film in the archive (the current one is skipped if present), or null when
   * the list could not be fetched: Up next is then left out rather than claiming
   * there are no other films.
   */
  films: readonly Film[] | null;
  /** Whether the film's settlement has photographs to link to. */
  hasPlacePhotos: boolean;
}) {
  const router = useRouter();
  const [autoNext, setAutoNext] = useState(true);
  const ordered = films === null ? null : upNext(film, films);
  const next = ordered?.find(canPlay) ?? null;
  const source = filmSourceLine(film);
  const arrival = filmArrivalLine(film, films);

  const playNext = useCallback(
    (target: Film) => router.push(filmHref(target.id, { play: true })),
    [router]
  );

  return (
    <div className="pb-14 md:pb-[72px]">
      <ShareArrivalLine moment="film" {...arrival} />
      <div className="md:bg-stage bg-[#0A0908] md:p-7">
        <TheatrePlayer
          key={film.id}
          film={film}
          next={next}
          lastFilm={ordered !== null && next === null}
          autoNext={autoNext}
          onPlayNext={playNext}
          className="md:mx-auto md:max-w-[min(1280px,calc((100dvh-var(--chrome-top-bar-height)-64px)*16/9))] md:rounded-[10px] md:shadow-[0_30px_80px_rgba(0,0,0,.4)]"
        />
      </div>

      <div className="mx-auto grid max-w-[1236px] grid-cols-1 px-4 md:grid-cols-[minmax(0,1fr)_340px] md:gap-x-14 md:px-7">
        <div className="flex min-w-0 flex-col gap-3.5 pt-5 md:pt-[30px]">
          <Link
            href="/films"
            className="text-muted hover:text-body hit-area self-start text-[13px] transition-colors"
          >
            ← All films
          </Link>
          <span className="text-ocean-blue text-[10px] tracking-[.18em] uppercase">
            {filmEyebrow(film)}
          </span>
          <h1 className="text-body m-0 font-serif text-[30px] leading-[1.08] font-normal tracking-[-0.02em] text-pretty md:text-[42px]">
            {film.displayTitle}
          </h1>
          {film.place && (
            <div className="flex flex-wrap items-baseline gap-3.5">
              <span className="text-body text-[15px]">{filmedNear(film)}</span>
              {hasPlacePhotos && (
                <Link
                  href={photographsHref(film.place.slug)}
                  className="text-ocean-blue hover:text-brand text-[13px]"
                >
                  Photographs from here →
                </Link>
              )}
            </div>
          )}
          {film.description && (
            <p className="text-body m-0 max-w-[62ch] text-base leading-[1.6] text-pretty">
              {film.description}
            </p>
          )}
          {source && (
            <div className="text-muted font-mono text-[11.5px] leading-normal break-words">
              {source}
            </div>
          )}
          <div className="border-border-subtle mt-1 flex flex-wrap items-baseline gap-3 border-t pt-3.5">
            <span className="text-muted text-[13px]">{filmHelpLine(film)}</span>
            <IdentifyQuestion
              contentType="media"
              contentId={film.id}
              mediaId={film.id}
              field={film.place ? "filmmaker" : "placeId"}
              pageTitle={film.displayTitle}
              variant="link"
            >
              Help complete this record
            </IdentifyQuestion>
            <ShareAction
              title={film.displayTitle}
              text={filmShareText(film)}
              moment="film"
              itemId={film.id}
              className="hit-area focus-ring"
            />
          </div>
        </div>

        {ordered !== null && (
          <div className="min-w-0 pt-[30px] md:pt-[34px]">
            <UpNext
              current={film}
              films={ordered}
              next={next}
              autoNext={autoNext}
              onToggleAutoNext={() => setAutoNext((on) => !on)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
