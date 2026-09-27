"use client";

import { useState } from "react";
import { FilmCard } from "@/components/films/film-card";
import { ChipRow } from "@/components/ui/chip-row";
import {
  FILM_FACETS,
  facetCounts,
  filmFacet,
  type Film,
  type FilmFacetKey,
} from "@/lib/films";

/**
 * The facets worth showing: only those that would narrow the list (count above zero
 * and below the total). Today every facet equals the whole list or nothing, so the
 * row stays hidden until the archive grows one that doesn't. Spec 038 FR-032.
 */
export function narrowingFacets(films: readonly Film[]) {
  const counts = facetCounts(films);
  return FILM_FACETS.filter(
    (f) => f.key !== "all" && counts[f.key] > 0 && counts[f.key] < films.length
  ).map((f) => ({ ...f, count: counts[f.key] }));
}

export function AllFilmsGrid({ films }: { films: readonly Film[] }) {
  const [facet, setFacet] = useState<FilmFacetKey>("all");
  const facets = narrowingFacets(films);
  const shown = films.filter(filmFacet(facet).test);

  return (
    <>
      {facets.length > 0 && (
        <ChipRow
          chips={[
            { key: "all" as const, label: "All films", count: films.length },
            ...facets,
          ]}
          active={facet}
          onSelect={setFacet}
          label="Filter films"
          className="mb-[18px]"
        />
      )}
      {shown.length > 0 && (
        <div className="grid grid-cols-1 gap-x-[18px] gap-y-[26px] md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {shown.map((film) => (
            <FilmCard
              key={film.id}
              film={film}
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
            />
          ))}
        </div>
      )}
    </>
  );
}
