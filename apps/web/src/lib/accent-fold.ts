/**
 * Lower-cases and strips diacritics so the town picker and map search match
 * "faja" against "Fajã d'Água". Strips every Unicode `Diacritic`: combining
 * accents, and spacing ones such as the `´` often typed for an apostrophe.
 * Apostrophes and spaces are left untouched.
 */
export function foldAccents(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
