import Image from "next/image";
import Link from "next/link";

import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { photoFacts } from "@/lib/photo-facts";
import type { GalleryFacets, PublicGalleryMedia } from "@/types/gallery";

import { unlocatedTray } from "./photographs-copy";

/**
 * Every photograph with no coordinates. Spec 034 FR-009.
 *
 * It sits below the grid rather than inside it because these records cannot be
 * filtered, sorted or mapped by the thing the grid is organised around. The tray is
 * the archive's open question, printed.
 */
export function UnlocatedTray({
  facets,
  records,
}: {
  facets: GalleryFacets;
  records: PublicGalleryMedia[];
}) {
  if (records.length === 0) return null;

  const copy = unlocatedTray(facets, records.length);

  return (
    <section
      className="rounded-2xl border border-dashed"
      style={{
        marginTop: "54px",
        padding: "24px",
        borderColor:
          "color-mix(in srgb, var(--brand-sobrado-ochre) 45%, transparent)",
        background:
          "color-mix(in srgb, var(--brand-sobrado-ochre) 4%, transparent)",
      }}
    >
      <div
        className="flex flex-wrap items-start justify-between gap-6"
        style={{ marginBottom: "18px" }}
      >
        <div className="min-w-0" style={{ maxWidth: "580px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--brand-sobrado-ochre)",
              marginBottom: "8px",
            }}
          >
            No place recorded
          </div>
          <h2
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: "27px",
              margin: "0 0 8px",
              lineHeight: 1.15,
            }}
          >
            {copy.heading}
          </h2>
          <p
            className="text-pretty"
            style={{
              margin: 0,
              color: "var(--foreground-secondary)",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            {copy.body}
          </p>
        </div>
        <div className="flex-none">
          {/*
            A link into the first record, not a sheet opened against it. The sheet
            takes one subject, and a button about a collection has none — answering it
            would file what you know under whichever photograph happened to sort first.
            Opening that record puts the question next to the picture it is about.
          */}
          <Link
            href={`/photographs/${records[0].id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg transition-opacity hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              padding: "11px 20px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Help place them
          </Link>
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {records.map((media) => (
          <UnlocatedCard key={media.id} media={media} />
        ))}
      </div>
    </section>
  );
}

function UnlocatedCard({ media }: { media: PublicGalleryMedia }) {
  const facts = photoFacts(media);
  const url = resolvePublicImageUrl(media);

  return (
    <Link
      href={`/photographs/${media.id}`}
      className="block overflow-hidden rounded-[10px] border transition-colors hover:border-[var(--brand-sobrado-ochre)]"
      style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
    >
      <div
        className="relative w-full"
        style={{ height: "104px", background: "var(--muted)" }}
      >
        {url && (
          <Image
            src={url}
            alt={media.altText?.trim() || facts.title.text}
            fill
            sizes="180px"
            className="object-cover"
          />
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div
          className="font-serif"
          style={{
            fontSize: "14px",
            color: facts.title.untitled
              ? "var(--foreground-secondary)"
              : "var(--foreground)",
            fontStyle: facts.title.untitled ? "italic" : "normal",
          }}
        >
          {facts.title.text}
        </div>
        {facts.filename && (
          <div
            className="font-mono break-all"
            style={{
              fontSize: "9px",
              color: "var(--foreground-secondary)",
              marginTop: "3px",
            }}
          >
            {facts.filename}
          </div>
        )}
      </div>
    </Link>
  );
}
