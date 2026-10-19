import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import { categoryLabel } from "@/lib/category-label";
import { formatCoordinates } from "@/lib/coordinates";
import { words } from "@/lib/copy/number-words";
import { trimmed } from "@/lib/text";
import type { DirectoryEntry } from "@/types/directory";

/**
 * A place record's field grid, and the question each empty row asks. Spec 034 FR-013,
 * FR-016.
 *
 * <p>The grid mirrors `FieldGuard.completeness` in the API, row for row and in the
 * same order, because the segmented bar and the "six of nine fields recorded"
 * sentence count the rows this file renders. Two implementations of one rule is a
 * real cost; the alternative is an endpoint that ships the whole grid, which is spec
 * 034 FR-016's open question. Until then `completenessSentence` prefers the API's own
 * numbers, so a disagreement shows up in the sentence rather than being papered
 * over.</p>
 *
 * <p>Ratings are guarded on the category, not hidden by the template: a stray rating
 * on a heritage record is data that should not surface at all.</p>
 */

const RATING_CATEGORIES = new Set(["Hotel"]);
const CONTACT_CATEGORIES = new Set(["Hotel", "Restaurant"]);
const OPENING_HOURS_CATEGORIES = new Set([
  "Hotel",
  "Restaurant",
  "Heritage",
  "Church",
]);
const CUISINE_CATEGORIES = new Set(["Restaurant"]);
const AMENITIES_CATEGORIES = new Set(["Hotel"]);
const HERITAGE_CATEGORIES = new Set(["Heritage", "Church"]);

/** A credit that answers the question without naming anyone. */
const CREDIT_NOT_KNOWN = "not known";

export interface PlaceField {
  /** Matches the key `Completeness.missingFields` uses. */
  key: string;
  label: string;
  /** The recorded value, or null when the archive does not hold it. */
  value: string | null;
  /** Rendered in the mono face, as coordinates are. */
  mono?: boolean;
  /** Asked when `value` is null. */
  question: string;
  /**
   * Whether this row is part of the completeness denominator.
   *
   * `FieldGuard` splits two rules that look alike and are not: `supports` decides what
   * a category is *counted* on, `shows` decides what is *displayed* — eligible, or
   * already carrying a value. `casa-eugenio-tavares` is the case that forces the
   * split: a Heritage record with a real phone, email and website, which must be shown
   * without putting contact fields in the denominator of every public square. A row
   * with `counted: false` renders and asks nothing of the bar.
   */
  counted: boolean;
}

/**
 * What the grid's labels, questions and sentence are written from (spec 041 FR-004):
 * the `identify.placeFields` messages, the category labels, and the page's locale for
 * number words.
 */
export interface PlaceFieldCopy {
  t: Translator<"identify">;
  categories: Translator<"categories">;
  locale: Locale;
}

type PlaceFieldKey =
  | "settlement"
  | "category"
  | "established"
  | "coordinates"
  | "conditionStatus"
  | "festival"
  | "photographer"
  | "openingHours"
  | "architect"
  | "rating"
  | "phoneNumber"
  | "email"
  | "website"
  | "cuisine"
  | "amenities";

function text(value: unknown): string | null {
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? trimmed(value) : null;
}

function list(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const items = value
    .map((item) => text(item))
    .filter((item): item is string => !!item);
  return items.length ? items.join(", ") : null;
}

/** Builds rows with labels and questions in `copy`'s language. */
function rowsIn(copy: PlaceFieldCopy) {
  const field = (
    key: PlaceFieldKey,
    value: string | null,
    { mono = false, counted = true }: { mono?: boolean; counted?: boolean } = {}
  ): PlaceField => ({
    key,
    label: copy.t(`placeFields.labels.${key}`),
    value,
    mono,
    question: copy.t(`placeFields.questions.${key}`),
    counted,
  });

  /**
   * A row the category is not counted on, present only because the record holds a
   * value. Empty means nothing to show and nothing to ask.
   */
  const shownOnly = (key: PlaceFieldKey, value: string | null): PlaceField[] =>
    value === null ? [] : [field(key, value, { counted: false })];

  return { field, shownOnly };
}

/**
 * The record's grid, in the order the prototype draws it.
 *
 * `details` is a discriminated union on the entry, but each branch's shape is only
 * knowable per category, so the reads go through a widened view rather than a cast
 * per branch.
 */
export function placeFields(
  entry: DirectoryEntry,
  copy: PlaceFieldCopy
): PlaceField[] {
  const { field, shownOnly } = rowsIn(copy);
  const category = entry.category;
  const details = (entry.details ?? {}) as Record<string, unknown>;

  const rows: PlaceField[] = [];

  rows.push(field("settlement", text(entry.town)));
  // The label the archive uses, not the raw category: a Stay record's hero says
  // "Stay", and its field grid must not say "Hotel".
  rows.push(field("category", text(categoryLabel(category, copy.categories))));

  if (HERITAGE_CATEGORIES.has(category)) {
    rows.push(field("established", text(details.established)));
  }

  // 0,0 is the default an unplaced submission carries, not a point in the Atlantic
  // off Ghana, so it counts as no coordinates.
  const placed = !(entry.latitude === 0 && entry.longitude === 0);
  rows.push(
    field(
      "coordinates",
      placed ? formatCoordinates(entry.latitude, entry.longitude) : null,
      { mono: true }
    )
  );

  if (HERITAGE_CATEGORIES.has(category)) {
    rows.push(field("conditionStatus", text(details.conditionStatus)));
    rows.push(field("festival", text(details.festival)));
  }

  // Only a record with a hero can name a photographer; without one the row would be
  // asking about a photograph that does not exist.
  if (entry.heroImage) {
    const credit = text(entry.heroImage.photographerCredit);
    rows.push(
      field(
        "photographer",
        credit && credit.toLowerCase() !== CREDIT_NOT_KNOWN ? credit : null
      )
    );
  }

  if (OPENING_HOURS_CATEGORIES.has(category)) {
    rows.push(field("openingHours", text(details.openingHours)));
  } else {
    rows.push(...shownOnly("openingHours", text(details.openingHours)));
  }
  if (HERITAGE_CATEGORIES.has(category)) {
    rows.push(field("architect", text(details.architect)));
  }
  if (RATING_CATEGORIES.has(category)) {
    rows.push(
      field("rating", entry.rating != null ? String(entry.rating) : null)
    );
  }
  const phone = text(entry.phoneNumber ?? details.phoneNumber);
  const email = text(entry.email);
  const website = text(entry.website);
  if (CONTACT_CATEGORIES.has(category)) {
    rows.push(field("phoneNumber", phone));
    rows.push(field("email", email));
    rows.push(field("website", website));
  } else {
    // Shown because this record holds them, not counted against every record of its
    // category. A public square is not incomplete for having no telephone.
    rows.push(...shownOnly("phoneNumber", phone));
    rows.push(...shownOnly("email", email));
    rows.push(...shownOnly("website", website));
  }

  const cuisine = list(details.cuisine);
  const amenities = list(details.amenities);
  if (CUISINE_CATEGORIES.has(category)) {
    rows.push(field("cuisine", cuisine));
  } else {
    rows.push(...shownOnly("cuisine", cuisine));
  }
  if (AMENITIES_CATEGORIES.has(category)) {
    rows.push(field("amenities", amenities));
  } else {
    rows.push(...shownOnly("amenities", amenities));
  }

  return rows;
}

/**
 * "six of nine fields recorded".
 *
 * Prefers the API's own count so the sentence states what the backend derived, and
 * falls back to the rendered grid when a cached older response carries none.
 */
export function completenessSentence(
  entry: DirectoryEntry,
  copy: PlaceFieldCopy
): string {
  const rows = placeFields(entry, copy);
  const documented =
    entry.completeness?.documented ??
    rows.filter((f) => f.value !== null).length;
  const total = entry.completeness?.total ?? rows.length;

  if (documented === 0) return copy.t("placeFields.nothingRecorded");
  // `campo` is masculine in Portuguese.
  return copy.t("placeFields.completeness", {
    total,
    documentedWords: words(documented, copy.locale),
    totalWords: words(total, copy.locale),
  });
}

/**
 * The rows the completeness bar and sentence count — the API's denominator, not
 * everything the page renders.
 */
export function countedFields(
  entry: DirectoryEntry,
  copy: PlaceFieldCopy
): PlaceField[] {
  return placeFields(entry, copy).filter((row) => row.counted);
}
