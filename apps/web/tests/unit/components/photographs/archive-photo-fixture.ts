import type { ArchivePhoto } from "@/lib/archive-photographs";

export const NOVA_SINTRA = { slug: "nova-sintra", name: "Nova Sintra" };
export const FURNA = { slug: "furna", name: "Furna" };

export function makePhoto(
  id: string,
  overrides: Partial<ArchivePhoto> = {}
): ArchivePhoto {
  return {
    id,
    src: `https://media.nosilha.com/${id}.jpg`,
    alt: `Photo ${id}`,
    title: null,
    description: null,
    near: null,
    // A photograph near a settlement has coordinates; one with no settlement has none
    // unless a test says otherwise.
    located: (overrides.near ?? null) !== null,
    placeName: null,
    credit: null,
    monthYear: null,
    dateLabel: null,
    camera: null,
    category: null,
    identifiablePerson: false,
    missing: { photographer: true, date: true },
    ...overrides,
  };
}
