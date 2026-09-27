import Link from "next/link";

import { FilmCard } from "@/components/films/film-card";
import type { Film } from "@/lib/films";

/** Four films below the photographs, as cards. Spec 038 FR-013. */
export function FilmsBand({ films }: { films: readonly Film[] }) {
  if (films.length === 0) return null;
  return (
    <section aria-labelledby="films-band-heading" className="mt-9">
      <div className="mb-4 flex flex-wrap items-baseline gap-3.5">
        <h2
          id="films-band-heading"
          className="text-body m-0 font-serif text-[27px] font-normal"
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
      <div className="grid grid-cols-2 gap-[18px] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {films.map((film) => (
          <FilmCard
            key={film.id}
            film={film}
            sizes="(max-width: 767px) 50vw, 25vw"
          />
        ))}
      </div>
    </section>
  );
}
