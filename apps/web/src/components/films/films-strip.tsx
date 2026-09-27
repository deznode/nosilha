import Link from "next/link";
import { clsx } from "clsx";

import { promotableFilms, type Film } from "@/lib/films";

import { FilmCard } from "./film-card";

/** How many films the home strip shows. */
const STRIP_SIZE = 3;

/**
 * The films on the archive's front door (5a Hover preview). Spec 038 FR-050.
 *
 * Three cards across on a desktop. On a phone, a row that snaps card by card and
 * bleeds to the screen edges; the home page's gutter is 22px, not the handoff's 16.
 * The preview runs on hover only (FilmCard), so a phone or an idle visitor loads
 * nothing extra.
 */
export function FilmsStrip({ films }: { films: Film[] }) {
  // A promotional slot: a film flagged as showing an unvouched-for person is left out
  // (spec 034 FR-022). With nothing showable the strip is absent, as with no films.
  const shown = promotableFilms(films).slice(0, STRIP_SIZE);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="films-strip-heading" className="mb-14">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-3.5">
        <h2
          id="films-strip-heading"
          className="text-body m-0 font-serif text-[30px] font-normal tracking-[-0.015em]"
        >
          Films
        </h2>
        <Link
          href="/films"
          className="text-ocean-blue hover:text-brand ml-auto text-[13px]"
        >
          See all films →
        </Link>
      </div>
      <p className="text-muted mt-0 mb-5 text-sm">
        Footage of Brava contributed to the archive.
      </p>
      <div
        className={clsx(
          "scrollbar-hide -mx-[22px] flex snap-x snap-mandatory scroll-px-[22px] gap-3.5 overflow-x-auto px-[22px] pb-1",
          "md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0"
        )}
      >
        {shown.map((film) => (
          <FilmCard
            key={film.id}
            film={film}
            className="w-[80%] flex-none snap-start md:w-auto"
            sizes="(max-width: 767px) 80vw, 33vw"
          />
        ))}
      </div>
    </section>
  );
}
