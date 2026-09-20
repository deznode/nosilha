import Link from "next/link";

import { filmTitleLabel, type Film } from "@/lib/films";

import { filmTitleStyle } from "./film-chrome";
import { FilmMetadata } from "./film-metadata";
import { FilmPlayer } from "./film-player";

/**
 * The index's featured film, playable on arrival. Spec 035 FR-003, artboard 2a band 2.
 *
 * Two columns that stack by themselves: `auto-fit` over a 270px minimum needs no media
 * query to fall to one column on a phone.
 */
export function FilmHero({ film }: { film: Film }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
        gap: "24px",
        alignItems: "stretch",
        padding: "clamp(18px, 3vw, 26px) clamp(16px, 3vw, 30px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Keyed so a new featured film starts idle rather than inheriting a state. */}
      <FilmPlayer key={film.id} film={film} size="hero" priority />

      <div className="flex min-w-0 flex-col">
        <div
          style={{
            fontSize: "10px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--brand-ocean-blue)",
            marginBottom: "10px",
          }}
        >
          Now playing
        </div>
        <div
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "25px",
            lineHeight: 1.18,
            letterSpacing: "-0.015em",
            ...filmTitleStyle(film),
          }}
        >
          {filmTitleLabel(film)}
        </div>
        <FilmMetadata film={film} variant="compact" />
        <Link
          href={`/films/${film.id}`}
          className="focus-ring transition-opacity hover:opacity-90"
          style={{
            marginTop: "auto",
            alignSelf: "flex-start",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            borderRadius: "9px",
            padding: "11px 18px",
            fontSize: "13px",
          }}
        >
          Open film page
        </Link>
      </div>
    </div>
  );
}
