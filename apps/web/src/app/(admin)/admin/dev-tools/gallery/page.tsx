"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MasonryPhotoGrid } from "@/components/gallery/masonry-photo-grid";
import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import type { MediaItem, PhotoType, PhotoMetadata } from "@/types/media";

const mockPhotos: MediaItem[] = [
  {
    id: "1",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1589553026367-1c60b73c4d51?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1589553026367-1c60b73c4d51?w=400",
    title: "Fajã d'Água Village",
    description:
      "The picturesque coastal village of Fajã d'Água, nestled between cliffs and ocean.",
    category: "Heritage",
    date: "2024-06-15",
    author: "Maria Silva",
    locationName: "Fajã d'Água",
  },
  {
    id: "2",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1596395817818-2e06d9d107a6?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1596395817818-2e06d9d107a6?w=400",
    title: "Nova Sintra Town Square",
    description:
      "The charming main square of Nova Sintra, the capital of Brava.",
    category: "Culture",
    date: "2024-05-20",
    author: "João Costa",
    locationName: "Nova Sintra",
  },
  {
    id: "3",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1534234828563-02597283995f?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534234828563-02597283995f?w=400",
    title: "Monte Fontainhas Trail",
    description:
      "Hiking trail through the lush green highlands of Brava Island.",
    category: "Nature",
    date: "2024-04-10",
    author: "Ana Barbosa",
    locationName: "Monte Fontainhas",
  },
  {
    id: "4",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    title: "Festival de São João",
    description:
      "Annual São João festival celebrations with traditional music and dance.",
    category: "Event",
    date: "2024-06-24",
    author: "Pedro Gomes",
    locationName: "Vila Nova Sintra",
  },
  {
    id: "5",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400",
    title: "Eugénio Tavares Bust",
    description:
      "The monument honoring Brava's greatest poet, Eugénio Tavares.",
    category: "Historical",
    date: "2024-03-01",
    author: "Carla Mendes",
    locationName: "Nova Sintra",
  },
  {
    id: "6",
    type: "IMAGE",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
    title: "Elder Storyteller Interview",
    description: "Recording oral histories from community elders in Cachaço.",
    category: "Interview",
    date: "2024-02-14",
    author: "Luis Tavares",
    locationName: "Cachaço",
  },
];

const mockMetadata: PhotoMetadata = {
  photoType: "CULTURAL_SITE",
  gpsPrivacyLevel: "APPROXIMATE",
  hasExifData: true,
  latitude: 14.8667,
  longitude: -24.7167,
  dateTimeOriginal: new Date("2024-06-15"),
  make: "Canon",
  model: "EOS R6",
  width: 6000,
  height: 4000,
  locationName: "Fajã d'Água, Brava",
};

export default function GalleryDevPage() {
  const [photoType, setPhotoType] = useState<PhotoType>("CULTURAL_SITE");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Photo Gallery</h1>
      <p className="text-muted mb-8">
        MasonryPhotoGrid with category filtering, integrated lightbox,
        MetadataBadges, and PhotoTypeSelector.
      </p>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          PhotoTypeSelector
        </h2>
        <PhotoTypeSelector value={photoType} onChange={setPhotoType} />
      </section>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">MetadataBadges</h2>
        <MetadataBadges metadata={mockMetadata} showManualPrompt />
      </section>

      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          MasonryPhotoGrid
        </h2>
        <MasonryPhotoGrid photos={mockPhotos} categoryFilter="All" />
      </section>
    </div>
  );
}
