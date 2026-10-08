import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import { PhotoViewer } from "@/components/photographs/viewer/photo-viewer";
import { getGalleryMediaById } from "@/lib/api";
import { toArchivePhoto } from "@/lib/archive-photographs";
import { isMediaId } from "@/lib/gallery-mappers";
import { getArchivePhotographs } from "@/lib/get-archive-photographs";
import { generatePageMetadata } from "@/lib/metadata";
import { photoTitle } from "@/lib/photo-facts";
import { isAskLink, sharePreviewImage } from "@/lib/share";
import { ASK_TITLE, askDescription } from "@/lib/share-copy";

/**
 * Blocking rather than streaming a shell, so an unknown id answers 404 rather than 200
 * with a 404 page inside it.
 */
export const instant = false;

interface PhotoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ place?: string; ask?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PhotoPageProps): Promise<Metadata> {
  const [{ id }, { ask }] = await Promise.all([params, searchParams]);
  if (!isMediaId(id)) return {};
  const media = await getGalleryMediaById(id).catch(() => undefined);
  if (!media) return {};

  const title = photoTitle(media);
  // No settlements: the preview needs what is missing and the image, not "Near X".
  const photo = toArchivePhoto(media, []);
  // An ask link to a record that has since been completed is a plain link.
  const asking = isAskLink(ask) ? askDescription(photo) : null;
  const image = sharePreviewImage(photo.src, photo.alt);

  return generatePageMetadata({
    title: asking
      ? ASK_TITLE
      : title.untitled
        ? "An untitled photograph of Brava"
        : title.text,
    description:
      asking ??
      (media.description?.trim() ||
        "A record in the Brava Island archive, with what it is still missing."),
    // The canonical address never carries `ask` or a share tag.
    path: `/photographs/${media.id}`,
    keywords: ["Brava Island", "Cape Verde", "archive photograph"],
    images: image ? [image] : [],
  });
}

export default async function PhotoPage({
  params,
  searchParams,
}: PhotoPageProps) {
  const [{ id }, { place }] = await Promise.all([params, searchParams]);
  const { photos, initialId } = await cachedPhoto(id);
  // `?place=` stays out of the cache key: the viewer checks it against the dataset.
  return (
    <PhotoViewer
      photos={photos}
      initialId={initialId}
      place={typeof place === "string" ? place : undefined}
    />
  );
}

async function cachedPhoto(id: string) {
  "use cache";
  cacheLife("entry");
  cacheTag("gallery");
  cacheTag("towns");

  // Anything but a record id is a 404, before either request: a literal such as
  // `featured` would otherwise reach a backend list route and render as a record.
  if (!isMediaId(id)) notFound();

  // Both requests start together, but the 404 is settled on the media alone: for an
  // id the archive does not hold, a dataset request that fails for any other reason
  // must not pre-empt `notFound()` with a 500.
  const mediaPromise = getGalleryMediaById(id);
  const archivePromise = getArchivePhotographs();
  // `notFound()` leaves this scope before the dataset is awaited, so give the
  // rejection a handler now rather than letting it surface as unhandled.
  archivePromise.catch(() => undefined);

  const media = await mediaPromise;
  if (!media) notFound();

  // Not caught: a missing dataset would be cached as an archive of one photograph.
  const { photos, settlements } = await archivePromise;

  // A record outside the image list (an external still, say) is still viewable, on
  // its own at the head of the list.
  const listed = photos.some((p) => p.id === media.id)
    ? photos
    : [toArchivePhoto(media, settlements), ...photos];

  return { photos: listed, initialId: media.id };
}
