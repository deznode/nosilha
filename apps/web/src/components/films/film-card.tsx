import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

import {
  UNPLAYABLE_STILL_FILTER,
  canPlay,
  filmedNear,
  type Film,
} from "@/lib/films";

/** Three across from 1024, two on a tablet, one on a phone. */
const FILM_CARD_SIZES =
  "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw";

/**
 * The shared film card: a 16:9 still with a play badge in the corner, and the display
 * title and place below. Spec 038 FR-002, `FilmCard.dc.html` (`below` variant).
 *
 * The hover preview is CSS only (`.film-preview-*` in globals.css): fine pointers with
 * motion allowed get a slow push-in and a `Preview · muted` chip, and nothing loads
 * before the hover. A film nothing can play is desaturated and says so instead.
 */
export function FilmCard({
  film,
  href = `/films/${film.id}`,
  sizes = FILM_CARD_SIZES,
  className,
}: {
  film: Film;
  href?: string;
  sizes?: string;
  className?: string;
}) {
  const playable = canPlay(film);
  const place = filmedNear(film);

  return (
    <Link
      href={href}
      className={clsx(
        "group focus-ring flex min-w-0 flex-col gap-2.5 rounded-[10px]",
        className
      )}
    >
      <div className="hover-lift relative aspect-video overflow-hidden rounded-[10px] bg-[#16130F]">
        <div
          className={clsx("absolute inset-0", playable && "film-preview-still")}
          style={playable ? undefined : { filter: UNPLAYABLE_STILL_FILTER }}
        >
          {film.thumbnailUrl ? (
            <Image
              src={film.thumbnailUrl}
              alt=""
              fill
              sizes={sizes}
              className="object-cover"
            />
          ) : (
            // The drawn absence, one frame per theme, chosen in CSS so the server and
            // client render the same markup.
            <>
              <Image
                src="/images/video-placeholder.jpg"
                alt=""
                fill
                sizes={sizes}
                className="object-cover dark:hidden"
              />
              <Image
                src="/images/video-placeholder-dark.jpg"
                alt=""
                fill
                sizes={sizes}
                className="hidden object-cover dark:block"
              />
            </>
          )}
        </div>

        {playable ? (
          <>
            <span
              aria-hidden
              className="film-preview-chip absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] text-[#F6F1E9] backdrop-blur-[6px]"
              style={{ background: "rgba(10,8,6,.6)" }}
            >
              Preview · muted
            </span>
            <span
              aria-hidden
              className="bg-primary absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full"
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,.35)" }}
            >
              <span className="ml-[3px] h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
            </span>
          </>
        ) : (
          <span
            className="absolute right-2.5 bottom-2.5 rounded-full border px-2.5 py-[5px] text-[11px] text-[#F6F1E9]"
            style={{
              background: "rgba(10,8,6,.72)",
              borderColor: "rgba(255,255,255,.22)",
            }}
          >
            Can&rsquo;t play here
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-body font-serif text-[17px] leading-[1.25] text-pretty">
          {film.displayTitle}
        </span>
        {place && <span className="text-muted text-xs">{place}</span>}
      </div>
    </Link>
  );
}
