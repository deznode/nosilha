"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

import {
  UNPLAYABLE_STILL_FILTER,
  canPlay,
  filmHref,
  filmedNear,
  type Film,
} from "@/lib/films";

/** The row's tag: why this film is where it is in the list. */
export function upNextTag(
  film: Film,
  current: Film,
  next: Film | null
): { text: string; tone: "ocean" | "ochre" } | null {
  if (!canPlay(film)) return { text: "Can’t play here", tone: "ochre" };
  if (current.place && film.place?.slug === current.place.slug) {
    return { text: "Same place", tone: "ocean" };
  }
  if (next && film.id === next.id) return { text: "Next", tone: "ocean" };
  return null;
}

/**
 * The theatre's Up next column. Spec 038 FR-043.
 *
 * Same place first, then the other films that can play, then the ones that can't.
 * Choosing one opens it and plays it; the switch decides whether the end of a film
 * counts down to the next.
 */
export function UpNext({
  current,
  films,
  next,
  autoNext,
  onToggleAutoNext,
}: {
  current: Film;
  /** Already in Up next order. */
  films: readonly Film[];
  next: Film | null;
  autoNext: boolean;
  onToggleAutoNext: () => void;
}) {
  return (
    <section aria-labelledby="up-next-heading">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h2
          id="up-next-heading"
          className="text-body m-0 font-serif text-[21px] font-normal"
        >
          Up next
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={autoNext}
          onClick={onToggleAutoNext}
          className="focus-ring text-muted hit-area ml-auto flex items-center gap-2 text-xs [--hit-inset:-13px_-6px]"
        >
          Autoplay
          <span
            aria-hidden
            className={clsx(
              "relative h-[18px] w-8 rounded-full transition-colors duration-200",
              autoNext ? "bg-primary" : "bg-border-strong"
            )}
          >
            <span
              className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-[left] duration-200 ease-(--ease-archive) motion-reduce:transition-none"
              style={{ left: autoNext ? "16px" : "2px" }}
            />
          </span>
        </button>
      </div>

      {films.length === 0 ? (
        <p className="text-muted text-sm">No other films in the archive yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {films.map((film) => {
            const playable = canPlay(film);
            const tag = upNextTag(film, current, next);
            const place = filmedNear(film);
            return (
              <li key={film.id}>
                <Link
                  href={filmHref(film.id, { play: playable })}
                  className="focus-ring hover:bg-background-secondary -mx-2 flex gap-3 rounded-[10px] p-2 transition-colors duration-[180ms]"
                >
                  <div
                    className="relative aspect-video w-32 flex-none overflow-hidden rounded-md bg-[#16130F]"
                    style={
                      playable ? undefined : { filter: UNPLAYABLE_STILL_FILTER }
                    }
                  >
                    {film.thumbnailUrl && (
                      <Image
                        src={film.thumbnailUrl}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                    <span className="text-body font-serif text-[15px] leading-[1.25]">
                      {film.displayTitle}
                    </span>
                    {place && (
                      <span className="text-muted text-xs">{place}</span>
                    )}
                    {tag && (
                      <span
                        className={clsx(
                          "text-[11px]",
                          tag.tone === "ochre"
                            ? "text-sobrado-ochre"
                            : "text-ocean-blue"
                        )}
                      >
                        {tag.text}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
