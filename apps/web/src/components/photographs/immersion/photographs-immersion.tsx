"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ALL_PLACES,
  filterByPlace,
  indexHelpLine,
  needsHelpPool,
  parsePlaceParam,
  photographHref,
  photographsHref,
  placeChips,
  type ArchivePhoto,
} from "@/lib/archive-photographs";
import type { Film } from "@/lib/films";
import { saveIndexScroll, takeIndexScroll } from "@/lib/viewer-storage";

import { FeatureBand } from "./feature-band";
import { FilmsBand } from "./films-band";
import { ImmersionGrid } from "./immersion-grid";
import { PlaceChips } from "./place-chips";

/**
 * The photographs index (1a). Spec 038 FR-010 to FR-013.
 *
 * `?place=` is read from the URL on every render and never copied into state, so the
 * chips, a shared link and the back button always agree. Choosing a chip replaces the
 * history entry without a round trip to the server: the whole archive is already here.
 */
export function PhotographsImmersion({
  photos,
  featureId,
  films,
}: {
  photos: ArchivePhoto[];
  featureId: string | null;
  films: Film[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const place = parsePlaceParam(searchParams.get("place"), photos);

  const feature = photos.find((p) => p.id === featureId) ?? null;
  const chips = placeChips(photos);
  const shown = filterByPlace(photos, place).filter(
    (p) => !(place === ALL_PLACES && p.id === feature?.id)
  );
  const help = indexHelpLine(photos);
  const needy = needsHelpPool(photos);

  // Coming back from a photograph: return to where the reader was in this filter.
  // Runs on mount and again on every Activity restore.
  useEffect(() => {
    const y = takeIndexScroll(place);
    if (y === null) return;
    requestAnimationFrame(() =>
      window.scrollTo({ top: y, behavior: "instant" })
    );
    // Only on arrival: a chip change starts the new filter at the reader's position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rememberScroll = () => saveIndexScroll(place, window.scrollY);

  const selectPlace = (key: string) => {
    window.history.replaceState(null, "", photographsHref(key));
  };

  const showNeedy = () => {
    if (needy.photos.length === 0) return;
    const pick = needy.photos[Math.floor(Math.random() * needy.photos.length)];
    rememberScroll();
    router.push(photographHref(pick.id, needy.place));
  };

  return (
    <div>
      <h1 className="sr-only">Photographs</h1>
      {feature && <FeatureBand photo={feature} />}

      <div className="mx-auto max-w-[1440px] px-4 pt-[18px] md:px-7">
        {photos.length > 0 ? (
          <>
            <PlaceChips chips={chips} active={place} onSelect={selectPlace} />
            <ImmersionGrid
              photos={shown}
              place={place}
              onOpen={rememberScroll}
            />
          </>
        ) : (
          <p className="text-muted py-12 text-center text-sm">
            The archive holds no photographs yet.
          </p>
        )}
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 md:px-7">
        {help && (
          <div className="border-border-subtle mt-7 flex flex-wrap items-center gap-3.5 border-t py-4">
            <span className="text-muted min-w-0 flex-[1_1_260px] text-sm leading-normal text-pretty">
              {help}
            </span>
            {needy.photos.length > 0 && (
              <button
                type="button"
                onClick={showNeedy}
                className="focus-ring border-sobrado-ochre text-sobrado-ochre hover:bg-sobrado-ochre/10 rounded-full border bg-transparent px-4 py-[9px] text-[13px] transition-colors"
              >
                Show me one that needs help
              </button>
            )}
          </div>
        )}

        <FilmsBand films={films} />
      </div>
    </div>
  );
}
