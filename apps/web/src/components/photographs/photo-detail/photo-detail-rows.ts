import { formatCoordinates } from "@/lib/coordinates";
import {
  photoCredit,
  photoDateLabel,
  photoIsLocated,
  trimmed,
} from "@/lib/photo-facts";
import {
  isPublicUserUploadMedia,
  type PhotoSequence,
  type PublicGalleryMedia,
} from "@/types/gallery";

/**
 * A photograph's metadata column. Spec 034 FR-010.
 *
 * Two blocks, deliberately separate: what the archive knows, and what it is asking
 * for. A single grid of fields with blanks in it reads as an incomplete form; two
 * blocks read as a record and a request.
 */

export interface KnownRow {
  key: string;
  label: string;
  value: string;
  /** Where the value came from, e.g. "· read from the file". */
  note?: string;
  mono?: boolean;
}

export interface AskRow {
  /** The field the suggestion is about. */
  key: string;
  label: string;
  question: string;
}

/** What the archive holds about this record, in the prototype's order. */
export function knownRows(media: PublicGalleryMedia): KnownRow[] {
  const rows: KnownRow[] = [];
  const upload = isPublicUserUploadMedia(media) ? media : null;

  const date = photoDateLabel(media);
  if (date) {
    rows.push({
      key: "date",
      label: "Date taken",
      value: date,
      // Only a date read from EXIF came off the file; one a person supplied did not,
      // and saying so would dress a recollection as a measurement.
      note: trimmed(upload?.dateTaken)
        ? "· read from the file"
        : "· as told to us",
    });
  }

  const camera = [trimmed(upload?.cameraMake), trimmed(upload?.cameraModel)]
    .filter(Boolean)
    .join(" ");
  if (camera) rows.push({ key: "camera", label: "Camera", value: camera });

  const coordinates = formatCoordinates(upload?.latitude, upload?.longitude);
  if (coordinates) {
    rows.push({
      key: "coordinates",
      label: "Coordinates",
      value: coordinates,
      note: "· from the file",
      mono: true,
    });
  }

  const place = trimmed(upload?.locationName);
  if (place) rows.push({ key: "place", label: "Place", value: place });

  const category = trimmed(media.category);
  if (category)
    rows.push({ key: "category", label: "Category", value: category });

  const credit = photoCredit(media);
  if (credit)
    rows.push({ key: "photographer", label: "Photographer", value: credit });

  if (rows.length === 0) {
    rows.push({
      key: "everything",
      label: "Everything",
      value: "nothing recorded but the file itself",
    });
  }

  return rows;
}

/** What the archive is asking for, each question opening the identify sheet. */
export function askRows(media: PublicGalleryMedia): AskRow[] {
  const rows: AskRow[] = [];
  const upload = isPublicUserUploadMedia(media) ? media : null;

  if (!photoCredit(media)) {
    rows.push({
      key: "photographerCredit",
      label: "Photographer",
      question: "Do you know who took this?",
    });
  }
  if (!trimmed(media.title)) {
    rows.push({ key: "title", label: "Title", question: "Give it a name" });
  }

  if (upload) {
    if (!photoIsLocated(media)) {
      rows.push({
        key: "latitude",
        label: "Place",
        question: "Where was this taken?",
      });
    } else if (!trimmed(upload.locationName)) {
      rows.push({
        key: "locationName",
        label: "Place name",
        question: "The file gives a point. What is this place called?",
      });
    }

    if (!photoDateLabel(media)) {
      rows.push({
        key: "dateTaken",
        label: "Date",
        question: "Roughly when was it taken?",
      });
    }
  }

  return rows;
}

/**
 * Where this record sits among the located photographs.
 *
 * An unlocated record has no position in that sequence — it is not missing from it,
 * it is not in it — so the line says what is true rather than "0 of 11".
 */
export function positionLine(
  media: PublicGalleryMedia,
  sequence: PhotoSequence | null
): string {
  if (!photoIsLocated(media) || !sequence || sequence.position == null) {
    return "This one has no place recorded";
  }

  return `Photograph ${sequence.position} of ${sequence.total} with coordinates · use the arrow keys`;
}

/** The map link, present only when there is a pin to select. */
export function showOnMapLink(media: PublicGalleryMedia): string | null {
  if (!photoIsLocated(media)) return null;

  const params = new URLSearchParams({
    mode: "photographs",
    sel: `p:${media.id}`,
  });
  return `/map?${params.toString()}`;
}
