import { FilmCard } from "./film-card";

import type { Film } from "@/lib/films";

/** A grid of films as cards, each opening the film's own page. Spec 038 FR-002. */
export function FilmGrid({ films }: { films: readonly Film[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-[18px] gap-y-[26px] sm:grid-cols-2 lg:grid-cols-3">
      {films.map((film) => (
        <FilmCard key={film.id} film={film} />
      ))}
    </div>
  );
}
