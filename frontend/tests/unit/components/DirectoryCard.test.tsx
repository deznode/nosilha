import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DirectoryCard } from "@/components/ui/directory-card";
import type { DirectoryEntry } from "@/types/directory";

const restaurantEntry: DirectoryEntry = {
  id: "1",
  slug: "casa-da-morabeza",
  name: "Casa da Morabeza",
  category: "Restaurant",
  town: "Nova Sintra",
  description: "Celebrating Cape Verdean flavors.",
  tags: ["restaurant"],
  contentActions: null,
  imageUrl: "/images/directory/sample.jpg",
  rating: 4.5,
  reviewCount: 127,
  latitude: 14.85,
  longitude: -24.7,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  details: {
    phoneNumber: "+238 555 1234",
    openingHours: "11:00-22:00",
    cuisine: ["Morna Classics"],
  },
};

describe("DirectoryCard", () => {
  it("renders entry information and rating", () => {
    render(<DirectoryCard entry={restaurantEntry} />);

    expect(screen.getByText("Casa da Morabeza")).toBeInTheDocument();
    expect(screen.getByText(/Restaurant/)).toBeInTheDocument();
    expect(screen.getByText("(127 reviews)")).toBeInTheDocument();
  });

  it("shows fallback state when no image is provided", () => {
    const entryWithoutImage: DirectoryEntry = {
      ...restaurantEntry,
      id: "2",
      slug: "nova-market",
      name: "Nova Market",
      imageUrl: null,
      category: "Landmark",
      details: null,
    };

    render(<DirectoryCard entry={entryWithoutImage} />);

    expect(screen.getByText(/No image available/i)).toBeInTheDocument();
  });
});
