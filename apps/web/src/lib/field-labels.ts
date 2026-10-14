import type { Translator } from "@/i18n/types";

/**
 * What a field is called when a person reads it. Spec 034 FR-004.
 *
 * Every "not recorded" question sends the sheet a field key, and the composed message
 * opens "Asked about: <field>". Those keys are code — `photographerCredit`,
 * `latitude`, `conditionStatus` — and a curator reading the queue should not have to
 * translate them. This is the one place that turns a key into a phrase.
 *
 * The phrases come from the `fields` namespace, keyed by field key (spec 041
 * FR-004). Pass a translator for that namespace, from the hook or from
 * `getTranslations`.
 */
export type FieldTranslator = Translator<"fields">;

type FieldKey = Parameters<FieldTranslator>[0];

/** Every field key with a phrase in the `fields` namespace. */
const FIELD_KEYS: ReadonlySet<string> = new Set<FieldKey>([
  // Place record grid
  "settlement",
  "category",
  "established",
  "coordinates",
  "conditionStatus",
  "festival",
  "photographer",
  "openingHours",
  "architect",
  "rating",
  "phoneNumber",
  "email",
  "website",
  "cuisine",
  "amenities",
  // Photograph detail
  "photographerCredit",
  "title",
  "latitude",
  "locationName",
  "dateTaken",
  // Film page (spec 038)
  "filmmaker",
  "placeId",
  // Settlement
  "population",
  "elevation",
  "founded",
  "highlights",
  // Cross-cutting
  "photograph",
  "correction",
]);

/**
 * A field key as a phrase. An unmapped key falls back to its words rather than
 * disappearing — a curator reading "date taken" has lost nothing, and a key nobody
 * mapped is still legible.
 */
export function fieldPhrase(key: string, t: FieldTranslator): string {
  if (FIELD_KEYS.has(key)) return t(key as FieldKey);

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
}
