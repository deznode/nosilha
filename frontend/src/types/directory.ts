// 1. A base interface with all COMMON properties
export type ContentActionType =
  | "SHARE"
  | "COPY_LINK"
  | "PRINT"
  | "REACTIONS"
  | "SUGGEST";

export interface ContentActionSettings {
  order?: ContentActionType[];
  disabled?: ContentActionType[];
}

export interface BaseDirectoryEntry {
  id: string;
  slug: string; // Slugs are essential for all public entries
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Landmark";
  imageUrl: string | null;
  town: string;
  latitude: number;
  longitude: number;
  description: string; // A description is general enough for all types
  rating: number | null | undefined;
  reviewCount: number;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  tags: string[];
  contentActions?: ContentActionSettings | null;
}

// 2. Interfaces for CATEGORY-SPECIFIC details (no redundant discriminator)
export interface RestaurantDetails {
  phoneNumber: string;
  openingHours: string; // For simplicity this is a string, but could be a structured object
  cuisine: string[];
}

export interface HotelDetails {
  phoneNumber?: string; // Backend may not always provide this for hotels
  amenities: string[]; // Backend uses generic string array, not restricted values
}

// A beach or landmark might not have any unique details yet
// so we can represent their details as `null`.

// 3. The final, type-safe DirectoryEntry using a Discriminated Union
export type DirectoryEntry =
  | (BaseDirectoryEntry & {
      category: "Restaurant";
      details: RestaurantDetails;
    })
  | (BaseDirectoryEntry & {
      category: "Hotel";
      details: HotelDetails;
    })
  | (BaseDirectoryEntry & {
      category: "Beach";
      details: null; // A beach has no specific details in this model
    })
  | (BaseDirectoryEntry & {
      category: "Landmark";
      details: null; // A landmark also has no specific details yet
    });
