/**
 * Media Mock Data
 *
 * Mock data for the photo gallery and video content.
 */

import type { MediaItem, GalleryFilters, MediaCategory } from "@/types/media";

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "m1",
    type: "IMAGE",
    url: "https://picsum.photos/id/1018/800/600",
    title: "Nova Sintra Town Square (1960s)",
    description:
      "A rare color photo of the central plaza before the renovation.",
    category: "Historical",
    date: "1965",
    author: "Archive",
  },
  {
    id: "m2",
    type: "IMAGE",
    url: "https://picsum.photos/id/1036/800/600",
    title: "Furna Harbor at Sunset",
    description: "The ferry arriving from Fogo.",
    category: "Heritage",
    date: "2024",
    author: "João Pereira",
  },
  {
    id: "m3",
    type: "IMAGE",
    url: "https://picsum.photos/id/1015/800/600",
    title: "Fajã d'Água Cliffs",
    description: "The dramatic coastline on the western side.",
    category: "Nature",
    date: "2023",
    author: "Maria Silva",
  },
  {
    id: "m4",
    type: "IMAGE",
    url: "https://picsum.photos/id/292/800/600",
    title: "Procession of São João",
    description: "Community members carrying the flag.",
    category: "Event",
    date: "2022",
    author: "Community Upload",
  },
  {
    id: "m5",
    type: "IMAGE",
    url: "https://picsum.photos/id/305/800/600",
    title: "Misty Mountains",
    description: "The eternal fog of Brava covering the peaks.",
    category: "Nature",
    date: "2023",
    author: "Pedro Nunes",
  },
  {
    id: "m6",
    type: "IMAGE",
    url: "https://picsum.photos/id/110/800/600",
    title: "Traditional House in Nossa Senhora do Monte",
    description: "Colonial architecture preserved in the highlands.",
    category: "Heritage",
    date: "2024",
    author: "Ana Gomes",
  },
  // Video Items
  {
    id: "v1",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/id/158/800/450",
    title: "Nos Ilha Podcast Ep. 1: The Departure",
    description:
      "Sr. Antonio recounts his journey leaving Brava in 1978 and his first winter in Boston.",
    category: "Interview",
    date: "Oct 2025",
  },
  {
    id: "v2",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/id/178/800/450",
    title: "Aerial View: Nova Sintra Gardens",
    description:
      "Drone footage of the flower capital of Cape Verde in full bloom.",
    category: "Nature",
    date: "Sep 2025",
  },
  {
    id: "v3",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/id/234/800/450",
    title: "Life in the 1950s: A Grandmother's Tale",
    description:
      "An interview about daily life, water scarcity, and community spirit before modern amenities.",
    category: "Historical",
    date: "Aug 2025",
  },
  {
    id: "v4",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/id/1023/800/450",
    title: "Fajã d'Água Coastline Walk",
    description:
      "A relaxing visual journey along the rugged coast to the natural pools.",
    category: "Nature",
    date: "July 2025",
  },
];

export const MEDIA_CATEGORIES: MediaCategory[] = [
  "Heritage",
  "Historical",
  "Nature",
  "Culture",
  "Event",
  "Interview",
];

// Mock API functions
export const mockMediaApi = {
  getMediaItems: async (filters?: GalleryFilters): Promise<MediaItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let items = [...MOCK_MEDIA_ITEMS];

    if (filters?.category && filters.category !== "All") {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters?.type && filters.type !== "All") {
      items = items.filter((item) => item.type === filters.type);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    return items;
  },

  getMediaById: async (id: string): Promise<MediaItem | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_MEDIA_ITEMS.find((m) => m.id === id) || null;
  },

  getPhotos: async (category?: MediaCategory): Promise<MediaItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let photos = MOCK_MEDIA_ITEMS.filter((m) => m.type === "IMAGE");
    if (category) {
      photos = photos.filter((p) => p.category === category);
    }
    return photos;
  },

  getVideos: async (): Promise<MediaItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_MEDIA_ITEMS.filter((m) => m.type === "VIDEO");
  },
};
