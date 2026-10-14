import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import {
  missingFields,
  photoHeading,
  photographsHref,
  type ArchivePhoto,
  type PhotographsTranslator,
} from "@/lib/archive-photographs";
import { joinList } from "@/lib/copy/number-words";
import type { Film } from "@/lib/films";
import type { TownStatusSummary } from "@/types/town";

/**
 * Every sentence a share sends or a share arrival reads. Spec 040 FR-002, FR-004,
 * FR-006. Kept in one place so the preview, the prefilled message and the page say
 * the same thing.
 *
 * Each sentence is one message in the `share` namespace (spec 041 FR-004). Counts
 * go in as strings beside the plural selector, so a large number keeps the digits
 * it has today instead of gaining a thousands separator.
 */

type ShareT = Translator<"share">;

/** The preview title and the bar on an ask link. */
export function askTitle(t: ShareT): string {
  return t("ask.title");
}

/** What the archive does not know about a photograph; null when it knows it all. */
export function askDescription(
  photo: ArchivePhoto,
  t: ShareT,
  locale: Locale
): string | null {
  const missing = missingFields(photo).map((field) =>
    t(`ask.missing.${field}`)
  );
  return missing.length
    ? t("ask.description", { missing: joinList(missing, "or", locale) })
    : null;
}

/** The message an "ask" share prefills; null when there is nothing to ask. */
export function askShareText(
  photo: ArchivePhoto,
  t: ShareT,
  locale: Locale
): string | null {
  const description = askDescription(photo, t, locale);
  return description ? `${askTitle(t)} ${description}` : null;
}

/**
 * `Title, place, Month YYYY. From the Brava archive.`, with only what is recorded.
 * `tPhotographs` words the heading of an untitled photograph.
 */
export function photoShareText(
  photo: ArchivePhoto,
  t: ShareT,
  tPhotographs: PhotographsTranslator
): string {
  // An untitled photograph's heading is already "Near X": don't say the settlement twice.
  const place = photo.placeName ?? (photo.title ? photo.near?.name : null);
  const facts = [photoHeading(photo, tPhotographs), place, photo.monthYear]
    .filter(Boolean)
    .join(", ");
  return t("photo", { facts });
}

export function filmShareText(
  film: Pick<Film, "displayTitle">,
  t: ShareT
): string {
  return t("film", { title: film.displayTitle });
}

/** `23 photographs · 5 place records`; null when the archive holds neither. */
export function townHoldings(
  summary: Pick<TownStatusSummary, "photographCount" | "entryCount">,
  t: ShareT
): string | null {
  const count = (n: number) => ({ count: n, n: String(n) });
  return (
    [
      summary.photographCount > 0 &&
        t("holdings.photographs", count(summary.photographCount)),
      summary.entryCount > 0 &&
        t("holdings.placeRecords", count(summary.entryCount)),
    ]
      .filter(Boolean)
      .join(" · ") || null
  );
}

export function townShareText(
  summary: Pick<TownStatusSummary, "name" | "photographCount" | "entryCount">,
  t: ShareT
): string {
  const holdings = townHoldings(summary, t);
  return holdings
    ? t("town.withHoldings", { name: summary.name, holdings })
    : t("town.plain", { name: summary.name });
}

/** One sentence and where it leads, for a visitor who arrived from a shared link. */
export interface ArrivalLine {
  text: string;
  href: string;
}

export function photoArrivalLine(
  photo: ArchivePhoto,
  photos: readonly ArchivePhoto[],
  t: ShareT
): ArrivalLine {
  const near = photo.near;
  const others = near
    ? photos.filter((p) => p.id !== photo.id && p.near?.slug === near.slug)
        .length
    : 0;

  if (near && others > 0) {
    return {
      text: t("arrival.photosNear", {
        count: others,
        n: String(others),
        place: near.name,
      }),
      href: photographsHref(near.slug),
    };
  }
  return { text: t("arrival.photo"), href: "/photographs" };
}

export function filmArrivalLine(
  film: Pick<Film, "id">,
  films: readonly Pick<Film, "id">[] | null,
  t: ShareT
): ArrivalLine {
  const others = films?.filter((f) => f.id !== film.id).length ?? 0;
  return {
    text: t("arrival.films", { count: others, n: String(others) }),
    href: "/films",
  };
}

export function townArrivalLine(t: ShareT): ArrivalLine {
  return { text: t("arrival.town"), href: "/settlements" };
}
