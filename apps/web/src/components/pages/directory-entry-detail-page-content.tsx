"use client";

import Image from "next/image";
import { useRef } from "react";
import { MapPin, Phone, Clock, Building2, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ContributePhotosSection } from "@/components/ui/contribute-photos-section";
import { ContentActionToolbar } from "@/components/ui/content-action-toolbar";
import { ImageGallery } from "@/components/ui/image-gallery";
import { RelatedEntries } from "@/components/ui/related-entries";
import StarRating from "@/components/ui/start-rating";
import { useMediaMetadata } from "@/hooks/queries/useMediaMetadata";
import { getHotelDetails, getRestaurantDetails } from "@/lib/api-validation";
import { getEntryUrl } from "@/lib/directory-utils";
import { siteConfig } from "@/lib/metadata";
import type { DirectoryEntry } from "@/types/directory";

export interface DirectoryEntryDetailPageContentProps {
  entry: DirectoryEntry;
}

function CategorySpecificDetails({ entry }: { entry: DirectoryEntry }) {
  switch (entry.category) {
    case "Restaurant": {
      const restaurantDetails = getRestaurantDetails(entry);
      return (
        <>
          {restaurantDetails.phoneNumber && (
            <div className="flex items-start">
              <Phone className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {restaurantDetails.phoneNumber}
              </p>
            </div>
          )}
          {restaurantDetails.openingHours && (
            <div className="flex items-start">
              <Clock className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {restaurantDetails.openingHours}
              </p>
            </div>
          )}
          {restaurantDetails.cuisine.length > 0 && (
            <div className="flex items-start">
              <Sparkles className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                Cuisine: {restaurantDetails.cuisine.join(", ")}
              </p>
            </div>
          )}
        </>
      );
    }
    case "Hotel": {
      const hotelDetails = getHotelDetails(entry);
      return (
        <>
          {hotelDetails.phoneNumber && (
            <div className="flex items-start">
              <Phone className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                {hotelDetails.phoneNumber}
              </p>
            </div>
          )}
          {hotelDetails.amenities.length > 0 && (
            <div className="flex items-start">
              <Building2 className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
              <p className="text-text-secondary ml-3 text-base">
                Amenities: {hotelDetails.amenities.join(", ")}
              </p>
            </div>
          )}
        </>
      );
    }
    default:
      return null;
  }
}

export function DirectoryEntryDetailPageContent({
  entry,
}: DirectoryEntryDetailPageContentProps) {
  const canonicalUrl = new URL(
    getEntryUrl(entry.slug, entry.category),
    siteConfig.url
  ).toString();

  // Fetch gallery images for this entry
  const { data: mediaItems } = useMediaMetadata(entry.id);
  const galleryImages =
    mediaItems
      ?.filter((item) => item.publicUrl)
      .map((item) => item.publicUrl!) ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div
      ref={containerRef}
      className="bg-background-secondary min-h-screen pb-24 font-sans md:pb-12"
    >
      {/* Parallax Hero */}
      <div className="relative h-[45vh] min-h-[300px] w-full overflow-hidden sm:h-[60vh] sm:min-h-[400px]">
        <motion.div style={{ y }} className="absolute inset-0 h-[120%] w-full">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Main photo of ${entry.name}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="bg-background-tertiary flex h-full w-full items-center justify-center">
              <span className="text-text-tertiary text-xl">
                No image available
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-4xl font-bold text-white shadow-sm sm:text-6xl"
            >
              {entry.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center text-white/90"
            >
              <MapPin className="mr-2 h-5 w-5" />
              <span className="text-lg">{entry.town}, Brava</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:pl-24">
        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <p className="text-text-secondary text-lg leading-relaxed">
              {entry.description}
            </p>

            <div className="mt-8">
              <ContentActionToolbar
                contentId={entry.id}
                contentSlug={entry.slug}
                contentTitle={entry.name}
                contentUrl={canonicalUrl}
                contentType={entry.category}
                reactions={[
                  {
                    id: "LOVE",
                    emoji: "❤️",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "React with love",
                  },
                  {
                    id: "CELEBRATE",
                    emoji: "🎉",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "React to celebrate",
                  },
                  {
                    id: "INSIGHTFUL",
                    emoji: "💡",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "Mark as insightful",
                  },
                  {
                    id: "SUPPORT",
                    emoji: "👏",
                    count: 0,
                    isSelected: false,
                    ariaLabel: "Show support",
                  },
                ]}
                isAuthenticated={true}
              />
            </div>

            <div className="border-border-primary my-12 border-t" />

            <RelatedEntries
              contentId={entry.id}
              limit={5}
              heading="Explore Related Heritage"
            />

            <div className="border-border-primary my-12 border-t" />

            <div className="space-y-6">
              <h2 className="text-text-primary font-serif text-3xl font-bold">
                Gallery
              </h2>
              <ImageGallery imageUrls={galleryImages} />
            </div>

            <div className="border-border-primary my-12 border-t" />

            <h2 className="text-text-primary font-serif text-3xl font-bold">
              User Reviews
            </h2>
            <div className="border-border-primary bg-background-primary rounded-card shadow-subtle mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border p-6">
              <p className="text-text-primary text-5xl font-bold">
                {entry.rating?.toFixed(1) || "N/A"}
              </p>
              <div className="flex flex-col">
                <StarRating rating={entry.rating || 0} />
                <p className="text-text-secondary mt-1 text-sm">
                  Based on {entry.reviewCount} reviews
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-panel rounded-card sticky top-24 p-6">
              <div className="bg-background-tertiary rounded-card mb-6 aspect-video w-full overflow-hidden">
                <div className="bg-background-tertiary flex h-full w-full items-center justify-center">
                  <MapPin className="text-text-secondary h-12 w-12" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-ocean-blue mt-1 h-5 w-5 flex-shrink-0" />
                  <p className="text-text-secondary ml-3 text-base font-medium">
                    {entry.town}, Brava, Cape Verde
                  </p>
                </div>
                <div className="border-border-secondary border-t pt-4">
                  <CategorySpecificDetails entry={entry} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-border-primary my-16 border-t" />

        <ContributePhotosSection entryId={entry.id} />
      </div>
    </div>
  );
}
