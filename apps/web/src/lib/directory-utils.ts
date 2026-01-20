/**
 * Single source of truth for category information.
 * Each category has: API name, URL slug, and display name.
 */
const CATEGORIES = {
  All: { slug: "all", display: "All Categories" },
  Restaurant: { slug: "restaurants", display: "Restaurants" },
  Hotel: { slug: "hotels", display: "Hotels" },
  Beach: { slug: "beaches", display: "Beaches" },
  Heritage: { slug: "heritage", display: "Heritage Sites" },
  Nature: { slug: "nature", display: "Nature & Hiking" },
} as const;

type CategoryName = keyof typeof CATEGORIES;

// Derived lookup: slug -> category name
const SLUG_TO_CATEGORY: Record<string, CategoryName> = Object.fromEntries(
  Object.entries(CATEGORIES).map(([name, { slug }]) => [
    slug,
    name as CategoryName,
  ])
) as Record<string, CategoryName>;

export function formatCategoryTitle(category: string): string {
  if (!category) return "Directory";
  const decodedCategory = decodeURIComponent(category);
  return decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
}

/**
 * Gets the user-friendly display name for a category.
 * Handles both API category names (e.g., "Restaurant") and URL slugs (e.g., "restaurants").
 */
export function getCategoryDisplayName(categoryOrSlug: string): string {
  // Try direct match (API category name)
  if (categoryOrSlug in CATEGORIES) {
    return CATEGORIES[categoryOrSlug as CategoryName].display;
  }

  // Try converting from URL slug
  const apiCategory = SLUG_TO_CATEGORY[categoryOrSlug];
  if (apiCategory) {
    return CATEGORIES[apiCategory].display;
  }

  // Fallback to title case
  return categoryOrSlug.charAt(0).toUpperCase() + categoryOrSlug.slice(1);
}

/**
 * Maps a category name (e.g., "Restaurant") to its URL slug (e.g., "restaurants").
 */
export function getCategorySlug(category: string): string {
  if (category in CATEGORIES) {
    return CATEGORIES[category as CategoryName].slug;
  }
  return category.toLowerCase();
}

/**
 * Maps a URL slug (e.g., "restaurants") back to category name (e.g., "Restaurant").
 * Returns null if the slug is not a valid category.
 */
export function getCategoryFromSlug(slug: string): string | null {
  return SLUG_TO_CATEGORY[slug] ?? null;
}

/**
 * Generates the URL path for a directory entry.
 */
export function getEntryUrl(slug: string, category: string): string {
  return `/directory/${getCategorySlug(category)}/${slug}`;
}
