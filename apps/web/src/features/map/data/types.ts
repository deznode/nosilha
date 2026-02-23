import type { LucideIcon } from "lucide-react";
import type { CategoryType } from "./categories";

/**
 * Raw location data as stored in locations.json
 * Coordinates are in [longitude, latitude] format (GeoJSON standard)
 */
export interface RawLocation {
  id: number;
  name: string;
  namePortuguese: string;
  coordinates: [number, number]; // [lng, lat]
  elevation: number;
  category: Exclude<CategoryType, "All">;
  description: string;
  tags: string[];
}

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
 * Metadata about the locations dataset
 */
export interface LocationsMetadata {
  island: string;
  country: string;
  totalLocations: number;
  categories: Record<string, number>;
  notes: string;
  sources: string[];
  compiled: string;
  accuracy: string;
}

/**
 * Full locations JSON structure
 */
export interface LocationsData {
  locations: RawLocation[];
  metadata: LocationsMetadata;
}
