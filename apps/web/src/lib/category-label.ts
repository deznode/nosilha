/**
 * How the archive names a category on screen. Spec 034 FR-014.
 *
 * `Hotel` is the category the data carries; "Stay" is what the archive calls it, on
 * the nav pill, the screen and the record. Every surface that prints a category name
 * reads from here, so a record's hero cannot say "Stay" while its field grid says
 * "Hotel".
 */
const CATEGORY_LABELS: Record<string, string> = { Hotel: "Stay" };

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
