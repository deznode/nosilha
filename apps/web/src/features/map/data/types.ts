import type { LucideIcon } from "lucide-react";
import type { CategoryType } from "./categories";

/**
 * Processed location data for use in the map component
 * Coordinates are in { lat, lng } object format
 */
export interface Location {
  id: string;
  name: string;
  namePortuguese: string;
  category: Exclude<CategoryType, "All">;
  description: string;
  coordinates: { lat: number; lng: number };
  elevation: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  icon: LucideIcon;
  color: string;
}

/**
 * Map view mode toggle (satellite imagery vs illustrated overlay)
 */
export type ViewMode = "satellite" | "illustration";

/**
 * Controls which map layers are visible
 */
export type LayerVisibility = "all" | "pois" | "zones" | "none";
