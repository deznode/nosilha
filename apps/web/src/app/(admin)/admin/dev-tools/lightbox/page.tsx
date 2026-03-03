"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryImageGrid } from "@/components/ui/gallery-image-grid";
import { ImageLightbox } from "@/components/ui/image-lightbox";

const mockPhotos = [
  {
    src: "https://images.unsplash.com/photo-1589553026367-1c60b73c4d51?w=800",
    alt: "Fajã d'Água coastal village",
    location: "Fajã d'Água, Brava",
    date: "June 2024",
    description:
      "The picturesque coastal village of Fajã d'Água, nestled between dramatic cliffs and the Atlantic Ocean.",
    author: "Maria Silva",
  },
  {
    src: "https://images.unsplash.com/photo-1596395817818-2e06d9d107a6?w=800",
    alt: "Nova Sintra town center",
    location: "Nova Sintra, Brava",
    date: "May 2024",
    description:
      "The charming main square of Nova Sintra, capital of Brava Island, with colonial-era architecture.",
    author: "João Costa",
  },
  {
    src: "https://images.unsplash.com/photo-1534234828563-02597283995f?w=800",
    alt: "Monte Fontainhas hiking trail",
    location: "Monte Fontainhas, Brava",
    date: "April 2024",
    description:
      "A lush green hiking trail through the highlands, offering panoramic views of the island.",
    author: "Ana Barbosa",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    alt: "Brava Island beach at sunset",
    location: "Praia de Vinagre, Brava",
    date: "March 2024",
    description:
      "Golden sunset over the volcanic black sand beach of Vinagre, a hidden gem of Brava.",
    author: "Pedro Gomes",
  },
  {
    src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    alt: "Traditional stone houses",
    location: "Cachaço, Brava",
    date: "February 2024",
    description:
      "Well-preserved traditional stone houses in the hilltop village of Cachaço.",
    author: "Carla Mendes",
  },
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    alt: "Fishermen at dawn",
    location: "Furna, Brava",
    date: "January 2024",
    description:
      "Local fishermen preparing their boats at the port of Furna in the early morning light.",
    author: "Luis Tavares",
  },
];

export default function LightboxDevPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Image Lightbox</h1>
      <p className="text-muted mb-8">
        GalleryImageGrid masonry layout with fullscreen ImageLightbox navigation
        and thumbnails. Click any image to open the lightbox.
      </p>

      <section>
        <h2 className="text-body mb-4 text-lg font-semibold">
          Gallery Image Grid
        </h2>
        <GalleryImageGrid photos={mockPhotos} />
      </section>

      <section className="mt-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Lightbox (click to open)
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {mockPhotos.map((photo, index) => (
            <button
              key={photo.src}
              onClick={() => setLightboxIndex(index)}
              className="rounded-card group relative aspect-[4/3] overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          photos={mockPhotos}
          initialIndex={lightboxIndex}
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
