"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManualMetadataForm } from "@/components/gallery/manual-metadata-form";
import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import { VideoSection } from "@/components/gallery/video-section";
import type {
  MediaItem,
  PhotoType,
  PhotoMetadata,
  ManualMetadata,
} from "@/types/media";

const mockMetadataWithExif: PhotoMetadata = {
  photoType: "CULTURAL_SITE",
  gpsPrivacyLevel: "APPROXIMATE",
  hasExifData: true,
  latitude: 14.8667,
  longitude: -24.7167,
  dateTimeOriginal: new Date("2024-06-15"),
  make: "Canon",
  model: "EOS R6 Mark II",
  width: 6000,
  height: 4000,
  locationName: "Fajã d'Água, Brava",
  photographerCredit: "Maria Silva",
  archiveSource: "Nos Ilha Community Archive",
};

const mockMetadataNoExif: PhotoMetadata = {
  photoType: "PERSONAL",
  gpsPrivacyLevel: "NONE",
  hasExifData: false,
  approximateDate: "1960s",
  locationName: "Nova Sintra, Brava",
  photographerCredit: "Unknown",
  archiveSource: "Family collection of the Tavares family",
};

const mockVideos: MediaItem[] = [
  {
    id: "vid-1",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
    title: "Traditional Morna Performance in Nova Sintra",
    description:
      "Live morna performance during the São João festival, featuring local musicians.",
    category: "Culture",
    date: "2024-06-24",
    author: "João Costa",
    locationName: "Nova Sintra",
  },
  {
    id: "vid-2",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534234828563-02597283995f?w=400",
    title: "Hiking Monte Fontainhas — Full Trail Guide",
    description:
      "Complete hiking guide for the Monte Fontainhas trail with drone footage.",
    category: "Nature",
    date: "2024-04-10",
    author: "Ana Barbosa",
    locationName: "Monte Fontainhas",
  },
];

export default function GalleryMetadataDevPage() {
  const [photoType, setPhotoType] = useState<PhotoType>("CULTURAL_SITE");
  const [manualMetadata, setManualMetadata] = useState<ManualMetadata>({
    approximateDate: "1970s",
    locationName: "Cachaço, Brava",
    photographerCredit: "Família Gomes",
    archiveSource: "Personal family archive",
  });
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Gallery Metadata</h1>
      <p className="text-muted mb-8">
        ManualMetadataForm, MetadataBadges, PhotoTypeSelector, and VideoSection
        components.
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            PhotoTypeSelector
          </h2>
          <PhotoTypeSelector value={photoType} onChange={setPhotoType} />
          <p className="text-muted mt-2 text-sm">
            Selected:{" "}
            <code className="bg-surface-alt rounded px-1">{photoType}</code>
          </p>
        </section>

        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            MetadataBadges (with EXIF)
          </h2>
          <MetadataBadges metadata={mockMetadataWithExif} />
        </section>

        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            MetadataBadges (no EXIF, manual prompt)
          </h2>
          <MetadataBadges metadata={mockMetadataNoExif} showManualPrompt />
        </section>

        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            MetadataBadges (null metadata)
          </h2>
          <MetadataBadges metadata={null} showManualPrompt />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          ManualMetadataForm
        </h2>
        <div className="max-w-lg">
          <ManualMetadataForm
            value={manualMetadata}
            onChange={(partial) =>
              setManualMetadata((prev) => ({ ...prev, ...partial }))
            }
            expanded={expanded}
            onExpandedChange={setExpanded}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-body mb-4 text-lg font-semibold">VideoSection</h2>
        <VideoSection videos={mockVideos} />
      </section>
    </div>
  );
}
