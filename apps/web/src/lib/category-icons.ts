import {
  MapPin,
  Utensils,
  Hotel,
  Umbrella,
  Castle,
  TreePine,
  Building,
  Eye,
  Footprints,
  Church,
  Anchor,
  type LucideIcon,
} from "lucide-react";
import type { DirectoryCategory } from "@/types/search";

/** Canonical category-to-icon mapping shared across directory cards, search, etc. */
export const CATEGORY_ICONS: Record<DirectoryCategory, LucideIcon> = {
  Restaurant: Utensils,
  Hotel: Hotel,
  Beach: Umbrella,
  Heritage: Castle,
  Nature: TreePine,
  Town: Building,
  Viewpoint: Eye,
  Trail: Footprints,
  Church: Church,
  Port: Anchor,
};

/** Resolve the icon for a category string, falling back to MapPin for unknown values. */
export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category as DirectoryCategory] ?? MapPin;
}
