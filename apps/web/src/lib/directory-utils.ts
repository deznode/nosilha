export function formatCategoryTitle(category: string): string {
  if (!category) return "Directory";
  const decodedCategory = decodeURIComponent(category);
  return decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
}

// Canonical display name mapping (source of truth for friendly category names)
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  All: "All Categories",
  Restaurant: "Restaurants",
  Hotel: "Hotels",
  Beach: "Beaches",
  Heritage: "Heritage Sites",
  Nature: "Nature & Hiking",
};

/**
 * Gets the user-friendly display name for a category
 * Handles both API category names (e.g., "Restaurant") and URL slugs (e.g., "restaurants")
 */
export function getCategoryDisplayName(categoryOrSlug: string): string {
  // First try direct match (API category name)
  if (CATEGORY_DISPLAY_NAMES[categoryOrSlug]) {
    return CATEGORY_DISPLAY_NAMES[categoryOrSlug];
  }

  // Try converting from URL slug
  const apiCategory = getCategoryFromSlug(categoryOrSlug);
  if (apiCategory && CATEGORY_DISPLAY_NAMES[apiCategory]) {
    return CATEGORY_DISPLAY_NAMES[apiCategory];
  }

  // Fallback to title case
  return categoryOrSlug.charAt(0).toUpperCase() + categoryOrSlug.slice(1);
}

/**
 * Maps a category name (e.g., "Restaurant") to its URL slug (e.g., "restaurants")
 */
export function getCategorySlug(category: string): string {
  const mapping: Record<string, string> = {
    Restaurant: "restaurants",
    Hotel: "hotels",
    Beach: "beaches",
    Heritage: "heritage",
    Nature: "nature",
  };
  return mapping[category] || category.toLowerCase();
}

/**
 * Maps a URL slug (e.g., "restaurants") back to category name (e.g., "Restaurant")
 * Returns null if the slug is not a valid category
 */
export function getCategoryFromSlug(slug: string): string | null {
  const mapping: Record<string, string> = {
    restaurants: "Restaurant",
    hotels: "Hotel",
    beaches: "Beach",
    heritage: "Heritage",
    nature: "Nature",
  };
  return mapping[slug] || null;
}

/**
 * Generates the URL path for a directory entry
 */
export function getEntryUrl(slug: string, category: string): string {
  return `/directory/${getCategorySlug(category)}/${slug}`;
}
