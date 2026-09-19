"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/catalyst-ui/input";
import { showingLine } from "@/components/photographs/photographs-copy";
import { FilterChip } from "@/components/ui/filter-chip";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  FILM_FACETS,
  FILM_SORT_OPTIONS,
  FILMS_PAGE_SIZE,
  ONE_PAGE_LINE,
  facetCounts,
  filmFacet,
  filmsIntro,
  pickFeatured,
  searchFilms,
  sortFilms,
  type Film,
  type FilmFacetKey,
  type FilmSortKey,
} from "@/lib/films";
import { CountedHeading, FilmsPanel } from "./film-chrome";
import { FilmGrid } from "./film-grid";
import { FilmHero } from "./film-hero";

/**
 * `/films`. Spec 035 FR-002 – FR-004, artboard 2a.
 *
 * A rail that filters by what the archive can answer, a featured film that plays on
 * arrival, and a grid in which every card opens the film's own page. The rail's counts
 * are over the whole archive; the grid shows one facet of it.
 */
export function FilmsIndex({ films }: { films: Film[] }) {
  const [query, setQuery] = useState("");
  const [facetKey, setFacetKey] = useState<FilmFacetKey>("all");
  const [sort, setSort] = useState<FilmSortKey>("title");
  const [page, setPage] = useState(0);

  const counts = useMemo(() => facetCounts(films), [films]);
  const matches = useMemo(
    () =>
      sortFilms(
        searchFilms(films.filter(filmFacet(facetKey).test), query),
        sort
      ),
    [films, facetKey, query, sort]
  );
  const featured = useMemo(() => pickFeatured(films, sort), [films, sort]);

  const totalPages = Math.ceil(matches.length / FILMS_PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const pageFilms = useMemo(
    () =>
      matches.slice(
        currentPage * FILMS_PAGE_SIZE,
        (currentPage + 1) * FILMS_PAGE_SIZE
      ),
    [matches, currentPage]
  );

  // While searching, the hero's film stays in the results — otherwise a query that
  // matches only the featured film would leave an empty grid beneath it.
  const searching = query.trim() !== "";
  const gridFeaturedId = searching ? null : (featured?.id ?? null);

  // The sentence belongs to an archive that fits on one page; the control, to a result
  // that does not. With neither — a large archive narrowed to one page — no footer.
  const fitsOnePage = films.length <= FILMS_PAGE_SIZE;
  const paged = totalPages > 1;

  return (
    <FilmsPanel>
      <div
        style={{
          padding: "clamp(18px, 3vw, 30px) clamp(16px, 3vw, 30px) 24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <h1
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "34px",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Films
        </h1>
        <p
          className="text-pretty"
          style={{
            margin: "0 0 20px",
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--foreground-secondary)",
            maxWidth: "62ch",
          }}
        >
          {filmsIntro(films)}
        </p>
        <div className="flex flex-wrap items-center" style={{ gap: "10px" }}>
          <div style={{ minWidth: "200px" }}>
            <Input
              type="search"
              placeholder="Search films"
              aria-label="Search films"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </div>
          {FILM_FACETS.map((facet) => (
            <FilterChip
              key={facet.key}
              label={facet.label}
              count={counts[facet.key]}
              showZero
              active={facet.key === facetKey}
              aria-pressed={facet.key === facetKey}
              onClick={() => {
                setFacetKey(facet.key);
                setPage(0);
              }}
              colorScheme="ocean"
            />
          ))}
          <div style={{ marginLeft: "auto", minWidth: "186px" }}>
            <Select
              options={[...FILM_SORT_OPTIONS]}
              value={sort}
              onChange={(value) => {
                setSort(value as FilmSortKey);
                setPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {featured && <FilmHero film={featured} />}

      <div
        style={{
          padding: "clamp(18px, 3vw, 26px) clamp(16px, 3vw, 30px) 30px",
        }}
      >
        <CountedHeading
          title="All films"
          count={showingLine(matches.length, films.length, null)}
          marginBottom="18px"
        />
        <FilmGrid
          films={pageFilms}
          animationKey={facetKey}
          featuredId={gridFeaturedId}
          selectedId={featured?.id ?? null}
        />
        {(fitsOnePage || paged) && (
          <div
            className="flex flex-wrap items-center"
            style={{
              marginTop: "26px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-subtle)",
              gap: "16px",
            }}
          >
            {fitsOnePage && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--foreground-secondary)",
                }}
              >
                {ONE_PAGE_LINE}
              </span>
            )}
            {paged && (
              <div style={{ marginLeft: "auto" }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={matches.length}
                  pageSize={FILMS_PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </FilmsPanel>
  );
}
