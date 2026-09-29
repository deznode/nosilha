"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { MiniMap } from "@/features/map/components/mini-map";
import { getTowns, getTownFirstPhoto } from "@/lib/api";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import type { Town } from "@/types/town";

import { HINT, LABEL } from "./form-parts";
import { TownPicker } from "./town-picker";

/** The place a photo or film records: a town from the picker, or free text. */
export interface PlaceValue {
  townId: string | null;
  townName: string | null;
  detail: string;
  mode: "town" | "free";
}

interface TownFieldProps {
  kind: "photo" | "film";
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  label: string;
}

const FIELD =
  "bg-card h-11 w-full rounded-lg border px-3 text-[15px] outline-none focus:border-[1.5px] focus:border-ocean-blue";
const LINK = "focus-ring text-ocean-blue rounded-sm font-semibold";

let townsCache: Promise<Town[]> | null = null;

/**
 * Loads once and is shared by every field mounted this session (P3): a town
 * picked on the photo form shouldn't cost a second fetch on the film form.
 */
function loadTowns(): Promise<Town[]> {
  if (!townsCache) {
    townsCache = getTowns().catch((error: unknown) => {
      townsCache = null;
      throw error;
    });
  }
  return townsCache;
}

/**
 * The place field on the photo and film forms (P2–P4): a town chosen from
 * the picker — with a mini map and the town's first photograph — or free
 * text that isn't linked to a town page. Spec 039.
 *
 * The film form stops after the map and photo tiles: no "It will also
 * appear" line and no "More exactly" field, per the renderer (`filmTown`
 * has no equivalent of `placeTown`'s tail).
 */
export function TownField({ kind, value, onChange, label }: TownFieldProps) {
  const [towns, setTowns] = useState<Town[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTowns()
      .then((result) => {
        if (!cancelled) setTowns(result);
      })
      .catch(() => {
        // The picker just shows no results; free text stays available.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTown = useMemo(
    () => towns.find((town) => town.id === value.townId) ?? null,
    [towns, value.townId]
  );

  useEffect(() => {
    if (!selectedTown) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the previous town's photo so it never flashes under the new one
    setPhotoUrl(null);
    let cancelled = false;
    getTownFirstPhoto(selectedTown.id)
      .then((media) => {
        if (!cancelled) {
          setPhotoUrl(media ? resolvePublicImageUrl(media) : null);
        }
      })
      .catch(() => {
        if (!cancelled) setPhotoUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTown]);

  function handleSelect(town: Town) {
    onChange({
      ...value,
      townId: town.id,
      townName: town.name,
      mode: "town",
    });
    setPickerOpen(false);
  }

  function handlePickerFreeText() {
    onChange({ ...value, townId: null, townName: null, mode: "free" });
    setPickerOpen(false);
  }

  const showTown = value.mode === "town" && !!value.townId;
  const showFree = value.mode === "free";

  return (
    <div>
      <div className={LABEL}>{label}</div>

      {showTown && (
        <div>
          <div className="border-ocean-blue bg-card flex h-11 items-center justify-between rounded-lg border-[1.5px] px-3 text-[15px]">
            <span className="text-body">{value.townName}</span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={clsx(LINK, "text-[13px]")}
            >
              Change
            </button>
          </div>

          {selectedTown && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className={photoUrl ? undefined : "col-span-2"}>
                <MiniMap
                  lat={selectedTown.latitude}
                  lng={selectedTown.longitude}
                  zoom={14}
                  status="documented"
                  height={88}
                />
              </div>
              {photoUrl && (
                <div className="relative h-[88px] overflow-hidden rounded-lg">
                  <Image
                    src={photoUrl}
                    alt={`A photograph from ${selectedTown.name}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {kind === "photo" && (
            <>
              <p className={HINT}>
                It will also appear on the {value.townName} page.
              </p>
              <div className="mt-2.5">
                <input
                  type="text"
                  value={value.detail}
                  onChange={(event) =>
                    onChange({ ...value, detail: event.target.value })
                  }
                  aria-label="More exactly, in your own words"
                  className={clsx(FIELD, "text-body border-edge")}
                />
                <p className={HINT}>
                  More exactly, in your own words. Optional.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {!showTown && !showFree && (
        <div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-haspopup="dialog"
            className={clsx(
              FIELD,
              "text-muted border-edge flex items-center justify-between"
            )}
          >
            <span>Choose a town</span>
            <span className="text-[13px]">▾</span>
          </button>
          <p className={HINT}>
            Or{" "}
            <button
              type="button"
              onClick={() => onChange({ ...value, mode: "free" })}
              className={LINK}
            >
              describe the place in your own words
            </button>
            .
          </p>
        </div>
      )}

      {showFree && (
        <div>
          <input
            type="text"
            value={value.detail}
            onChange={(event) =>
              onChange({ ...value, detail: event.target.value })
            }
            aria-label={label}
            className={clsx(
              FIELD,
              "text-body border-ocean-blue border-[1.5px]"
            )}
          />
          <p className={clsx(HINT, "leading-[1.5]")}>
            In your words. It won&apos;t be linked to a town page.{" "}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={LINK}
            >
              Choose a town as well
            </button>
          </p>
        </div>
      )}

      <TownPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        onFreeText={handlePickerFreeText}
        towns={towns}
        label={label}
      />
    </div>
  );
}
