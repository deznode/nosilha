import { MapPin } from "lucide-react";
import type { DirectoryEntry } from "@/types/directory";
import { getEntryUrl } from "@/lib/directory-utils";
import {
  getCategoryColor,
  getCategoryIcon,
  type CategoryType,
} from "./categories";
import type { Location } from "./types";

/**
 * Maps backend API category names to BravaMap category IDs.
 * Most map 1:1, but Hotel -> "Accommodation" and Heritage -> "Historic"
 * to match the BravaMap category system defined in categories.ts.
 */
const BACKEND_TO_MAP_CATEGORY: Record<string, CategoryType> = {
  Restaurant: "Restaurant",
  Hotel: "Accommodation",
  Beach: "Beach",
  Heritage: "Historic",
  Nature: "Nature",
  Town: "Town",
  Viewpoint: "Viewpoint",
  Trail: "Trail",
  Church: "Church",
  Port: "Port",
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
 * Transforms an array of DirectoryEntry objects from the Spring Boot API
 * into Location objects that BravaMap expects.
 */
export function transformEntries(entries: DirectoryEntry[]): Location[] {
  return entries
    .filter((entry) => entry.latitude != null && entry.longitude != null)
    .map((entry) => {
      const category = (BACKEND_TO_MAP_CATEGORY[entry.category] ??
        "Nature") as Exclude<CategoryType, "All">;
      const icon = getCategoryIcon(category) ?? MapPin;
      const color = getCategoryColor(category);
      const rand = seededRandom(entry.id);

      return {
        id: entry.id,
        name: entry.name,
        namePortuguese: entry.name,
        category,
        description: entry.description || "",
        coordinates: {
          lat: entry.latitude,
          lng: entry.longitude,
        },
        elevation: 0,
        rating: entry.rating ?? 4.2 + rand * 0.8, // 4.2–5.0
        reviews: entry.reviewCount || Math.floor(20 + rand * 130), // 20–149
        image: entry.imageUrl || undefined,
        tags: entry.tags || [],
        icon,
        color,
        detailUrl: entry.slug
          ? getEntryUrl(entry.slug, entry.category)
          : undefined,
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
