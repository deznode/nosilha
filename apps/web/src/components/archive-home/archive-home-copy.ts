import { capitalise, countSentence, toWords } from "@/lib/copy/number-words";
import {
  photoCredit,
  photoIsIdentifiablePerson,
  photoIsLocated,
} from "@/lib/photo-facts";
import {
  isPublicUserUploadMedia,
  type GalleryFacets,
  type PublicGalleryMedia,
} from "@/types/gallery";
import type { TownStatusSummary } from "@/types/town";

/**
 * The home page in prose. Spec 034 FR-006.
 *
 * The page is an argument — here is what we hold, here is what is missing — so every
 * sentence is composed from live counts. A literal would let the argument drift from
 * the archive it is about.
 */

/** How many tiles the "what each one is missing" row shows. */
export const PHOTOGRAPH_ROW_SIZE = 4;

/**
 * The photograph the archive ships with, for when no record is standing in as the
 * hero. Its credit and its gap are both known, and both are stated: the handoff's
 * rule is that an image in a promotional position never appears uncredited, and is
 * never quietly attached to a place it merely resembles.
 */
export const SHIPPED_HERO = {
  url: "/images/hero.jpg",
  alt: "A rocky coastline below steep mountains on Brava",
  credit: "NosIlha, 2024 · CC BY-SA 4.0 · place not yet recorded",
} as const;

/**
 * Whether a record may head the home page.
 *
 * The featured slot is shared with the old gallery, which fills it with a film, and a
 * video thumbnail is not a photograph of the island. A record showing an identifiable
 * person nobody has vouched for is excluded by FR-022.
 */
export function pickHero(
  featured: PublicGalleryMedia | null
): PublicGalleryMedia | null {
  if (!featured) return null;
  if (!isPublicUserUploadMedia(featured)) return null;
  if (photoIsIdentifiablePerson(featured)) return null;
  return featured.publicUrl ? featured : null;
}

export interface ArchiveTotals {
  settlements: number;
  /** Place records, i.e. directory entries. */
  records: number;
  facets: GalleryFacets;
}

export function heroStandfirst({
  settlements,
  records,
  facets,
}: ArchiveTotals): string {
  const parts = [
    countSentence(settlements, {
      one: "{n} settlement",
      many: "{n} settlements",
      zero: "No settlement",
    }),
    countSentence(records, {
      one: "{n} place record",
      many: "{n} place records",
      zero: "no place record",
    }).toLowerCase(),
    countSentence(facets.photographs, {
      one: "{n} photograph",
      many: "{n} photographs",
      zero: "no photograph",
    }).toLowerCase(),
  ];

  return `${parts.join(", ")}. Most of it is still missing, and every gap here is a question.`;
}

/**
 * The chip over the hero: who took it, where it came from, and whether anyone has
 * said where it was taken.
 *
 * The gap is stated rather than left blank. An uncredited photograph in a
 * promotional position with nothing said about it is exactly the silence the archive
 * exists to break.
 */
export function heroCreditChip(hero: PublicGalleryMedia | null): string | null {
  if (!hero) return null;

  const parts: string[] = [photoCredit(hero) ?? "photographer not recorded"];

  if (isPublicUserUploadMedia(hero)) {
    const source = hero.archiveSource?.trim();
    if (source) parts.push(source);

    if (!photoIsLocated(hero)) {
      parts.push("place not yet recorded");
    } else {
      parts.push(hero.locationName?.trim() || "place not named");
    }
  }

  return parts.join(" · ");
}

export interface RouteCard {
  label: string;
  href: string;
  note: string;
}

export function routeCards({
  towns,
  facets,
  stays,
  ratedStays,
}: {
  towns: TownStatusSummary[];
  facets: GalleryFacets;
  stays: number;
  ratedStays: number;
}): RouteCard[] {
  const documented = towns.filter((t) => t.status === "DOCUMENTED").length;
  const credited = facets.total - facets.uncredited;

  const names = countSentence(towns.length, {
    one: "{n} name",
    many: "{n} names",
    zero: "No name",
  });
  const documentedNote =
    documented === 0
      ? "None documented."
      : `${capitalise(toWords(documented))} documented.`;

  const records = countSentence(facets.total, {
    one: "{n} record",
    many: "{n} records",
    zero: "Nothing yet",
  });
  const creditNote =
    credited === 0
      ? "None credited."
      : `${capitalise(toWords(credited))} credited.`;

  const stayNote =
    stays === 0
      ? "No place to stay is recorded yet."
      : `${countSentence(stays, {
          one: "{n} place",
          many: "{n} places",
          zero: "",
        })}. ${
          ratedStays === 0
            ? "None rated."
            : `${capitalise(toWords(ratedStays))} rated.`
        }`;

  return [
    {
      label: "Settlements",
      href: "/settlements",
      note: `${names}. ${documentedNote}`,
    },
    {
      label: "Photographs",
      href: "/photographs",
      note: `${records}. ${creditNote}`,
    },
    {
      label: "Map",
      href: "/map",
      note: "Every point we hold, coloured by what is known.",
    },
    { label: "Stay", href: "/stay", note: stayNote },
  ];
}

export function photographRowHeading(shown: number): string {
  return shown === 1
    ? "One photograph, and what it is missing"
    : `${countSentence(shown, {
        one: "{n} photograph",
        many: "{n} photographs",
        zero: "No photographs",
      })}, and what each one is missing`;
}

export function photographRowNote(row: PublicGalleryMedia[]): string {
  const uncredited = row.filter((media) => photoCredit(media) === null).length;

  if (uncredited === row.length && row.length > 0) {
    return "Nobody has told us who took any of these.";
  }
  if (uncredited === 0) return "Every one of these names its photographer.";

  return `${countSentence(uncredited, {
    one: "{n} of these has no photographer",
    many: "{n} of these have no photographer",
    zero: "",
  })}.`;
}

/**
 * The four records the row shows.
 *
 * Two exclusions, both deliberate. A record with no image cannot illustrate the
 * point it is making. A record showing an identifiable person whose provenance
 * nobody has confirmed never appears in a promotional position (FR-022) — it belongs
 * in the tray, where someone can name it.
 *
 * Heroes need no exclusion here: the public archive list already holds only
 * `role = ARCHIVE` rows.
 */
export function pickPhotographRow(
  pool: PublicGalleryMedia[]
): PublicGalleryMedia[] {
  return pool
    .filter((media) => !photoIsIdentifiablePerson(media))
    .filter((media) => isPublicUserUploadMedia(media) && !!media.publicUrl)
    .slice(0, PHOTOGRAPH_ROW_SIZE);
}

export function emptySettlementsStandfirst(
  empty: number,
  total: number
): string {
  if (empty === 0) return "Every settlement on the island holds something.";

  return (
    `${capitalise(toWords(empty))} of the ${toWords(total)} have a name and a point ` +
    "on the map and nothing else. No photograph, no description, no record of who lives there."
  );
}

/** A name-only settlement's only home is its pin, so the chip selects it there. */
export function emptySettlementChipLink(town: TownStatusSummary): string {
  const params = new URLSearchParams({
    mode: "settlements",
    status: "name",
    sel: `s:${town.slug}`,
  });
  return `/map?${params.toString()}`;
}
