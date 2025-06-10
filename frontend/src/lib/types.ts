export interface DirectoryEntry {
  id: string;
  name: string;
  category: "Restaurant" | "Landmark" | "Hotel" | "Beach";
  imageUrl: string;
  rating: number;
  reviewCount: number;
  town: string;
}
