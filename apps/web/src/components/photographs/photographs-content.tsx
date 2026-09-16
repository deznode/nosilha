"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { UnifiedSearch } from "@/components/search";
import { FilterChip } from "@/components/ui/filter-chip";
import { usePhotographsQuery } from "@/hooks/queries/usePhotographsQuery";
import type {
  GalleryFacets,
  PublicExternalMedia,
  PublicGalleryMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

import { FilmsList } from "./films-list";
import { MasonryGrid } from "./masonry-grid";
import { PhotoTile } from "./photo-tile";
import { UnlocatedTray } from "./unlocated-tray";
import {
  PHOTOGRAPH_FILTERS,
  emptyLine,
  onlyFilms,
  parsePhotographFilter,
  photographsStandfirst,
  resolveRegion,
  showingLine,
  type PhotographFilterKey,
} from "./photographs-copy";

/**
 * The photographs screen. Spec 034 FR-009.
 *
 * Chips count the whole archive, the grid shows one filter of it, and the tray below
 * holds everything the grid structurally cannot. The filter and the area both live in
 * the URL, so any view of the archive is a link.
 *
 * Both are read from the URL rather than mirrored into state. Navigating to
 * `/photographs` from the nav pill, or arriving at `?region=` from a settlement, does
 * not remount this component — and under `cacheComponents` a hidden route stays
 * alive — so a `useState` copy would keep showing the previous filter while the
 * address bar showed the new one. The `initial*` props serve only the first paint.
 */
export function PhotographsContent({
  facets,
  towns,
  unlocated,
  films,
  initialFilter,
  initialRegion,
}: {
  facets: GalleryFacets;
  towns: TownStatusSummary[];
  /** Every record with no coordinates, for the tray. */
  unlocated: PublicGalleryMedia[];
  films: PublicExternalMedia[];
  initialFilter: PhotographFilterKey;
  initialRegion: string | undefined;
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);

  // Read from the URL, never mirrored into state: navigating to `/photographs` from
  // the nav pill, or arriving at `?region=` from a settlement, does not remount this
  // component, and under `cacheComponents` a hidden route stays alive — so a state
  // copy would keep the old filter while the address bar showed the new one. The
  // `initial*` props serve the server's first paint, before there is a URL to read.
  const fromUrl = urlParams.has("filter") || urlParams.has("region");
  const filter = fromUrl
    ? parsePhotographFilter(urlParams.get("filter") ?? undefined)
    : initialFilter;
  const regionSlug = fromUrl
    ? (urlParams.get("region") ?? undefined)
    : initialRegion;

  const region = resolveRegion(regionSlug, towns);
  const { items, totalItems } = usePhotographsQuery(filter, region);

  const push = useCallback(
    (next: PhotographFilterKey, slug: string | undefined) => {
      const params = new URLSearchParams();
      params.set("filter", next);
      if (slug) params.set("region", slug);
      router.replace(`/photographs?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  function choose(next: PhotographFilterKey) {
    push(next, regionSlug);
  }

  function clearRegion() {
    push(filter, undefined);
  }

  /**
   * "Show me one that needs help" opens a record with no place. Random, because a
   * fixed pick would send everyone to the same photograph and the second person
   * through would have nothing to add.
   */
  function showOneThatNeedsHelp() {
    if (unlocated.length === 0) return;
    const pick = unlocated[Math.floor(Math.random() * unlocated.length)];
    router.push(`/photographs/${pick.id}`);
  }

  const showFilms = filter !== "films";
  const showTray = filter !== "films" && unlocated.length > 0;

  return (
    <div
      style={{
        padding: "40px 22px 80px",
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      <div
        className="flex flex-wrap items-end justify-between gap-8"
        style={{ marginBottom: "26px" }}
      >
        <div className="min-w-0" style={{ maxWidth: "620px" }}>
          <h1
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: "46px",
              lineHeight: 1.05,
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            Photographs
          </h1>
          <p
            className="text-pretty"
            style={{
              margin: 0,
              color: "var(--foreground-secondary)",
              fontSize: "15px",
              lineHeight: 1.55,
            }}
          >
            {photographsStandfirst(facets)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* The archive has no search page of its own; the pill opens the site's
              search in place rather than linking somewhere that does not exist. */}
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            className="flex cursor-pointer items-center gap-[7px] rounded-full border transition-colors hover:border-[var(--border-strong)]"
            style={{
              padding: "9px 16px",
              font: "inherit",
              fontSize: "13px",
              background: "var(--background-secondary)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            <span aria-hidden style={{ opacity: 0.6 }}>
              ⌕
            </span>{" "}
            Search the archive
          </button>
          {unlocated.length > 0 && (
            <button
              type="button"
              onClick={showOneThatNeedsHelp}
              className="cursor-pointer rounded-full border"
              style={{
                padding: "9px 16px",
                font: "inherit",
                fontSize: "13px",
                background: "transparent",
                borderColor: "var(--brand-sobrado-ochre)",
                color: "var(--brand-sobrado-ochre)",
              }}
            >
              Show me one that needs help
            </button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div style={{ marginBottom: "22px", maxWidth: "620px" }}>
          <UnifiedSearch placeholder="Search places and articles..." />
        </div>
      )}

      <div
        className="flex flex-wrap items-center gap-2 border-b"
        style={{
          paddingBottom: "18px",
          borderBottomColor: "var(--border-subtle)",
          marginBottom: "28px",
        }}
      >
        {PHOTOGRAPH_FILTERS.map((chip) => (
          <FilterChip
            key={chip.key}
            label={chip.label}
            count={facets[chip.facet]}
            showZero
            active={filter === chip.key}
            onClick={() => choose(chip.key)}
          />
        ))}
        {region && (
          <button
            type="button"
            onClick={clearRegion}
            className="flex cursor-pointer items-center gap-2 rounded-full border"
            style={{
              padding: "7px 14px",
              font: "inherit",
              fontSize: "13px",
              background:
                "color-mix(in srgb, var(--brand-ocean-blue) 14%, transparent)",
              borderColor: "var(--brand-ocean-blue)",
              color: "var(--foreground)",
            }}
          >
            Area: {region.name} <span style={{ opacity: 0.7 }}>✕</span>
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <>
          {/*
            Films are cards, not tiles. A film has no file, no dimensions and no
            photographer, so rendering one through `PhotoTile` would put a synthesised
            YouTube thumbnail behind a filename scrim and pin "no photographer" and
            "no title" to it — the three things SPECS §4's films decision forbids.
          */}
          {filter === "films" ? (
            <FilmsList films={onlyFilms(items)} heading={null} />
          ) : (
            <MasonryGrid>
              {items.map((media) => (
                <PhotoTile key={media.id} media={media} />
              ))}
            </MasonryGrid>
          )}
          <div
            className="flex items-center justify-center gap-4"
            style={{ margin: "34px 0 0" }}
          >
            <span
              style={{ color: "var(--foreground-secondary)", fontSize: "13px" }}
            >
              {showingLine(items.length, totalItems, region)}
            </span>
          </div>
        </>
      ) : (
        <div
          className="rounded-2xl border border-dashed text-center"
          style={{ padding: "46px 24px", borderColor: "var(--border-strong)" }}
        >
          <p
            className="font-serif"
            style={{ margin: "0 0 6px", fontWeight: 400, fontSize: "22px" }}
          >
            Nothing in the archive matches that
          </p>
          <p
            style={{
              margin: 0,
              color: "var(--foreground-secondary)",
              fontSize: "14px",
            }}
          >
            {emptyLine(filter, region)}
          </p>
        </div>
      )}

      {showTray && <UnlocatedTray facets={facets} records={unlocated} />}
      {showFilms && <FilmsList films={films} />}
    </div>
  );
}
