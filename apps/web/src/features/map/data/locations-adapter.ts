import { MapPin } from "lucide-react";
import type { DirectoryEntry } from "@/types/directory";
import type { TownStatusSummary } from "@/types/town";
import { getEntryUrl } from "@/lib/directory-utils";
import {
  STATUS_CONFIG,
  getEntryStatus,
  getTownStatus,
  type DocumentationStatus,
} from "@/lib/status";
import { getCategoryIcon, type CategoryType } from "./categories";
import type { Location } from "./types";

/**
 * Pin colour by documentation status — how well documented a place is, not what kind
 * of place it is. Spec 033 FR-012.
 *
 * The light values of the status table's tokens (spec 034 FR-002). Hex rather than a
 * CSS variable because the render sites build tints by appending an alpha
 * (`${color}20`). Light in both themes because both basemaps are light, so the pins
 * always sit on light tiles. Spec 034 T-32 moves the render sites to `statusVar` /
 * `statusTint` and removes this map.
 */
export const STATUS_PIN_COLOR = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([status, config]) => [
    status,
    config.lightHex,
  ])
) as Record<DocumentationStatus, string>;

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
      const status = getEntryStatus(entry);

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
        image: entry.imageUrl || undefined,
        tags: entry.tags || [],
        icon,
        color: STATUS_PIN_COLOR[status.status],
        status,
        detailUrl: entry.slug
          ? getEntryUrl(entry.slug, entry.category)
          : undefined,
      };
    });
}

/**
 * Transforms settlement status summaries into Location objects for the map's
 * Settlements mode.
 */
export function transformSettlements(towns: TownStatusSummary[]): Location[] {
  return towns.map((town) => {
    const status = getTownStatus(town);

    return {
      id: town.id ?? town.slug,
      name: town.name,
      namePortuguese: town.name,
      category: "Town",
      description: town.description,
      coordinates: {
        lat: town.latitude,
        lng: town.longitude,
      },
      elevation: 0,
      tags: [],
      icon: getCategoryIcon("Town") ?? MapPin,
      color: STATUS_PIN_COLOR[status.status],
      status,
      // No settlement page exists yet (spec 033 T-19), so there is nothing to link to.
      detailUrl: undefined,
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
