import { DirectoryEntry } from "./types";

export async function getEntriesByCategory(
  category: string
): Promise<DirectoryEntry[]> {
  // In a real app, you'd fetch this. For now, return mock data.
  return [
    {
      id: "1",
      name: "Nha Kasa",
      category: "Restaurant",
      imageUrl: "https://picsum.photos/200/300?random=1",
      rating: 4.5,
      reviewCount: 88,
      town: "Nova Sintra",
    },
    {
      id: "2",
      name: "Pousada Nova Sintra",
      category: "Hotel",
      imageUrl: "https://picsum.photos/200/300?random=2",
      rating: 4.8,
      reviewCount: 120,
      town: "Nova Sintra",
    },
    {
      id: "3",
      name: "Fajã d'Água Bay",
      category: "Beach",
      imageUrl: "https://picsum.photos/200/300?random=3",
      rating: 5.0,
      reviewCount: 250,
      town: "Fajã d'Água",
    },
    {
      id: "4",
      name: "Miradouro Eugénio Tavares",
      category: "Landmark",
      imageUrl: "https://picsum.photos/200/300?random=4",
      rating: 4.9,
      reviewCount: 150,
      town: "Nova Sintra",
    },
  ].filter(
    (entry) =>
      entry.category.toLowerCase() === category.toLowerCase() ||
      category === "all"
  );
}
