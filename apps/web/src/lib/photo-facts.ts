import { trimmed } from "@/lib/text";
import {
  isPublicUserUploadMedia,
  type PublicGalleryMedia,
} from "@/types/gallery";

/**
 * What one archive record carries and what it is missing. Spec 034 FR-006, FR-009,
 * FR-010.
 *
 * Three screens render the same record — the home row, a photographs tile and the
 * detail column — and they must agree about what is missing, so every one of them
 * derives from here rather than re-reading the fields.
 *
 * The prototype hard-codes "no photographer" on every tile because nothing in the
 * archive carried a credit when it was drawn. Here the pill follows the record, so it
 * disappears the day a credit arrives.
 */

/** The aspect a tile reserves when the row predates the dimension backfill. */
export const ASPECT_FALLBACK = "388 / 300";

/** A credit that answers the question without naming anyone. */
const CREDIT_NOT_KNOWN = "not known";

export interface PhotoTitle {
  text: string;
  /** Renders italic and in secondary ink, so a placeholder never reads as a name. */
  untitled: boolean;
}

/** A record's title, or the placeholder that says it has none. */
export function photoTitle(media: PublicGalleryMedia): PhotoTitle {
  const title = trimmed(media.title);
  return title
    ? { text: title, untitled: false }
    : { text: "Untitled", untitled: true };
}

/** The name the file arrived under; null for a film, which is not a file. */
export function photoFilename(media: PublicGalleryMedia): string | null {
  return isPublicUserUploadMedia(media) ? trimmed(media.originalName) : null;
}

/**
 * Formatted in `en-US` at UTC, not the reader's locale: the label is a fact read off
 * the file, and it must not shift a day because of where it is read.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * When the photograph was taken: the date read from the file, else the approximate
 * date exactly as a person wrote it ("sometime in the sixties"), else null.
 */
export function photoDateLabel(media: PublicGalleryMedia): string | null {
  if (!isPublicUserUploadMedia(media)) return null;

  const taken = trimmed(media.dateTaken);
  if (taken) {
    const parsed = new Date(taken);
    if (!Number.isNaN(parsed.getTime())) return DATE_FORMAT.format(parsed);
  }
  return trimmed(media.approximateDate);
}

/** Whether the record carries both coordinates. Films never do. */
export function photoIsLocated(media: PublicGalleryMedia): boolean {
  if (!isPublicUserUploadMedia(media)) return false;
  return media.latitude != null && media.longitude != null;
}

/** The credit — a photographer for an upload, an author for a film — or null. */
export function photoCredit(media: PublicGalleryMedia): string | null {
  const credit = isPublicUserUploadMedia(media)
    ? trimmed(media.photographerCredit)
    : trimmed(media.author);

  if (!credit) return null;
  return credit.toLowerCase() === CREDIT_NOT_KNOWN ? null : credit;
}

/**
 * The CSS `aspect-ratio` a tile reserves before its image loads, so the masonry
 * column never reflows (FR-019). A zero or absent dimension falls back rather than
 * dividing by it.
 */
export function photoAspectRatio(media: PublicGalleryMedia): string {
  if (!isPublicUserUploadMedia(media)) return ASPECT_FALLBACK;

  const { width, height } = media;
  if (!width || !height || width <= 0 || height <= 0) return ASPECT_FALLBACK;
  return `${width} / ${height}`;
}

/**
 * Whether the record shows an identifiable person nobody has vouched for (FR-022).
 * Such a record is listed where it can be identified and kept out of every
 * promotional slot.
 */
export function photoIsIdentifiablePerson(media: PublicGalleryMedia): boolean {
  return media.identifiablePerson === true;
}

export interface PhotoFacts {
  title: PhotoTitle;
  filename: string | null;
  date: string | null;
  credit: string | null;
  located: boolean;
  aspectRatio: string;
  /** Ochre pills, in the prototype's order. */
  missing: string[];
  /** Neutral pills: what the record does carry. */
  known: string[];
}

/**
 * Every pill and label one record needs.
 *
 * A film is never asked for a place — films carry no coordinates by design, so
 * "no place" would be a gap that can never be filled rather than a question.
 */
export function photoFacts(media: PublicGalleryMedia): PhotoFacts {
  const title = photoTitle(media);
  const date = photoDateLabel(media);
  const credit = photoCredit(media);
  const located = photoIsLocated(media);
  const category = trimmed(media.category);
  const isUpload = isPublicUserUploadMedia(media);

  const missing: string[] = [];
  if (title.untitled) missing.push("no title");
  if (!credit) missing.push("no photographer");
  if (isUpload && !located) missing.push("no place");
  if (isUpload && !date) missing.push("no date");
  if (!category) missing.push("no category");

  const known: string[] = [];
  if (date) known.push(date);
  if (category) known.push(category);

  return {
    title,
    filename: photoFilename(media),
    date,
    credit,
    located,
    aspectRatio: photoAspectRatio(media),
    missing,
    known,
  };
}
