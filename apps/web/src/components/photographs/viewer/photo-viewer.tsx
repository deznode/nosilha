"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ShareArrivalLine } from "@/components/share/share-arrival";
import {
  ALL_PLACES,
  filterByPlace,
  firstMissingField,
  parsePlaceParam,
  photoHeading,
  photographHref,
  photographsHref,
  placeLabel as labelOf,
  stepWithin,
  type ArchivePhoto,
} from "@/lib/archive-photographs";
import { photoArrivalLine } from "@/lib/share-copy";
import { useActivityRemountKey } from "@/lib/hooks/use-activity-remount-key";
import { readPanelOpen, writePanelOpen } from "@/lib/viewer-storage";
import { useIdentifyContext, useWasAnswered } from "@/stores/identifyStore";

import { AskBar } from "./ask-bar";
import { DetailsPanel } from "./details-panel";
import { ViewerStage } from "./viewer-stage";

const PHOTO_PATH = /^\/photographs\/([^/?#]+)$/;

interface PhotoViewerProps {
  photos: ArchivePhoto[];
  initialId: string;
  place: string | undefined;
  /** The visitor followed an ask link: put its question beside the photograph. */
  ask?: boolean;
}

/**
 * The viewing room. Spec 038 FR-020 to FR-026.
 *
 * The URL is the state: the path carries the photograph and `?place=` the filter it
 * steps within. A step replaces the history entry with `history.replaceState`, which
 * Next syncs into `usePathname` without fetching the route again, so the stage keeps
 * its layers and crossfades rather than remounting (plan.md, History decision).
 *
 * Under `cacheComponents` a route hidden and shown again keeps its state; the remount
 * key throws that state away on restore, so the viewer never comes back zoomed, in
 * full screen, or on a photograph the URL doesn't name.
 */
export function PhotoViewer(props: PhotoViewerProps) {
  const remountKey = useActivityRemountKey();
  return <ViewingRoom key={remountKey} {...props} />;
}

function ViewingRoom({
  photos,
  initialId,
  place: placeParam,
  ask,
}: PhotoViewerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const identifyOpen = useIdentifyContext() !== null;
  const [panelOpen, setPanelOpen] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);

  // Storage is read after hydration, so the server and first client render agree.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- panel memory (FR-026) exists only in the browser
    setPanelOpen(readPanelOpen());
  }, []);

  const urlId = pathname.match(PHOTO_PATH)?.[1];
  const current =
    photos.find((p) => p.id === urlId) ??
    photos.find((p) => p.id === initialId) ??
    photos[0];

  // Step within the filter the photograph was opened under, unless it isn't in it.
  const requested = parsePlaceParam(placeParam, photos);
  const filtered = filterByPlace(photos, requested);
  const inFilter = filtered.some((p) => p.id === current.id);
  const place = inFilter ? requested : ALL_PLACES;
  const list = inFilter ? filtered : photos;
  const index = Math.max(
    0,
    list.findIndex((p) => p.id === current.id)
  );
  const label = labelOf(place, photos);
  const arrival = photoArrivalLine(current, photos);
  const answered = useWasAnswered(current.id);
  // The question belongs to the photograph the link named, not the ones stepped to,
  // and is not asked again of someone who has just answered it.
  const askField =
    ask && current.id === initialId && !answered
      ? firstMissingField(current)
      : null;

  const show = useCallback(
    (photo: ArchivePhoto) => {
      window.history.replaceState(null, "", photographHref(photo.id, place));
      document.title = `${photoHeading(photo)} | Nos Ilha`;
    },
    [place]
  );

  // A "More from" thumb sits far down the details. On a phone the stage and the
  // details share one scroller, the stage on top, so bring the stage back into view:
  // otherwise the photograph crossfades off-screen while the grid reshuffles under the
  // finger. On a desktop the details scroll on their own: back to the new heading.
  const boxRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const showFromPanel = useCallback(
    (photo: ArchivePhoto) => {
      show(photo);
      const media = (query: string) =>
        typeof window.matchMedia === "function" &&
        window.matchMedia(query).matches;
      const scroller = media("(max-width: 767px)")
        ? boxRef.current
        : asideRef.current;
      if (!scroller || scroller.scrollTop === 0) return;
      scroller.scrollTo({
        top: 0,
        behavior: media("(prefers-reduced-motion: reduce)")
          ? "instant"
          : "smooth",
      });
    },
    [show]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = stepWithin(list, current.id, dir);
      if (next && next.id !== current.id) show(next);
    },
    [list, current.id, show]
  );

  const togglePanel = useCallback(() => {
    setPanelOpen((open) => {
      writePanelOpen(!open);
      return !open;
    });
  }, []);

  const back = useCallback(() => {
    router.push(photographsHref(place), { scroll: false });
  }, [router, place]);

  const neighbours =
    list.length > 1
      ? [
          stepWithin(list, current.id, -1),
          stepWithin(list, current.id, 1),
        ].filter((p): p is ArchivePhoto => p !== null && p.id !== current.id)
      : [];

  return (
    <div
      ref={boxRef}
      className="h-full overflow-y-auto md:flex md:overflow-hidden"
    >
      <ShareArrivalLine moment="photo" {...arrival} />
      <ViewerStage
        photo={current}
        neighbours={neighbours}
        position={index + 1}
        total={list.length}
        placeLabel={label}
        panelOpen={panelOpen}
        onTogglePanel={togglePanel}
        onStep={step}
        onBack={back}
        onFullScreenChange={setFullScreen}
        keysDisabled={identifyOpen}
      />
      <aside
        ref={asideRef}
        aria-label="About this photograph"
        // Behind the full-screen stage: out of the tab order and the reading order.
        inert={fullScreen}
        className={
          panelOpen
            ? "bg-background md:border-border-subtle md:h-full md:w-[380px] md:flex-none md:overflow-y-auto md:border-l"
            : "bg-background md:hidden"
        }
      >
        <DetailsPanel
          photo={current}
          photos={photos}
          place={place}
          placeLabel={label}
          onShow={showFromPanel}
        />
      </aside>
      {askField && !identifyOpen && !fullScreen && (
        <AskBar photo={current} field={askField} />
      )}
    </div>
  );
}
