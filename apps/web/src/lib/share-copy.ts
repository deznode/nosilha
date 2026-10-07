import {
  missingFields,
  photoHeading,
  photographsHref,
  type ArchivePhoto,
  type MissingField,
} from "@/lib/archive-photographs";
import { joinList, plural } from "@/lib/copy/number-words";
import type { Film } from "@/lib/films";
import type { TownStatusSummary } from "@/types/town";

/**
 * Every sentence a share sends or a share arrival reads. Spec 040 FR-002, FR-004,
 * FR-006. Kept in one place so the preview, the prefilled message and the page say
 * the same thing.
 */

const ARCHIVE = "the Brava archive";

/** The preview title and the bar on an ask link. */
export const ASK_TITLE = "Do you recognise this photograph?";

const ASK_WORDS: Record<MissingField, string> = {
  photographer: "who took it",
  place: "where it was taken",
  date: "when it was taken",
};

/** What the archive does not know about a photograph; null when it knows it all. */
export function askDescription(photo: ArchivePhoto): string | null {
  const missing = missingFields(photo).map((field) => ASK_WORDS[field]);
  return missing.length
    ? `The Brava archive does not know ${joinList(missing, "or")}.`
    : null;
}

/** The message an "ask" share prefills; null when there is nothing to ask. */
export function askShareText(photo: ArchivePhoto): string | null {
  const description = askDescription(photo);
  return description ? `${ASK_TITLE} ${description}` : null;
}

/** `Title, place, Month YYYY. From the Brava archive.`, with only what is recorded. */
export function photoShareText(photo: ArchivePhoto): string {
  // An untitled photograph's heading is already "Near X": don't say the settlement twice.
  const place = photo.placeName ?? (photo.title ? photo.near?.name : null);
  const facts = [photoHeading(photo), place, photo.monthYear]
    .filter(Boolean)
    .join(", ");
  return `${facts}. From ${ARCHIVE}.`;
}

export function filmShareText(film: Pick<Film, "displayTitle">): string {
  return `${film.displayTitle}. A film in ${ARCHIVE}.`;
}

function counted(n: number, one: string, many: string): string | null {
  return n > 0 ? `${n} ${plural(n, one, many)}` : null;
}

/** `23 photographs · 5 place records`; null when the archive holds neither. */
export function townHoldings(
  summary: Pick<TownStatusSummary, "photographCount" | "entryCount">
): string | null {
  return (
    [
      counted(summary.photographCount, "photograph", "photographs"),
      counted(summary.entryCount, "place record", "place records"),
    ]
      .filter(Boolean)
      .join(" · ") || null
  );
}

export function townShareText(
  summary: Pick<TownStatusSummary, "name" | "photographCount" | "entryCount">
): string {
  const holdings = townHoldings(summary);
  return holdings
    ? `${summary.name} in ${ARCHIVE}: ${holdings}.`
    : `${summary.name} in ${ARCHIVE}.`;
}

/** One sentence and where it leads, for a visitor who arrived from a shared link. */
export interface ArrivalLine {
  text: string;
  href: string;
}

export function photoArrivalLine(
  photo: ArchivePhoto,
  photos: readonly ArchivePhoto[]
): ArrivalLine {
  const near = photo.near;
  const others = near
    ? photos.filter((p) => p.id !== photo.id && p.near?.slug === near.slug)
        .length
    : 0;
  const more = counted(others, "more photograph", "more photographs");

  if (near && more) {
    return {
      text: `From ${ARCHIVE} · ${more} near ${near.name}`,
      href: photographsHref(near.slug),
    };
  }
  return {
    text: `From ${ARCHIVE}, a community record of Brava Island`,
    href: "/photographs",
  };
}

export function filmArrivalLine(
  film: Pick<Film, "id">,
  films: readonly Pick<Film, "id">[] | null
): ArrivalLine {
  const others = films?.filter((f) => f.id !== film.id).length ?? 0;
  const more = counted(others, "more film", "more films") ?? "more films";
  return { text: `From ${ARCHIVE} · ${more}`, href: "/films" };
}

export const TOWN_ARRIVAL_LINE: ArrivalLine = {
  text: `Part of ${ARCHIVE} · all settlements`,
  href: "/settlements",
};
