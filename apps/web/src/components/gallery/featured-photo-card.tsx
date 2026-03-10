"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import type { PublicGalleryMedia } from "@/types/gallery";
import { isPublicUserUploadMedia } from "@/types/gallery";

interface FeaturedPhotoCardProps {
  photo: PublicGalleryMedia;
}

export function FeaturedPhotoCard({ photo }: FeaturedPhotoCardProps) {
  const imageUrl = resolvePublicImageUrl(photo);
  if (!imageUrl) return null;

  const altText = photo.altText ?? photo.title ?? "Gallery photo";
  const location = isPublicUserUploadMedia(photo)
    ? (photo.locationName ?? null)
    : null;
  const formattedDate = photo.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(photo.createdAt))
    : null;

  return (
    <Link
      href={`/gallery/photo/${photo.id}`}
      className="group rounded-card relative block h-48 overflow-hidden sm:h-64 lg:h-72"
    >
      <Image
        src={imageUrl}
        alt={altText}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1280px"
        className="ease-calm object-cover transition-transform duration-500 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-1.5">
          <Star size={14} className="fill-sunny-yellow text-sunny-yellow" />
          <span className="text-sunny-yellow text-xs font-bold tracking-wider uppercase">
            Photo of the Day
          </span>
        </div>
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {photo.title}
        </h2>
        {(location || formattedDate) && (
          <p className="mt-1 text-sm text-white/70">
            {[location, formattedDate].filter(Boolean).join(" \u2022 ")}
          </p>
        )}
      </div>
    </Link>
  );
}
