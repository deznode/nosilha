import { sourceDotColor, type FilmSource } from "@/lib/films";

/** The hosting source's colour mark: 6px beside the hero, 7px on the film page. */
export function SourceDot({
  source,
  size,
}: {
  source: FilmSource | null;
  size: 6 | 7;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-block flex-none rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: sourceDotColor(source),
      }}
    />
  );
}
