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

  // Independent reads on the same id, so they go together: this page renders
  // blocking (`instant = false`), which makes their latency TTFB.
  //
  // The sequence is not caught: without one the position line reads "This one has
  // no place recorded", which is a statement about the record rather than about the
  // request that failed — and `use cache` would keep saying it for half an hour.
  const [media, sequence] = await Promise.all([
    getGalleryMediaById(id),
    getPhotoSequence(id),
  ]);
  if (!media) notFound();

  return <PhotoDetail media={media} sequence={sequence ?? null} />;
}
