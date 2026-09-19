import Link from "next/link";

import { MissingPills } from "@/components/ui/missing-pills";
import { formatDuration } from "@/lib/format-duration";
import { photoFacts } from "@/lib/photo-facts";
import type { PublicExternalMedia } from "@/types/gallery";

import { filmsNote } from "./photographs-copy";

/**
 * The films. Spec 034 FR-009.
 *
 * Films are titles until YouTube gives us more. Nothing here synthesises a thumbnail
 * or a duration: a length that is not recorded says so, and joins the metadata row
 * the day the sync fills it in.
 *
 * A card opens the film's own page, where it plays in place; it never links out to
 * its host (spec 035 FR-007).
 */
export function FilmsList({
  films,
  /**
   * Null when the films are the grid rather than a section below it — the chip above
   * already says "Films", and a heading repeating it would read as a second list.
   */
  heading = "Films",
  /**
   * The archive's film count (FR-018). Films arrive one page at a time, so the
   * loaded array is only the right number while the archive fits in one page.
   */
  total,
}: {
  films: PublicExternalMedia[];
  heading?: string | null;
  total?: number;
}) {
  if (films.length === 0) return null;

  return (
    <section style={{ marginTop: heading ? "54px" : 0 }}>
      {heading && (
        <div
          className="flex items-baseline gap-[14px]"
          style={{ marginBottom: "16px" }}
        >
          <h2
            className="font-serif"
            style={{ fontWeight: 400, fontSize: "27px", margin: 0 }}
          >
            {heading}
          </h2>
          <span
            style={{ color: "var(--foreground-secondary)", fontSize: "13px" }}
          >
            {filmsNote(films, total)}
          </span>
        </div>
      )}

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}
      >
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  );
}

function FilmCard({ film }: { film: PublicExternalMedia }) {
  const facts = photoFacts(film);
  const duration = film.durationSeconds
    ? formatDuration(film.durationSeconds)
    : null;

  return (
    <Link
      href={`/films/${film.id}`}
      className="flex flex-col gap-[9px] rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{
        padding: "14px",
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{
          color: "var(--brand-ocean-blue)",
          fontSize: "11px",
          letterSpacing: ".1em",
          textTransform: "uppercase",
        }}
      >
        ▷ Film
      </div>
      <div
        className="font-serif"
        style={{
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: 1.3,
          fontStyle: facts.title.untitled ? "italic" : "normal",
          color: facts.title.untitled
            ? "var(--foreground-secondary)"
            : "var(--foreground)",
        }}
      >
        {facts.title.text}
      </div>
      <div className="mt-auto">
        {duration ? (
          <MissingPills missing={[]} known={[duration]} />
        ) : (
          <MissingPills missing={["length not recorded"]} />
        )}
      </div>
    </Link>
  );
}
