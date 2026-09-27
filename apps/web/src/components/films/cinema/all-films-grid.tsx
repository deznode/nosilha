"use client";

import { useState } from "react";
import { clsx } from "clsx";

import { FilmCard } from "@/components/films/film-card";
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
        <div
          role="group"
          aria-label="Filter films"
          className="scrollbar-hide mb-[18px] flex gap-1.5 overflow-x-auto"
        >
          {[
            { key: "all" as const, label: "All films", count: films.length },
            ...facets,
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={facet === f.key}
              onClick={() => setFacet(f.key)}
              className={clsx(
                "focus-ring flex flex-none items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[13px] whitespace-nowrap transition-all duration-[180ms] ease-(--ease-archive) motion-reduce:transition-none",
                facet === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "text-body border-border-subtle hover:border-border-strong"
              )}
            >
              {f.label}
              <span className="text-[11px] opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
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
