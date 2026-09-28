import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

import { InvitationCell } from "@/features/contribute/components/invitation-cell";
import {
  photoLine,
  photographHref,
  type ArchivePhoto,
  type PlaceFilter,
} from "@/lib/archive-photographs";

/**
 * How much of the dense grid tile `i` takes. Spec 038 FR-012.
 *
 * Desktop: every seventh is 2×2, and the fourth of every five 1×2. Mobile (two
 * columns): every fifth is two wide, else the third of every four two tall.
 */
export function tileSpan(i: number): {
  desktop: [number, number];
  mobile: [number, number];
} {
  const desktop: [number, number] =
    i % 7 === 0 ? [2, 2] : i % 5 === 3 ? [1, 2] : [1, 1];
  const mobile: [number, number] =
    i % 5 === 0 ? [2, 1] : i % 4 === 2 ? [1, 2] : [1, 1];
  return { desktop, mobile };
}

// Whole class names, so Tailwind finds them.
const COL = { 1: "col-span-1", 2: "col-span-2" } as const;
const ROW = { 1: "row-span-1", 2: "row-span-2" } as const;
const MD_COL = { 1: "md:col-span-1", 2: "md:col-span-2" } as const;
const MD_ROW = { 1: "md:row-span-1", 2: "md:row-span-2" } as const;

function spanClasses(i: number): string {
  const { desktop, mobile } = tileSpan(i);
  return clsx(
    COL[mobile[0] as 1 | 2],
    ROW[mobile[1] as 1 | 2],
    MD_COL[desktop[0] as 1 | 2],
    MD_ROW[desktop[1] as 1 | 2]
  );
}

const GRID =
  "grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-2.5 md:auto-rows-[200px] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]";

/**
 * The varied grid: CSS grid with dense packing, so big tiles never leave holes. The
 * spans come from classes rather than a width listener, so the server renders the
 * right layout at every width.
 */
export function ImmersionGrid({
  photos,
  place,
  onOpen,
}: {
  photos: readonly ArchivePhoto[];
  place: PlaceFilter;
  /** Called before a tile navigates, so the index can remember its scroll. */
  onOpen?: () => void;
}) {
  return (
    <>
      <div className={clsx("mt-4", GRID)}>
        {photos.map((photo, i) => (
          <ImmersionTile
            key={photo.id}
            photo={photo}
            href={photographHref(photo.id, place)}
            className={spanClasses(i)}
            onOpen={onOpen}
          />
        ))}
      </div>
      {/* Always last (E3). Its own grid with the same columns: inside the dense
          grid, packing would backfill it into an earlier hole whatever its
          order. row-span-2 on the phone's 150px rows clears the 190px minimum
          height; a single 200px desktop row already does. */}
      <div className={clsx("mt-2.5", GRID)}>
        <InvitationCell
          question="Have a photograph of Brava?"
          body="A family print, a slide, or a phone picture of one. You keep the copyright."
          ctaLabel="Give a photograph"
          href="/contribute/media"
          className="col-span-1 row-span-2 md:row-span-1"
        />
      </div>
    </>
  );
}

/** A photograph and, at most, where and when: no pills, no ribbons. */
export function ImmersionTile({
  photo,
  href,
  className,
  onOpen,
}: {
  photo: ArchivePhoto;
  href: string;
  className?: string;
  onOpen?: () => void;
}) {
  const line = photoLine(photo);
  return (
    <Link
      href={href}
      onClick={onOpen}
      className={clsx(
        "hover-lift focus-ring bg-muted relative block overflow-hidden rounded-[10px]",
        className
      )}
    >
      {photo.src && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 767px) 100vw, 480px"
          className="object-cover"
        />
      )}
      {line && (
        <div className="scrim-tile absolute inset-x-0 bottom-0 px-3 pt-[30px] pb-2.5 text-xs text-[#F6F1E9]">
          {line}
        </div>
      )}
    </Link>
  );
}
