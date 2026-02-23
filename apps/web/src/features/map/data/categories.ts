import {
  Building,
  Mountain,
  Sun,
  Eye,
  Footprints,
  Church,
  Landmark,
  Utensils,
  Anchor,
  Bed,
  type LucideIcon,
} from "lucide-react";

export type CategoryType =
  | "All"
  | "Town"
  | "Nature"
  | "Beach"
  | "Viewpoint"
  | "Trail"
  | "Church"
  | "Historic"
  | "Restaurant"
  | "Port"
  | "Accommodation";

export interface CategoryDefinition {
  id: CategoryType;
  label: string;
  labelPt: string; // Portuguese
  icon: LucideIcon;
  color: string;
  description: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "Town",
    label: "Towns",
    labelPt: "Vilas",
    icon: Building,
    color: "#d90368", // Bougainvillea Pink
    description: "Villages and settlements",
  },
  {
    id: "Nature",
    label: "Nature",
    labelPt: "Natureza",
    icon: Mountain,
    color: "#3e7d5a", // Valley Green
    description: "Mountains, forests, and natural areas",
  },
  {
    id: "Beach",
    label: "Beaches",
    labelPt: "Praias",
    icon: Sun,
    color: "#f7b801", // Sunny Yellow
    description: "Beaches and coastal areas",
  },
  {
    id: "Viewpoint",
    label: "Viewpoints",
    labelPt: "Miradouros",
    icon: Eye,
    color: "#4a90a4", // Sky Blue
    description: "Scenic overlooks and panoramic views",
  },
  {
    id: "Trail",
    label: "Trails",
    labelPt: "Trilhos",
    icon: Footprints,
    color: "#10b981", // Emerald
    description: "Hiking paths and walking routes",
  },
  {
    id: "Church",
    label: "Churches",
    labelPt: "Igrejas",
    icon: Church,
    color: "#8b5cf6", // Purple
    description: "Religious sites and chapels",
  },
  {
    id: "Historic",
    label: "Historic",
    labelPt: "Histórico",
    icon: Landmark,
    color: "#f97316", // Orange
    description: "Monuments, ruins, and historical sites",
  },
  {
    id: "Restaurant",
    label: "Dining",
    labelPt: "Restaurantes",
    icon: Utensils,
    color: "#ef4444", // Red
    description: "Restaurants and local food",
  },
  {
    id: "Port",
    label: "Ports",
    labelPt: "Portos",
    icon: Anchor,
    color: "#005a85", // Ocean Blue
    description: "Harbors and maritime facilities",
  },
  {
    id: "Accommodation",
    label: "Stay",
    labelPt: "Alojamento",
    icon: Bed,
    color: "#6366f1", // Indigo
    description: "Hotels, guesthouses, and lodging",
  },
];

// Helper to get category by ID
export const getCategoryById = (
  id: CategoryType
): CategoryDefinition | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// Helper to get icon component for a category
export const getCategoryIcon = (id: CategoryType): LucideIcon | null => {
  const category = getCategoryById(id);
  return category?.icon || null;
};

// Helper to get color for a category
export const getCategoryColor = (id: CategoryType): string => {
  const category = getCategoryById(id);
  return category?.color || "#666666";
};

// All category IDs for filtering (excluding "All")
export const CATEGORY_IDS = CATEGORIES.map((cat) => cat.id);

// Category IDs including "All" for filter UI
export const FILTER_OPTIONS: CategoryType[] = ["All", ...CATEGORY_IDS];
