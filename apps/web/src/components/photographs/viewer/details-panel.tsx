"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import {
  firstMissingField,
  moreFrom,
  moreFromTitle,
  photoCaption,
  photoEyebrow,
  photoHeading,
  photoMeta,
  photographsHref,
  viewerHelpLine,
  type ArchivePhoto,
  type PlaceFilter,
} from "@/lib/archive-photographs";

/** The identify sheet's field for each thing a photograph can be missing. */
const IDENTIFY_FIELD = {
  photographer: "photographerCredit",
  place: "latitude",
  date: "dateTaken",
} as const;

const PILL =
  "focus-ring bg-background-secondary border-border-subtle hover:border-border-strong text-body rounded-full border px-3.5 py-2 text-[13px] transition-colors";

/** `/map?mode=photographs&sel=p:<id>`: the map opens on this photograph. */
export function mapHref(id: string): string {
  const params = new URLSearchParams({ mode: "photographs", sel: `p:${id}` });
  return `/map?${params.toString()}`;
}

/**
 * The viewing room's details, in the handoff's order. Spec 038 FR-022.
 *
 * Only what the record holds is shown; what it lacks is one line at the end with one
 * way to help, not a box of blanks.
 */
export function DetailsPanel({
  photo,
  photos,
  place,
  placeLabel,
  onShow,
}: {
  photo: ArchivePhoto;
  /** The whole archive, for More from. */
  photos: readonly ArchivePhoto[];
  place: PlaceFilter;
  placeLabel: string;
  /** Puts another photograph on the stage in place. */
  onShow: (photo: ArchivePhoto) => void;
}) {
  const heading = photoHeading(photo);
  const caption = photoCaption(photo);
  const meta = photoMeta(photo);
  const more = moreFrom(photo, photos);
  const help = viewerHelpLine(photo);
  const missingField = firstMissingField(photo);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The thumb just activated is replaced by the photograph that was showing, so focus
  // would drop to the page: hand it to the new record's heading instead. Without
  // scrolling to it: the viewer brings the stage and heading into view itself.
  const showOther = (other: ArchivePhoto) => {
    onShow(other);
    headingRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="flex flex-col gap-[18px] px-4 pt-[22px] pb-12 md:gap-5 md:px-[26px] md:pt-[26px] md:pb-10">
      {/* No scroll reset: the index restores the reader's own position. */}
      <Link
        href={photographsHref(place)}
        scroll={false}
        className="text-muted hover:text-body self-start text-[13px] transition-colors"
      >
        ← Photographs{placeLabel ? ` · ${placeLabel}` : ""}
      </Link>

      <div className="flex flex-col gap-[9px]">
        <span className="text-ocean-blue text-[10px] tracking-[.18em] uppercase">
          {photoEyebrow(photo)}
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-body m-0 font-serif text-[28px] leading-[1.1] font-normal tracking-[-0.015em] text-pretty md:text-[32px]"
        >
          {heading}
        </h1>
      </div>

      {caption && (
        <p className="text-body m-0 text-[15px] leading-[1.6] text-pretty">
          {caption}
        </p>
      )}

      {/* What the record holds about the picture itself; the credit travels with it
          (the archive publishes under CC BY-SA with the credit attached). */}
      {(meta || photo.placeName || photo.credit) && (
        <div className="text-muted flex flex-col gap-1 text-xs">
          {meta && <span>{meta}</span>}
          {photo.placeName && <span>{photo.placeName}</span>}
          {photo.credit && <span>Photograph by {photo.credit}</span>}
        </div>
      )}

      {photo.near && (
        <div className="flex flex-wrap gap-2">
          <Link href={photographsHref(photo.near.slug)} className={PILL}>
            Near {photo.near.name}
          </Link>
          <Link href={mapHref(photo.id)} className={PILL}>
            Show on map
          </Link>
        </div>
      )}

      {more.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-muted text-[10px] tracking-[.18em] uppercase">
            {moreFromTitle(photo)}
          </span>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1.5">
            {more.map((other) => (
              <button
                key={other.id}
                type="button"
                onClick={() => showOther(other)}
                aria-label={photoHeading(other)}
                className="focus-ring bg-muted relative aspect-square overflow-hidden rounded-md transition-transform duration-[220ms] ease-(--ease-archive) hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {other.src && (
                  <Image
                    src={other.src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {help && (
        <div className="border-border-subtle flex flex-col gap-2 border-t pt-4">
          <span className="text-muted text-[13px] leading-normal">{help}</span>
          {missingField && (
            <IdentifyQuestion
              contentType="media"
              contentId={photo.id}
              mediaId={photo.id}
              field={IDENTIFY_FIELD[missingField]}
              pageTitle={heading}
              variant="link"
              className="self-start"
            >
              Help complete this record
            </IdentifyQuestion>
          )}
        </div>
      )}
    </div>
  );
}
