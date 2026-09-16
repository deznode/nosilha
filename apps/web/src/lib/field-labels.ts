/**
 * What a field is called when a person reads it. Spec 034 FR-004.
 *
 * Every "not recorded" question sends the sheet a field key, and the composed message
 * opens "Asked about: <field>". Those keys are code — `photographerCredit`,
 * `latitude`, `conditionStatus` — and a curator reading the queue should not have to
 * translate them. This is the one place that turns a key into a phrase.
 */
const FIELD_PHRASES: Record<string, string> = {
  // Place record grid
  settlement: "which settlement this is in",
  category: "what kind of place this is",
  established: "when it was established",
  coordinates: "where exactly it is",
  conditionStatus: "its present condition",
  festival: "its festival",
  photographer: "who took the photograph",
  openingHours: "its opening hours",
  architect: "who built it",
  rating: "a rating",
  phoneNumber: "its telephone number",
  email: "its email address",
  website: "its website",
  cuisine: "what they cook",
  amenities: "what a room comes with",
  // Photograph detail
  photographerCredit: "who took this photograph",
  title: "a title for this photograph",
  latitude: "where this photograph was taken",
  locationName: "what this place is called",
  dateTaken: "roughly when this was taken",
  // Settlement
  population: "how many people live there",
  elevation: "how high above the sea it is",
  founded: "when the town was founded",
  highlights: "what a visitor should walk to first",
  // Cross-cutting
  photograph: "a photograph",
  correction: "a correction to this record",
};

/**
 * A field key as a phrase. An unmapped key falls back to its words rather than
 * disappearing — a curator reading "date taken" has lost nothing, and a key nobody
 * mapped is still legible.
 */
export function fieldPhrase(key: string): string {
  const mapped = FIELD_PHRASES[key];
  if (mapped) return mapped;

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
}
