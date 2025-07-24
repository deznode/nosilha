import type { DirectoryEntry } from "@/types/directory";

/**
 * Type guard to check if an object has the basic structure of a DirectoryEntry
 */
export function isDirectoryEntry(obj: any): obj is DirectoryEntry {
  // First check for missing category field - this is the main issue we're seeing
  if (!obj || typeof obj !== "object" || !obj.category) {
    console.warn("Missing category field in DirectoryEntry:", obj);
    return false;
  }

  const hasValidStructure = (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.slug === "string" &&
    typeof obj.description === "string" &&
    typeof obj.category === "string" &&
    typeof obj.town === "string" &&
    typeof obj.latitude === "number" &&
    typeof obj.longitude === "number" &&
    typeof obj.reviewCount === "number" &&
    (obj.rating === undefined || obj.rating === null || typeof obj.rating === "number") &&
    (obj.imageUrl === undefined || obj.imageUrl === null || typeof obj.imageUrl === "string") &&
    (obj.createdAt === undefined || typeof obj.createdAt === "string") &&
    (obj.updatedAt === undefined || typeof obj.updatedAt === "string") &&
    ["Restaurant", "Hotel", "Beach", "Landmark"].includes(obj.category)
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
export function hasRestaurantDetails(entry: DirectoryEntry): entry is DirectoryEntry & { 
  category: "Restaurant"; 
  details: { phoneNumber: string; openingHours: string; cuisine: string[] } 
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
export function hasHotelDetails(entry: DirectoryEntry): entry is DirectoryEntry & { 
  category: "Hotel"; 
  details: { phoneNumber?: string; amenities: string[] } 
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
export function validateDirectoryEntries(data: any[]): DirectoryEntry[] {
  if (!Array.isArray(data)) {
    console.warn("API response data is not an array:", data);
    return [];
  }

  return data.filter((item, index) => {
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
export function validateDirectoryEntry(data: any): DirectoryEntry | null {
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