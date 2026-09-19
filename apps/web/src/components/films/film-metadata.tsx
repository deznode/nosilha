import type { ReactNode } from "react";

import { formatFilmLength, NOT_RECORDED, type Film } from "@/lib/films";

import { SourceDot } from "./source-dot";

/**
 * A film's facts, with every absence named. Spec 035 FR-003 (compact, beside the hero)
 * and FR-005 (full, on the film page).
 *
 * `MetadataBadges` needs photograph EXIF fields a film has none of, so the grid is its
 * own. A value the archive does not hold reads "Not recorded" in ochre.
 */
export function FilmMetadata({
  film,
  variant,
}: {
  film: Film;
  variant: "compact" | "full";
}) {
  const full = variant === "full";
  const rows: [string, ReactNode][] = [
    [
      "Source",
      <span
        key="source"
        className="flex flex-wrap items-center"
        style={{ gap: full ? "8px" : "7px" }}
      >
        <SourceDot source={film.source} size={full ? 7 : 6} />
        {film.source ?? <Missing />}
      </span>,
    ],
    ["Length", formatFilmLength(film.durationSeconds) ?? <Missing />],
    [full ? "Filmed near" : "Place", film.place ?? <Missing />],
  ];
  if (full) rows.push(["Filmmaker", film.filmmaker ?? <Missing />]);

  return (
    <dl
      className={full ? "grid" : "grid font-mono"}
      style={
        full
          ? {
              gridTemplateColumns: "minmax(84px, auto) 1fr",
              gap: "10px 18px",
              margin: "20px 0 0",
              paddingTop: "18px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "13px",
            }
          : {
              gridTemplateColumns: "auto 1fr",
              gap: "7px 14px",
              margin: "16px 0 0",
              fontSize: "12px",
            }
      }
    >
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt
            style={
              full
                ? {
                    color: "var(--foreground-secondary)",
                    fontSize: "11px",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    paddingTop: "2px",
                  }
                : { color: "var(--foreground-secondary)" }
            }
          >
            {label}
          </dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Missing() {
  return (
    <span style={{ color: "var(--brand-sobrado-ochre)" }}>{NOT_RECORDED}</span>
  );
}
