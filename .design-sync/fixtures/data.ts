// Shared preview fixtures.
//
// Lives OUTSIDE .design-sync/previews/ on purpose — that directory is scanned
// per component name, so a non-component file there reads as an orphan.
// Preview files import from here with a relative path; esbuild bundles it.
//
// Content is ported from apps/web/src/lib/mock-api.ts so cards show the real
// archive (Brava place names, real Kriolu/Portuguese orthography) rather than
// lorem ipsum. Photographs are downscaled from apps/web/public/images —
// regenerate with the sharp snippet in .design-sync/NOTES.md.
//
// The empty-archive bias is deliberate. Per docs/10-product/theme-palette-brief.md
// §4.4 the archive is thin — 6 of 8 directory entries have no photograph — so
// the fixtures below over-represent the missing-image and zero-item states.
// Those are the cases a new palette has to survive.

import images from "./images.json";
import type { DirectoryEntry } from "@/types/directory";

export const PHOTO_LANDSCAPE: string = images.LANDSCAPE;
export const PHOTO_HERITAGE: string = images.HERITAGE;
export const PHOTO_PORTRAIT: string = images.PORTRAIT;

/* ── Directory entries ─────────────────────────────────────────────────── */

/** Hotel with a photograph — the minority case in the real archive. */
export const ENTRY_WITH_PHOTO: DirectoryEntry = {
  id: "1",
  slug: "djababas-eco-lodge",
  name: "Djabraba's Eco-Lodge",
  category: "Hotel",
  imageUrl: PHOTO_LANDSCAPE,
  town: "Nova Sintra",
  latitude: 14.871,
  longitude: -24.712,
  description:
    "An eco-lodge offering sustainable mountain accommodation with traditional Cape Verdean hospitality and stunning views of the volcanic landscape.",
  tags: ["eco-lodge", "sustainable", "mountain", "nova-sintra"],
  contentActions: null,
  rating: 4.8,
  reviewCount: 120,
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-15T14:30:00Z",
  details: {
    phoneNumber: "+238 555 5678",
    amenities: ["Eco-Tourism", "Mountain Views", "Traditional Architecture"],
  },
};

/** Heritage site WITHOUT a photograph — the dominant case (brief §6 case 1). */
export const ENTRY_NO_PHOTO: DirectoryEntry = {
  id: "7",
  slug: "casa-eugenio-tavares",
  name: "Casa Eugénio Tavares",
  category: "Heritage",
  imageUrl: null,
  town: "Nova Sintra",
  latitude: 14.8681,
  longitude: -24.7183,
  description:
    "The former home of Eugénio Tavares, Brava's most celebrated poet and the author of many of the mornas still sung across the islands.",
  tags: ["poet", "morna", "nova-sintra"],
  contentActions: null,
  rating: null,
  reviewCount: 0,
  createdAt: "2024-01-07T10:00:00Z",
  updatedAt: "2024-01-21T14:30:00Z",
  details: null,
};

/** Second no-photo entry, different category, so category colour is testable. */
export const ENTRY_NO_PHOTO_BEACH: DirectoryEntry = {
  id: "5",
  slug: "praia-de-faja-dagua",
  name: "Praia de Fajã d'Água",
  category: "Beach",
  imageUrl: null,
  town: "Fajã d'Água",
  latitude: 14.8564,
  longitude: -24.7361,
  description:
    "A black-sand bay ringed by cliffs on Brava's western shore, reached by the road down through the valley.",
  tags: ["black-sand", "swimming", "faja-dagua"],
  contentActions: null,
  rating: 4.5,
  reviewCount: 12,
  createdAt: "2024-01-05T10:00:00Z",
  updatedAt: "2024-01-19T14:30:00Z",
  details: null,
};

/** Restaurant with a photo and a rating — exercises the price/rating row. */
export const ENTRY_RESTAURANT: DirectoryEntry = {
  id: "4",
  slug: "nos-raiz",
  name: "Nós Raiz",
  category: "Restaurant",
  imageUrl: PHOTO_HERITAGE,
  town: "Nova Sintra",
  latitude: 14.8692,
  longitude: -24.6951,
  description:
    "Home cooking from Brava and the wider archipelago — cachupa, grilled fish, and whatever came up from Fajã that morning.",
  tags: ["cachupa", "seafood", "nova-sintra"],
  contentActions: null,
  rating: 4.7,
  reviewCount: 43,
  createdAt: "2024-01-04T10:00:00Z",
  updatedAt: "2024-01-18T14:30:00Z",
  details: {
    phoneNumber: "+238 285 1122",
    openingHours: "Tue–Sun, 12:00–22:00",
    cuisine: ["Cape Verdean", "Seafood"],
  },
};

/**
 * The mixed grid from brief §6 case 2: photographs sitting next to
 * placeholders. Ordered so a placeholder is never last, which is where the
 * "broken load" reading is strongest.
 */
export const ENTRY_GRID: DirectoryEntry[] = [
  ENTRY_WITH_PHOTO,
  ENTRY_NO_PHOTO,
  ENTRY_RESTAURANT,
  ENTRY_NO_PHOTO_BEACH,
];

/* ── Filters ───────────────────────────────────────────────────────────── */

export const CATEGORIES = [
  "Heritage",
  "Nature",
  "Beach",
  "Hotel",
  "Restaurant",
] as const;

/* ── Gallery ───────────────────────────────────────────────────────────── */

import type { MediaItem } from "@/types/media";
import type {
  PublicGalleryMedia,
  TimelineResponse,
} from "@/types/gallery";

const photo = (
  id: string,
  title: string,
  url: string,
  category: string,
  extra: Partial<MediaItem> = {},
): MediaItem => ({
  id,
  type: "IMAGE",
  url,
  thumbnailUrl: url,
  title,
  category: category as MediaItem["category"],
  source: "curated",
  ...extra,
});

/**
 * Every gallery item in the real archive is dated 2026 (brief §4.4), so the
 * fixtures do not pretend to a deep back catalogue.
 */
export const GALLERY_PHOTOS: MediaItem[] = [
  photo("g1", "Fajã d'Água from the cliff road", PHOTO_LANDSCAPE, "Landscape", {
    date: "2026-02-11",
    locationName: "Fajã d'Água",
    photographerCredit: "Nos Ilha archive",
  }),
  photo("g2", "Igreja Nossa Senhora do Monte", PHOTO_HERITAGE, "Heritage", {
    date: "2026-01-30",
    locationName: "Nossa Senhora do Monte",
    photographerCredit: "Nos Ilha archive",
  }),
  photo("g3", "Eugénio Tavares", PHOTO_PORTRAIT, "People", {
    date: "2026-03-02",
    locationName: "Nova Sintra",
    archiveSource: "Family collection",
  }),
  photo("g4", "The bay at first light", PHOTO_LANDSCAPE, "Nature", {
    date: "2026-03-19",
    locationName: "Fajã d'Água",
  }),
];

export const GALLERY_VIDEOS: MediaItem[] = [
  {
    id: "v1",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=example1",
    thumbnailUrl: PHOTO_LANDSCAPE,
    title: "Morna at the Nova Sintra bandstand",
    category: "Culture",
    date: "2026-04-02",
    author: "Brava Cultural Association",
    duration: 428,
    source: "curated",
    featured: true,
  },
  {
    id: "v2",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=example2",
    thumbnailUrl: PHOTO_HERITAGE,
    title: "Walking the Fajã d'Água road",
    category: "Landscape",
    date: "2026-04-15",
    author: "Nos Ilha archive",
    duration: 902,
    source: "curated",
  },
  {
    id: "v3",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=example3",
    thumbnailUrl: PHOTO_PORTRAIT,
    title: "Nho Raul Pina remembers",
    category: "People",
    date: "2026-05-01",
    author: "Nos Ilha archive",
    duration: 1560,
    source: "curated",
  },
];

const galleryMedia = (
  id: string,
  title: string,
  url: string,
): PublicGalleryMedia =>
  ({
    id,
    title,
    description: null,
    category: "Heritage",
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: title,
    createdAt: "2026-02-11T09:00:00Z",
    publicUrl: url,
    locationName: "Fajã d'Água",
    photographerCredit: "Nos Ilha archive",
  }) as PublicGalleryMedia;

export const FEATURED_PHOTO = galleryMedia(
  "f1",
  "Fajã d'Água from the cliff road",
  PHOTO_LANDSCAPE,
);

/**
 * Brief §6 case 5 — the timeline with empty eras. Three of four buckets have
 * zero items, which is the real shape of the archive today.
 */
export const TIMELINE_SPARSE: TimelineResponse = {
  totalCount: 26,
  groups: [
    { decade: "pre-1975", label: "Before 1975", count: 0, samplePhotos: [] },
    { decade: "1975-1990", label: "1975–1990", count: 0, samplePhotos: [] },
    { decade: "1990-2010", label: "1990–2010", count: 0, samplePhotos: [] },
    {
      decade: "2010-plus",
      label: "2010 onwards",
      count: 26,
      samplePhotos: [
        FEATURED_PHOTO,
        galleryMedia("f2", "Igreja Nossa Senhora do Monte", PHOTO_HERITAGE),
        galleryMedia("f3", "Eugénio Tavares", PHOTO_PORTRAIT),
      ],
    },
  ],
};

/** Every era empty — what the timeline looked like before the 2026 intake. */
export const TIMELINE_EMPTY: TimelineResponse = {
  totalCount: 0,
  groups: TIMELINE_SPARSE.groups.map((g) => ({
    ...g,
    count: 0,
    samplePhotos: [],
  })),
};
