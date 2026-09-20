import type { CSSProperties, ReactNode } from "react";

import type { Film } from "@/lib/films";

/**
 * Pieces the index and the film page share. Spec 035 FR-002, FR-005.
 */

/** The screen around the panel: the archive's gutter and a reading width. */
export function FilmsScreen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 22px 80px",
      }}
    >
      {children}
    </div>
  );
}

/** The card the films screens are drawn in; its bands divide on hairlines. */
export function FilmsPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-container overflow-hidden border"
      style={{
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {children}
    </div>
  );
}

/** An untitled film's title reads as an absence: ochre, italic. */
export function filmTitleStyle(film: Film): CSSProperties {
  return film.title === null
    ? { color: "var(--brand-sobrado-ochre)", fontStyle: "italic" }
    : { color: "var(--foreground)" };
}

/** A serif section heading with a mono count beside it ("All films", "More films"). */
export function CountedHeading({
  title,
  count,
  marginBottom,
}: {
  title: string;
  count: string;
  marginBottom: string;
}) {
  return (
    <div className="flex items-baseline" style={{ gap: "12px", marginBottom }}>
      <h2
        className="font-serif"
        style={{ fontWeight: 400, fontSize: "20px", margin: 0 }}
      >
        {title}
      </h2>
      <span
        className="font-mono"
        style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}
      >
        {count}
      </span>
    </div>
  );
}
