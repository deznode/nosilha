import Link from "next/link";
import { clsx } from "clsx";

/**
 * The dashed "give one" cell that always closes the photographs and films
 * grids (spec 039 E3/E4), and the standalone board pair on `/contribute` (E1).
 *
 * Measurements are exact per the hi-fi handoff: 1.5px dashed
 * `--border-strong`, 8px radius, 190px minimum height, 16px padding, a
 * centered column with an 8px gap, a Fraunces 19/1.2 question, a 13/1.5 body
 * line and a 44px primary CTA. `className` carries only grid placement
 * (sizing, span, order) — the cell's own shape never varies by host grid.
 */
export function InvitationCell({
  question,
  body,
  ctaLabel,
  href,
  className,
}: {
  question: string;
  body: string;
  ctaLabel: string;
  href: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "border-border-strong rounded-badge flex min-h-[190px] flex-col justify-center gap-2 border-[1.5px] border-dashed p-4",
        className
      )}
    >
      <p className="text-body font-serif text-[19px] leading-[1.2]">
        {question}
      </p>
      <p className="text-muted text-[13px] leading-[1.5]">{body}</p>
      <Link
        href={href}
        className="bg-primary text-primary-foreground rounded-badge focus-ring mt-1 inline-flex h-11 items-center self-start px-4 text-sm font-medium"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
