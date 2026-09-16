import { clsx } from "clsx";

/**
 * The ochre "no photographer" pills and their neutral counterparts. Spec 034 FR-006,
 * FR-009.
 *
 * Ochre is load-bearing across the archive: it always means "the archive does not
 * hold this". The neutral pill is the same shape with the opposite meaning, so a tile
 * reads as one list of facts and gaps rather than two kinds of decoration.
 */
export function MissingPills({
  missing,
  known = [],
  className,
}: {
  missing: string[];
  known?: string[];
  className?: string;
}) {
  if (missing.length === 0 && known.length === 0) return null;

  return (
    <div className={clsx("flex flex-wrap gap-[5px]", className)}>
      {missing.map((label) => (
        <span
          key={`missing-${label}`}
          className="rounded-full border whitespace-nowrap"
          style={{
            fontSize: "11px",
            padding: "3px 8px",
            borderColor:
              "color-mix(in srgb, var(--brand-sobrado-ochre) 50%, transparent)",
            color: "var(--brand-sobrado-ochre)",
          }}
        >
          {label}
        </span>
      ))}
      {known.map((label) => (
        <span
          key={`known-${label}`}
          className="rounded-full border whitespace-nowrap"
          style={{
            fontSize: "11px",
            padding: "3px 8px",
            borderColor: "var(--border-subtle)",
            color: "var(--foreground-secondary)",
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
