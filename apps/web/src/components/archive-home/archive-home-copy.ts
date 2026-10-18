import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { capitalise, toWords, type Gender } from "@/lib/copy/number-words";
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
 *
 * The wording lives in the `archiveHome` messages (spec 041): one message per
 * sentence, with counts as plurals and number words passed in as arguments.
 */

export type ArchiveHomeTranslator = Translator<"archiveHome">;

/** A count in words, agreeing with its noun where the language asks (`uma fotografia`). */
function words(n: number, locale: Locale, gender: Gender = "masculine") {
  return toWords(n, { locale, gender });
}

/** The same, capitalised to open a sentence. */
function openingWords(n: number, locale: Locale, gender: Gender = "masculine") {
  return capitalise(words(n, locale, gender), locale);
}

/** How many tiles the "what each one is missing" row shows. */
export const PHOTOGRAPH_ROW_SIZE = 4;

/**
 * The photograph the archive ships with, for when no record is standing in as the
 * hero. Its credit and its gap are both known, and both are stated: the handoff's
 * rule is that an image in a promotional position never appears uncredited, and is
 * never quietly attached to a place it merely resembles.
 */
export function shippedHero(t: ArchiveHomeTranslator) {
  return {
    url: "/images/hero.jpg",
    alt: t("shippedHero.alt"),
    credit: t("shippedHero.credit"),
  };
}

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

export function heroStandfirst(
  t: ArchiveHomeTranslator,
  locale: Locale,
  { settlements, records, facets }: ArchiveTotals
): string {
  return t("standfirst", {
    settlements,
    // `localidade` is feminine in Portuguese.
    settlementWords: openingWords(settlements, locale, "feminine"),
    records,
    recordWords: words(records, locale),
    photographs: facets.photographs,
    photographWords: words(facets.photographs, locale, "feminine"),
  });
}

/**
 * The chip over the hero: who took it, where it came from, and whether anyone has
 * said where it was taken.
 *
 * The gap is stated rather than left blank. An uncredited photograph in a
 * promotional position with nothing said about it is exactly the silence the archive
 * exists to break.
 */
export function heroCreditChip(
  t: ArchiveHomeTranslator,
  hero: PublicGalleryMedia | null
): string | null {
  if (!hero) return null;

  const parts: string[] = [photoCredit(hero) ?? t("credit.noPhotographer")];

  if (isPublicUserUploadMedia(hero)) {
    const source = hero.archiveSource?.trim();
    if (source) parts.push(source);

    if (!photoIsLocated(hero)) {
      parts.push(t("credit.placeNotRecorded"));
    } else {
      parts.push(hero.locationName?.trim() || t("credit.placeNotNamed"));
    }
  }

  return parts.join(" · ");
}

export interface RouteCard {
  label: string;
  href: string;
  note: string;
}

export function routeCards(
  t: ArchiveHomeTranslator,
  locale: Locale,
  {
    towns,
    facets,
    stays,
    ratedStays,
  }: {
    towns: TownStatusSummary[];
    facets: GalleryFacets;
    stays: number;
    ratedStays: number;
  }
): RouteCard[] {
  const documented = towns.filter(
    (town) => town.status === "DOCUMENTED"
  ).length;
  const credited = facets.total - facets.uncredited;

  return [
    {
      label: t("routes.settlements.label"),
      href: "/settlements",
      note: t("routes.settlements.note", {
        names: towns.length,
        nameWords: openingWords(towns.length, locale),
        documented,
        documentedWords: openingWords(documented, locale),
      }),
    },
    {
      label: t("routes.photographs.label"),
      href: "/photographs",
      note: t("routes.photographs.note", {
        records: facets.total,
        recordWords: openingWords(facets.total, locale),
        credited,
        creditedWords: openingWords(credited, locale),
      }),
    },
    {
      label: t("routes.map.label"),
      href: "/map",
      note: t("routes.map.note"),
    },
    {
      label: t("routes.stay.label"),
      href: "/stay",
      note: t("routes.stay.note", {
        stays,
        stayWords: openingWords(stays, locale),
        rated: ratedStays,
        ratedWords: openingWords(ratedStays, locale),
      }),
    },
  ];
}

export function photographRowHeading(
  t: ArchiveHomeTranslator,
  locale: Locale,
  shown: number
): string {
  return t("photographRow.heading", {
    count: shown,
    words: openingWords(shown, locale, "feminine"),
  });
}

export function photographRowNote(
  t: ArchiveHomeTranslator,
  locale: Locale,
  row: PublicGalleryMedia[]
): string {
  const uncredited = row.filter((media) => photoCredit(media) === null).length;

  if (uncredited === row.length && row.length > 0) {
    return t("photographRow.noneCredited");
  }
  if (uncredited === 0) return t("photographRow.allCredited");

  return t("photographRow.someUncredited", {
    count: uncredited,
    words: openingWords(uncredited, locale, "feminine"),
  });
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
  t: ArchiveHomeTranslator,
  locale: Locale,
  empty: number,
  total: number
): string {
  if (empty === 0) return t("emptySettlements.none");

  return t("emptySettlements.standfirst", {
    empty,
    // Counts settlements: `localidade` is feminine in Portuguese.
    emptyWords: openingWords(empty, locale, "feminine"),
    totalWords: words(total, locale, "feminine"),
  });
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
