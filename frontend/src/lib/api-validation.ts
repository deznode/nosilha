import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";

/**
 * Type guard to check if an object has the basic structure of a DirectoryEntry
 */
export function isDirectoryEntry(obj: unknown): obj is DirectoryEntry {
  // First check for missing category field - this is the main issue we're seeing
  if (
    !obj ||
    typeof obj !== "object" ||
    !("category" in obj) ||
    !(obj as Record<string, unknown>).category
  ) {
    console.warn("Missing category field in DirectoryEntry:", obj);
    return false;
  }

  const entry = obj as Record<string, unknown>;

  const hasValidStructure =
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.slug === "string" &&
    typeof entry.description === "string" &&
    typeof entry.category === "string" &&
    typeof entry.town === "string" &&
    typeof entry.latitude === "number" &&
    typeof entry.longitude === "number" &&
    typeof entry.reviewCount === "number" &&
    (entry.rating === undefined ||
      entry.rating === null ||
      typeof entry.rating === "number") &&
    (entry.imageUrl === undefined ||
      entry.imageUrl === null ||
      typeof entry.imageUrl === "string") &&
    (entry.createdAt === undefined || typeof entry.createdAt === "string") &&
    (entry.updatedAt === undefined || typeof entry.updatedAt === "string") &&
    ["Restaurant", "Hotel", "Beach", "Landmark"].includes(
      entry.category as string
    );

  if (!hasValidStructure) {
    console.warn("DirectoryEntry structure validation failed for:", obj);
    return false;
  }

  return true;
}

/**
 * Type guard to check if a DirectoryEntry has Restaurant details
 */
export function hasRestaurantDetails(
  entry: DirectoryEntry
): entry is DirectoryEntry & {
  category: "Restaurant";
  details: { phoneNumber: string; openingHours: string; cuisine: string[] };
} {
  return (
    entry.category === "Restaurant" &&
    entry.details !== null &&
    typeof entry.details === "object" &&
    "phoneNumber" in entry.details &&
    "openingHours" in entry.details &&
    "cuisine" in entry.details &&
    Array.isArray(entry.details.cuisine)
  );
}

/**
 * Type guard to check if a DirectoryEntry has Hotel details
 */
export function hasHotelDetails(
  entry: DirectoryEntry
): entry is DirectoryEntry & {
  category: "Hotel";
  details: { phoneNumber?: string; amenities: string[] };
} {
  return (
    entry.category === "Hotel" &&
    entry.details !== null &&
    typeof entry.details === "object" &&
    "amenities" in entry.details &&
    Array.isArray(entry.details.amenities)
  );
}

// Data transformation layer removed - backend now provides clean discriminator values

/**
 * Validates an array of objects as DirectoryEntry array with logging
 */
export function validateDirectoryEntries(data: unknown): DirectoryEntry[] {
  if (!Array.isArray(data)) {
    console.warn("API response data is not an array:", data);
    return [];
  }

  return data.filter((item, index): item is DirectoryEntry => {
    if (!isDirectoryEntry(item)) {
      console.warn(`Invalid DirectoryEntry at index ${index}:`, item);
      return false;
    }
    return true;
  });
}

/**
 * Safely extracts a DirectoryEntry from API response with validation
 */
export function validateDirectoryEntry(data: unknown): DirectoryEntry | null {
  if (!data) {
    console.warn("API response data is null or undefined");
    return null;
  }

  if (!isDirectoryEntry(data)) {
    console.warn("Invalid DirectoryEntry structure:", data);
    return null;
  }

  return data;
}

/**
 * Safely access restaurant details with fallbacks
 */
export function getRestaurantDetails(entry: DirectoryEntry) {
  if (!hasRestaurantDetails(entry)) {
    return {
      phoneNumber: null,
      openingHours: null,
      cuisine: [],
    };
  }

  return {
    phoneNumber: entry.details.phoneNumber || null,
    openingHours: entry.details.openingHours || null,
    cuisine: entry.details.cuisine || [],
  };
}

/**
 * Safely access hotel details with fallbacks
 */
export function getHotelDetails(entry: DirectoryEntry) {
  if (!hasHotelDetails(entry)) {
    return {
      phoneNumber: null,
      amenities: [],
    };
  }

  return {
    phoneNumber: entry.details.phoneNumber || null,
    amenities: entry.details.amenities || [],
  };
}

/**
 * Type guard to check if an object has the basic structure of a Town
 */
export function isTown(obj: unknown): obj is Town {
  if (!obj || typeof obj !== "object") {
    console.warn("Town validation failed - not an object:", obj);
    return false;
  }

  const town = obj as Record<string, unknown>;

  const hasValidStructure =
    typeof town.id === "string" &&
    typeof town.slug === "string" &&
    typeof town.name === "string" &&
    typeof town.description === "string" &&
    typeof town.latitude === "number" &&
    typeof town.longitude === "number" &&
    (town.population === null || typeof town.population === "string") &&
    (town.elevation === null || typeof town.elevation === "string") &&
    (town.founded === null || typeof town.founded === "string") &&
    Array.isArray(town.highlights) &&
    (town.heroImage === null || typeof town.heroImage === "string") &&
    Array.isArray(town.gallery) &&
    (town.createdAt === undefined || typeof town.createdAt === "string") &&
    (town.updatedAt === undefined || typeof town.updatedAt === "string");

  if (!hasValidStructure) {
    console.warn("Town structure validation failed for:", obj);
    return false;
  }

  return true;
}

/**
 * Validates an array of objects as Town array with logging
 */
export function validateTowns(data: unknown): Town[] {
  if (!Array.isArray(data)) {
    console.warn("API response data is not an array:", data);
    return [];
  }

  return data.filter((item, index): item is Town => {
    if (!isTown(item)) {
      console.warn(`Invalid Town at index ${index}:`, item);
      return false;
    }
    return true;
  });
}

/**
 * Safely extracts a Town from API response with validation
 */
export function validateTown(data: unknown): Town | null {
  if (!data) {
    console.warn("API response data is null or undefined");
    return null;
  }

  if (!isTown(data)) {
    console.warn("Invalid Town structure:", data);
    return null;
  }

  return data;
}
