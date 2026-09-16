// 1. A base interface with all COMMON properties
export type ContentActionType =
  "SHARE" | "COPY_LINK" | "PRINT" | "REACTIONS" | "SUGGEST";

export interface ContentActionSettings {
  order?: ContentActionType[];
  disabled?: ContentActionType[];
}

/**
 * How much of a record is documented, counted over the fields its category can
 * legitimately carry. `missingFields` names the applicable-but-empty ones, so the
 * frontend looks each key up in a question table rather than re-implementing the
 * category guard. Matches `CompletenessDto`. Spec 034 FR-016.
 */
export interface Completeness {
  documented: number;
  total: number;
  missingFields: string[];
}

/** Another record at byte-identical coordinates. Matches `CoincidentRefDto`. */
export interface CoincidentRef {
  id: string;
  name: string;
  slug: string;
  category: string;
}

/**
 * A record's hero image with its credit, resolved from the gallery module on read.
 * `imageUrl` on the entry is this URL. Matches `HeroImageDto`. Spec 034 FR-023.
 */
export interface HeroImage {
  mediaId: string;
  url: string;
  photographerCredit: string | null;
  archiveSource: string | null;
}

export interface BaseDirectoryEntry {
  id: string;
  slug: string; // Slugs are essential for all public entries
  name: string;
  category:
    | "Restaurant"
    | "Hotel"
    | "Beach"
    | "Heritage"
    | "Nature"
    | "Town"
    | "Viewpoint"
    | "Trail"
    | "Church"
    | "Port";
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
  // Contact information (common across all entry types)
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  /** Canonical settlement reference; null where the free-text `town` has not resolved. */
  townId?: string | null;
  /** Documented-field count for this record. Spec 034 FR-016. */
  completeness?: Completeness;
  /** Another record sharing these exact coordinates, when one exists. */
  coincidentWith?: CoincidentRef | null;
  /** The record's hero image and its credit; null when it has none. */
  heroImage?: HeroImage | null;
}

// 2. Interfaces for CATEGORY-SPECIFIC details (no redundant discriminator)
export interface RestaurantDetails {
  phoneNumber: string;
  openingHours: string; // For simplicity this is a string, but could be a structured object
  cuisine: string[];
}

/**
 * Heritage and Church fields. Matches `HeritageDetailsDto`. Spec 034 FR-016.
 */
export interface HeritageDetails {
  established: string | null;
  conditionStatus: string | null;
  festival: string | null;
  architect: string | null;
  /**
   * When a visitor can go in. Heritage and churches are opening-hours eligible in
   * `FieldGuard`, so the field grid counts this row — a record that holds the answer
   * must show it rather than ask for it.
   */
  openingHours: string | null;
}

export interface HotelDetails {
  phoneNumber?: string; // Backend may not always provide this for hotels
  amenities: string[]; // Backend uses generic string array, not restricted values
  /** When a visitor can check in; counted by `FieldGuard` for accommodation. */
  openingHours?: string | null;
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
      category: "Heritage";
      details: HeritageDetails | null;
    })
  | (BaseDirectoryEntry & {
      category: "Nature";
      details: null; // Nature sites have no specific details yet
    })
  | (BaseDirectoryEntry & {
      category: "Town";
      details: null;
    })
  | (BaseDirectoryEntry & {
      category: "Viewpoint";
      details: null;
    })
  | (BaseDirectoryEntry & {
      category: "Trail";
      details: null;
    })
  | (BaseDirectoryEntry & {
      category: "Church";
      details: HeritageDetails | null;
    })
  | (BaseDirectoryEntry & {
      category: "Port";
      details: null;
    });
