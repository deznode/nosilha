// 1. A base interface with all COMMON properties
export interface BaseDirectoryEntry {
  id: string;
  slug: string; // Slugs are essential for all public entries
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Landmark";
  imageUrl: string;
  town: string;
  latitude: number;
  longitude: number;
  description: string; // A description is general enough for all types
  rating: number | undefined;
  reviewCount: number;
}

// 2. Interfaces for CATEGORY-SPECIFIC details
export interface RestaurantDetails {
  phoneNumber: string;
  openingHours: string; // For simplicity this is a string, but could be a structured object
  cuisine: string[];
}

export interface HotelDetails {
  phoneNumber: string;
  amenities: ("Wi-Fi" | "Pool" | "Parking")[];
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
