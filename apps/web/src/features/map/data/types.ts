import type { LucideIcon } from "lucide-react";
import type { DocumentationState } from "@/lib/status";
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
  image?: string;
  tags: string[];
  icon: LucideIcon;
  /** Pin colour, derived from `status` — not from the category. Spec 033 FR-012. */
  color: string;
  status: DocumentationState;
  detailUrl?: string;
}

/**
 * What the map pins: settlements, or the place records within them
 */
export type MapMode = "settlements" | "places";

/**
 * Map view mode toggle (satellite imagery vs illustrated overlay)
 */
export type ViewMode = "satellite" | "illustration";

/**
 * Controls which map layers are visible
 */
export type LayerVisibility = "all" | "none";
