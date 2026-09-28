/**
 * Lower-cases and strips diacritics so the town picker's search matches
 * "faja" against "Fajã d'Água". Non-letter characters (apostrophes, spaces)
 * are left untouched.
 */
export function foldAccents(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
