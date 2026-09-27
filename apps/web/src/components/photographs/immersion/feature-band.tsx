import Image from "next/image";
import Link from "next/link";

import {
  photoCaption,
  photoHeading,
  photoLine,
  photographHref,
  ALL_PLACES,
  type ArchivePhoto,
} from "@/lib/archive-photographs";

/**
 * Today's photograph, full bleed under the site bar. Spec 038 FR-010.
 *
 * The whole band is one link. The slow zoom is CSS (`.ken-burns`) and stops under
 * reduced motion.
 */
export function FeatureBand({ photo }: { photo: ArchivePhoto }) {
  const heading = photoHeading(photo);
  const caption = photoCaption(photo);
  const line = photoLine(photo);

  return (
    <Link
      href={photographHref(photo.id, ALL_PLACES)}
      className="bg-stage group relative block h-[calc((100dvh-var(--chrome-top-bar-height))*0.56)] overflow-hidden md:h-[min(680px,calc((100dvh-var(--chrome-top-bar-height))*0.74))]"
    >
      {photo.src && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="100vw"
          className="ken-burns object-cover"
        />
      )}
      <div aria-hidden className="scrim-bottom absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 flex max-w-[760px] flex-col gap-2.5 px-4 pb-[26px] text-[#F6F1E9] md:px-7">
        <span className="text-[11px] tracking-[.18em] uppercase opacity-[.85]">
          Photographs · Today&rsquo;s photograph
        </span>
        <h2 className="m-0 font-serif text-[34px] leading-[1.04] font-normal tracking-[-0.02em] md:text-[56px]">
          {heading}
        </h2>
        {caption && (
          <span className="text-[15px] leading-normal text-pretty opacity-90">
            {caption}
          </span>
        )}
        {line && <span className="text-xs opacity-[.78]">{line}</span>}
      </div>
    </Link>
  );
}
