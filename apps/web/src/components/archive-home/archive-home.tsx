import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FilmsStrip } from "@/components/films/films-strip";
import { MissingPills } from "@/components/ui/missing-pills";
import type { Film } from "@/lib/films";
import { photoFacts } from "@/lib/photo-facts";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import type { GalleryFacets, PublicGalleryMedia } from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

import {
  SHIPPED_HERO,
  emptySettlementChipLink,
  emptySettlementsStandfirst,
  heroCreditChip,
  heroStandfirst,
  photographRowHeading,
  photographRowNote,
  routeCards,
} from "./archive-home-copy";

/**
 * The archive's front door. Spec 034 FR-006.
 *
 * A hero, four ways in, four photographs with their gaps named, the films (spec 035
 * FR-006), the Instagram account (spec 036), and every settlement the archive holds
 * nothing about. Metrics and copy are the prototype's; the numbers
 * inside the copy are not.
 */

export interface ArchiveHomeProps {
  towns: TownStatusSummary[];
  recordCount: number;
  facets: GalleryFacets;
  stayCount: number;
  ratedStayCount: number;
  /** An archive photograph standing in as the hero, or null for the shipped one. */
  hero: PublicGalleryMedia | null;
  photographRow: PublicGalleryMedia[];
  /** Every film in the archive; the strip shows three. */
  films: Film[];
  /**
   * The "From Instagram" section, passed through rather than rendered here so it
   * keeps its own cache scope instead of living for this page's hour.
   */
  instagram: ReactNode;
}

export function ArchiveHome({
  towns,
  recordCount,
  facets,
  stayCount,
  ratedStayCount,
  hero,
  photographRow,
  films,
  instagram,
}: ArchiveHomeProps) {
  const heroUrl = (hero && resolvePublicImageUrl(hero)) || SHIPPED_HERO.url;
  const heroAlt = hero?.altText?.trim() || SHIPPED_HERO.alt;
  // The shipped hero carries a credit of its own; an archive record's is composed.
  const credit = hero ? heroCreditChip(hero) : SHIPPED_HERO.credit;
  const emptyTowns = towns.filter((town) => town.entryCount === 0);
  const cards = routeCards({
    towns,
    facets,
    stays: stayCount,
    ratedStays: ratedStayCount,
  });

  return (
    <div>
      <div className="relative" style={{ background: "var(--muted)" }}>
        <div
          className="relative w-full"
          style={{ height: "56vh", minHeight: "340px" }}
        >
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            padding: "90px 22px 26px",
            background:
              "linear-gradient(to top, rgba(8,11,15,.93), transparent)",
          }}
        >
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            <h1
              className="font-serif text-pretty"
              style={{
                fontWeight: 400,
                fontSize: "52px",
                lineHeight: 1.02,
                margin: "0 0 14px",
                letterSpacing: "-0.025em",
                maxWidth: "720px",
                // Ink over a photograph is fixed in both themes: following
                // --foreground would invert it to black on the scrim in light mode.
                color: "var(--neutral-mist-50)",
              }}
            >
              An archive of Brava, built from what people send us
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--neutral-mist-100)",
                fontSize: "16px",
                maxWidth: "560px",
                lineHeight: 1.55,
              }}
            >
              {heroStandfirst({
                settlements: towns.length,
                records: recordCount,
                facets,
              })}
            </p>
          </div>
        </div>

        {credit && (
          <div
            className="absolute rounded-lg border backdrop-blur-[6px]"
            style={{
              top: "14px",
              right: "14px",
              padding: "7px 11px",
              fontSize: "11px",
              background:
                "color-mix(in srgb, var(--background) 85%, transparent)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground-secondary)",
            }}
          >
            {credit}
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "46px 22px 80px",
        }}
      >
        <nav
          aria-label="The archive"
          className="grid gap-[10px]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            marginBottom: "56px",
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex flex-col gap-[6px] rounded-xl border transition-colors hover:border-[var(--border-strong)]"
              style={{
                padding: "18px",
                background: "var(--card)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <span
                className="font-serif"
                style={{ fontWeight: 400, fontSize: "19px" }}
              >
                {card.label}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--foreground-secondary)",
                  lineHeight: 1.45,
                }}
              >
                {card.note}
              </span>
            </Link>
          ))}
        </nav>

        {photographRow.length > 0 && (
          <section style={{ marginBottom: "56px" }}>
            <h2
              className="font-serif"
              style={{ fontWeight: 400, fontSize: "30px", margin: "0 0 6px" }}
            >
              {photographRowHeading(photographRow.length)}
            </h2>
            <p
              style={{
                margin: "0 0 20px",
                color: "var(--foreground-secondary)",
                fontSize: "14px",
              }}
            >
              {photographRowNote(photographRow)}
            </p>
            <div
              className="grid gap-[14px]"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {photographRow.map((media) => (
                <HomePhotographTile key={media.id} media={media} />
              ))}
            </div>
          </section>
        )}

        <FilmsStrip films={films} total={facets.films} />

        {instagram}

        <section>
          <h2
            className="font-serif"
            style={{ fontWeight: 400, fontSize: "30px", margin: "0 0 6px" }}
          >
            Settlements with nothing recorded
          </h2>
          <p
            style={{
              margin: "0 0 18px",
              color: "var(--foreground-secondary)",
              fontSize: "14px",
              maxWidth: "620px",
              lineHeight: 1.55,
            }}
          >
            {emptySettlementsStandfirst(emptyTowns.length, towns.length)}
          </p>
          <div className="flex flex-wrap gap-[7px]">
            {emptyTowns.map((town) => (
              <Link
                key={town.slug}
                href={emptySettlementChipLink(town)}
                className="rounded-full border transition-colors hover:border-[var(--brand-sobrado-ochre)] hover:text-[var(--foreground)]"
                style={{
                  padding: "7px 14px",
                  fontSize: "13px",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground-secondary)",
                }}
              >
                {town.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HomePhotographTile({ media }: { media: PublicGalleryMedia }) {
  const facts = photoFacts(media);
  const url = resolvePublicImageUrl(media);

  return (
    <Link
      href={`/photographs/${media.id}`}
      className="block overflow-hidden rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="relative w-full"
        style={{ height: "168px", background: "var(--muted)" }}
      >
        {url && (
          <Image
            src={url}
            alt={media.altText?.trim() || facts.title.text}
            fill
            sizes="(max-width: 768px) 100vw, 260px"
            className="object-cover"
          />
        )}
      </div>
      <div style={{ padding: "13px" }}>
        <div
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "17px",
            marginBottom: "9px",
            color: facts.title.untitled
              ? "var(--foreground-secondary)"
              : "var(--foreground)",
            fontStyle: facts.title.untitled ? "italic" : "normal",
          }}
        >
          {facts.title.text}
        </div>
        <MissingPills missing={facts.missing} />
      </div>
    </Link>
  );
}
