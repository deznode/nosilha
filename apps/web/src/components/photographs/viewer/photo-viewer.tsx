"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  ALL_PLACES,
  filterByPlace,
  parsePlaceParam,
  photoHeading,
  photographHref,
  photographsHref,
  placeLabel as labelOf,
  stepWithin,
  type ArchivePhoto,
} from "@/lib/archive-photographs";
import { useActivityRemountKey } from "@/lib/hooks/use-activity-remount-key";
import { readPanelOpen, writePanelOpen } from "@/lib/viewer-storage";
import { useIdentifyContext } from "@/stores/identifyStore";

import { DetailsPanel } from "./details-panel";
import { ViewerStage } from "./viewer-stage";

const PHOTO_PATH = /^\/photographs\/([^/?#]+)$/;

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
export function PhotoViewer(props: {
  photos: ArchivePhoto[];
  initialId: string;
  place: string | undefined;
}) {
  const remountKey = useActivityRemountKey();
  return <ViewingRoom key={remountKey} {...props} />;
}

function ViewingRoom({
  photos,
  initialId,
  place: placeParam,
}: {
  photos: ArchivePhoto[];
  initialId: string;
  place: string | undefined;
}) {
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

  const show = useCallback(
    (photo: ArchivePhoto) => {
      window.history.replaceState(null, "", photographHref(photo.id, place));
      document.title = `${photoHeading(photo)} | Nos Ilha`;
    },
    [place]
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
    <div className="h-full overflow-y-auto md:flex md:overflow-hidden">
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
          onShow={show}
        />
      </aside>
    </div>
  );
}
