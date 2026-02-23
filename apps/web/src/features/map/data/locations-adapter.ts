import type { DirectoryEntry } from "@/types/directory";
import {
  getCategoryById,
  getCategoryColor,
  getCategoryIcon,
  type CategoryType,
} from "./categories";
import type { Location } from "./types";

/**
 * Maps 5 backend STI categories to the original 10-category BravaMap system.
 * Uses `map:` prefixed tags to restore the original category.
 * Falls back to a simple 5→5 mapping when no `map:` tag is present.
 */
const BACKEND_TO_MAP_FALLBACK: Record<string, CategoryType> = {
  Restaurant: "Restaurant",
  Hotel: "Accommodation",
  Beach: "Beach",
  Heritage: "Historic",
  Nature: "Nature",
};

/**
 * Unsplash placeholder images per category.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  Town: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=300&fit=crop",
  Nature:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
  Beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  Viewpoint:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  Trail:
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
  Church:
    "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400&h=300&fit=crop",
  Historic:
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop",
  Restaurant:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
  Port: "https://images.unsplash.com/photo-1500930287596-c1ecaa210c15?w=400&h=300&fit=crop",
  Accommodation:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
};

/**
 * Generates a deterministic pseudo-random number from a string seed.
 * Used for consistent rating/review values across renders.
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Extracts the BravaMap category from a DirectoryEntry's tags.
 * Looks for `map:` prefixed tags (e.g., "map:Town", "map:Viewpoint").
 */
function resolveCategory(entry: DirectoryEntry): Exclude<CategoryType, "All"> {
  const mapTag = entry.tags?.find((tag) => tag.startsWith("map:"));
  if (mapTag) {
    const mapCategory = mapTag.slice(4) as CategoryType;
    if (getCategoryById(mapCategory)) {
      return mapCategory as Exclude<CategoryType, "All">;
    }
  }
  return (
    (BACKEND_TO_MAP_FALLBACK[entry.category] as Exclude<CategoryType, "All">) ??
    "Nature"
  );
}

/**
 * Transforms an array of DirectoryEntry objects from the Spring Boot API
 * into Location objects that BravaMap expects.
 */
export function transformEntries(entries: DirectoryEntry[]): Location[] {
  return entries
    .filter((entry) => entry.latitude != null && entry.longitude != null)
    .map((entry) => {
      const category = resolveCategory(entry);
      const icon = getCategoryIcon(category);
      const color = getCategoryColor(category);
      const rand = seededRandom(entry.id);

      return {
        id: entry.id,
        name: entry.name,
        namePortuguese: entry.name, // Backend doesn't have separate Portuguese name
        category,
        description: entry.description || "",
        coordinates: {
          lat: entry.latitude,
          lng: entry.longitude,
        },
        elevation: 0,
        rating: entry.rating ?? 4.2 + rand * 0.8, // 4.2–5.0
        reviews: entry.reviewCount || Math.floor(20 + rand * 130), // 20–149
        image:
          entry.imageUrl || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Nature,
        tags: entry.tags || [],
        icon: icon!,
        color,
      };
    });
}

/**
 * Filters locations by matching a query string against name, description, and tags.
 * Case-insensitive partial matching.
 */
export function searchLocations(
  query: string,
  locations: Location[]
): Location[] {
  if (!query.trim()) return locations;

  const normalizedQuery = query.toLowerCase().trim();

  return locations.filter((location) => {
    const name = location.name.toLowerCase();
    const description = location.description.toLowerCase();
    const tags = location.tags.map((t) => t.toLowerCase()).join(" ");

    return (
      name.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      tags.includes(normalizedQuery)
    );
  });
}
