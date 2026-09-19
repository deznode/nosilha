"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { VideoGrid } from "@/components/gallery/video-grid";
import {
  archiveCountLine,
  filmsStripNote,
  filmToMediaItem,
  type Film,
} from "@/lib/films";
import type { MediaItem } from "@/types/media";

/** How many films the home strip shows. */
const STRIP_SIZE = 3;

/**
 * The films on the archive's front door. Spec 035 FR-006, artboard 2c.
 *
 * Each card opens the film's page, where it plays in place; nothing here leaves the
 * archive. The sub-line reads the whole list, so a clause about titles appears only
 * while some film lacks one.
 */
export function FilmsStrip({
  films,
  total,
}: {
  /** Every film the archive returned — the note counts titles across all of them. */
  films: Film[];
  /** The archive's film count, from the facets. */
  total: number;
}) {
  const router = useRouter();
  const items = useMemo(
    () => films.slice(0, STRIP_SIZE).map(filmToMediaItem),
    [films]
  );

  if (films.length === 0) return null;

  const open = (item: MediaItem) => router.push(`/films/${item.id}`);

  return (
    <section
      className="rounded-container border"
      style={{
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
        padding: "clamp(18px, 3vw, 30px)",
        marginBottom: "56px",
      }}
    >
      <div
        className="flex flex-wrap items-baseline"
        style={{ gap: "14px", marginBottom: "6px" }}
      >
        <h2
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "27px",
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          Films
        </h2>
        <span
          style={{ fontSize: "13px", color: "var(--foreground-secondary)" }}
        >
          {archiveCountLine(total)}
        </span>
        <Link
          href="/films"
          className="ml-auto hover:underline"
          style={{ fontSize: "13px", color: "var(--brand-ocean-blue)" }}
        >
          See all films →
        </Link>
      </div>
      <p
        className="text-pretty"
        style={{
          margin: "0 0 20px",
          fontSize: "13.5px",
          lineHeight: 1.55,
          color: "var(--foreground-secondary)",
          maxWidth: "60ch",
        }}
      >
        {filmsStripNote(films, total)}
      </p>
      <VideoGrid
        items={items}
        categoryFilter="all"
        onVideoSelect={open}
        mobileLayout="cards"
      />
    </section>
  );
}
