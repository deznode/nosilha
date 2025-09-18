/**
 * Interface representing a town or village on Brava Island.
 *
 * Towns are geographic containers that hold directory entries (businesses, landmarks, etc.).
 * This interface matches the TownDto from the backend API.
 */
export interface Town {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  population: string | null;
  elevation: string | null;
  founded: string | null;
  highlights: string[];
  heroImage: string | null;
  gallery: string[];
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
