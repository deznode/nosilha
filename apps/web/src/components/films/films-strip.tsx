import Link from "next/link";

import {
  archiveCountLine,
  filmsStripNote,
  promotableFilms,
  type Film,
} from "@/lib/films";

import { FilmGrid } from "./film-grid";

/** How many films the home strip shows. */
const STRIP_SIZE = 3;

/**
 * The films on the archive's front door. Spec 035 FR-006, artboard 2c.
 *
 * Each card opens the film's page, where it plays in place; nothing here leaves the
 * archive. The sub-line reads the whole list, so a clause about titles appears only
 * while some film lacks one. It renders on the server, so only the shown films reach
 * the browser.
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
  // A promotional slot: a film flagged as showing an unvouched-for person is left out
  // (spec 034 FR-022). With nothing showable the strip is absent, as with no films.
  const shown = promotableFilms(films).slice(0, STRIP_SIZE);
  if (shown.length === 0) return null;

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
      <FilmGrid films={shown} />
    </section>
  );
}
