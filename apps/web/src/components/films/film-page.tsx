"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { VideoGrid } from "@/components/gallery/video-grid";
import {
  filmTitleLabel,
  filmToMediaItem,
  othersLine,
  playerNote,
  sortFilms,
  type Film,
} from "@/lib/films";
import type { MediaItem } from "@/types/media";

import { CountedHeading, FilmsPanel, filmTitleStyle } from "./film-chrome";
import { FilmMetadata } from "./film-metadata";
import { FilmPlayer } from "./film-player";

/**
 * `/films/[id]`. Spec 035 FR-005, artboard 2a film view.
 *
 * The film plays here, in place, whatever its host. Below it, the archive's own record
 * — which outlives the video if the host ever drops it — and the rest of the films.
 */
export function FilmPage({ film, others }: { film: Film; others: Film[] }) {
  const router = useRouter();
  const items = useMemo(
    () => sortFilms(others, "title").map(filmToMediaItem),
    [others]
  );
  const open = (item: MediaItem) => router.push(`/films/${item.id}`);
  const downloadUrl = film.playback?.kind === "file" ? film.playback.url : null;

  return (
    <FilmsPanel>
      <div
        style={{
          padding: "clamp(18px, 3vw, 24px) clamp(16px, 3vw, 30px) 30px",
        }}
      >
        <Link
          href="/films"
          className="inline-block hover:underline"
          style={{
            paddingBottom: "18px",
            fontSize: "13px",
            color: "var(--brand-ocean-blue)",
          }}
        >
          ← All films
        </Link>

        <FilmPlayer
          key={film.id}
          film={film}
          size="page"
          priority
          slot={
            <span
              className="pointer-events-none absolute font-mono"
              style={{
                left: "14px",
                bottom: "14px",
                fontSize: "11px",
                color: "rgba(244,240,232,.72)",
                background: "rgba(0,0,0,.42)",
                borderRadius: "999px",
                padding: "6px 11px",
              }}
            >
              {playerNote(film)}
            </span>
          }
        />

        <h1
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "29px",
            lineHeight: 1.16,
            letterSpacing: "-0.018em",
            margin: "22px 0 0",
            ...filmTitleStyle(film),
          }}
        >
          {filmTitleLabel(film)}
        </h1>

        <FilmMetadata film={film} variant="full" />

        {downloadUrl && (
          <div
            className="flex flex-wrap items-center border"
            style={{
              marginTop: "18px",
              gap: "12px",
              background: "var(--background-secondary)",
              borderColor: "var(--border-subtle)",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                flex: 1,
                minWidth: "200px",
              }}
            >
              This film is an archive file, so it can be downloaded. Embedded
              films cannot.
            </span>
            <a
              href={downloadUrl}
              download
              className="hover:underline"
              style={{ fontSize: "13px", color: "var(--brand-ocean-blue)" }}
            >
              Download original ↓
            </a>
          </div>
        )}

        {others.length > 0 && (
          <section
            style={{
              marginTop: "30px",
              paddingTop: "22px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <CountedHeading
              title="More films"
              count={othersLine(others.length)}
              marginBottom="16px"
            />
            <VideoGrid
              items={items}
              categoryFilter="all"
              onVideoSelect={open}
              mobileLayout="cards"
            />
          </section>
        )}
      </div>
    </FilmsPanel>
  );
}
