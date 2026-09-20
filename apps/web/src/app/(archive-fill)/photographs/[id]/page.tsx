import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { PhotoDetail } from "@/components/photographs/photo-detail/photo-detail";
import { getGalleryMediaById, getPhotoSequence } from "@/lib/api";
import { generatePageMetadata } from "@/lib/metadata";
import { photoTitle } from "@/lib/photo-facts";

/**
 * Blocking rather than streaming a shell, so an unknown id answers 404 rather than 200
 * with a 404 page inside it.
 */
export const instant = false;

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PhotoPageProps): Promise<Metadata> {
  const { id } = await params;
  const media = await getGalleryMediaById(id).catch(() => undefined);
  if (!media) return {};

  const title = photoTitle(media);

  return generatePageMetadata({
    title: title.untitled ? "An untitled photograph of Brava" : title.text,
    description:
      media.description?.trim() ||
      "A record in the Brava Island archive, with what it is still missing.",
    path: `/photographs/${media.id}`,
    keywords: ["Brava Island", "Cape Verde", "archive photograph"],
  });
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  return cachedPhoto(id);
}

async function cachedPhoto(id: string) {
  "use cache";
  cacheLife("entry");
  cacheTag("gallery");

  // Both requests start together, but the 404 is settled on the media alone: for an
  // id the archive does not hold, a sequence request that fails for any reason other
  // than 404 must not pre-empt `notFound()` with a 500.
  const mediaPromise = getGalleryMediaById(id);
  const sequencePromise = getPhotoSequence(id);
  // `notFound()` leaves this scope before the sequence is awaited, so give the
  // rejection a handler now rather than letting it surface as unhandled.
  sequencePromise.catch(() => undefined);

  const media = await mediaPromise;
  if (!media) notFound();

  // The sequence is not caught: without one the position line reads "This one has
  // no place recorded", which is a statement about the record rather than about the
  // request that failed — and `use cache` would keep saying it for half an hour.
  const sequence = await sequencePromise;

  return <PhotoDetail media={media} sequence={sequence ?? null} />;
}
