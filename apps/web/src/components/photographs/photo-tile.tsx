import Image from "next/image";
import Link from "next/link";

import { MissingPills } from "@/components/ui/missing-pills";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { photoFacts } from "@/lib/photo-facts";
import type { PublicGalleryMedia } from "@/types/gallery";

/**
 * One record in the masonry. Spec 034 FR-009, FR-019.
 *
 * The tile reserves its stored aspect ratio before the image loads, so a column of
 * them settles once rather than reflowing photograph by photograph. A row that
 * predates the dimension backfill falls back to the handoff's shape.
 */
export function PhotoTile({ media }: { media: PublicGalleryMedia }) {
  const facts = photoFacts(media);
  const url = resolvePublicImageUrl(media);

  return (
    <Link
      href={`/photographs/${media.id}`}
      className="mb-4 block break-inside-avoid overflow-hidden rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
    >
      <div className="relative" style={{ background: "var(--muted)" }}>
        <div
          className="relative w-full"
          style={{ aspectRatio: facts.aspectRatio }}
        >
          {url && (
            <Image
              src={url}
              alt={media.altText?.trim() || facts.title.text}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover"
            />
          )}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2"
          style={{
            padding: "26px 12px 10px",
            background:
              "linear-gradient(to top, rgba(8,11,15,.86), transparent)",
          }}
        >
          {facts.filename && (
            <span
              className="font-mono break-all"
              style={{ fontSize: "10px", color: "rgba(228,235,241,.7)" }}
            >
              {facts.filename}
            </span>
          )}
          {facts.located && (
            <span
              className="flex-none"
              style={{
                fontSize: "10px",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                // Fixed ink: this label sits on a photograph in both themes.
                color: "var(--neutral-mist-100)",
              }}
            >
              On map
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 13px 13px" }}>
        <div
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "17px",
            marginBottom: "9px",
            lineHeight: 1.25,
            color: facts.title.untitled
              ? "var(--foreground-secondary)"
              : "var(--foreground)",
            fontStyle: facts.title.untitled ? "italic" : "normal",
          }}
        >
          {facts.title.text}
        </div>
        <MissingPills missing={facts.missing} known={facts.known} />
      </div>
    </Link>
  );
}
