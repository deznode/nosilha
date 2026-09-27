import { filmsCountWords, type Film } from "@/lib/films";

import { AllFilmsGrid } from "./all-films-grid";
import { CinemaHero } from "./cinema-hero";

/**
 * The films index (3a Cinema band). Spec 038 FR-030 to FR-032.
 *
 * No sort, and facet chips only when one would narrow the list (`AllFilmsGrid`).
 */
export function FilmsCinema({
  films,
  featured,
}: {
  films: readonly Film[];
  featured: Film | null;
}) {
  const rest = films.filter((f) => f.id !== featured?.id);

  return (
    <div>
      {featured ? (
        <CinemaHero film={featured} />
      ) : (
        <h1 className="sr-only">Films</h1>
      )}

      <section
        aria-labelledby="all-films-heading"
        className="mx-auto max-w-[1440px] px-4 pt-[34px] pb-16 md:px-7"
      >
        <div className="mb-[18px] flex items-baseline gap-3">
          <h2
            id="all-films-heading"
            className="text-body m-0 font-serif text-[27px] font-normal"
          >
            All films
          </h2>
          <span className="text-muted text-[13px]">
            {filmsCountWords(films.length)}
          </span>
        </div>
        <AllFilmsGrid films={rest} />
      </section>
    </div>
  );
}
