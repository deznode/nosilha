"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * An Instagram tile's picture. The URL is hot-linked from Instagram's CDN and can
 * expire between cache windows; when it fails the image goes away and the flat
 * tile behind it shows, never a broken-image glyph. Decorative: the tile's anchor
 * carries the accessible name.
 */
export function InstagramTileImage({
  src,
  sizes,
}: {
  src: string;
  sizes: string;
}) {
  // The failed URL, not a flag: `cacheComponents` keeps this route mounted inside
  // React's `<Activity>`, so a bare boolean would survive navigation and leave the
  // tile blank for the rest of the session even once a fresh URL arrives.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return null;

  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      fill
      sizes={sizes}
      onError={() => setFailedSrc(src)}
      className="ease-calm object-cover transition-transform duration-200 group-hover:scale-[1.02] group-focus-visible:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
    />
  );
}
