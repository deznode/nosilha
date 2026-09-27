"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";

/**
 * The viewer's two stacked image layers. Spec 038 FR-023.
 *
 * On a change, the next photograph is fetched and decoded off-screen at the exact
 * `srcset` candidate the stage will pick; only then does it go on the back layer and
 * the opacities swap. The current photograph stays up until the next one is ready,
 * so the stage is never blank. A newer request makes an older one stale (the token),
 * so rapid stepping settles on the last photograph asked for.
 */

export interface StageImage {
  id: string;
  src: string | null;
  alt: string;
}

/** The `<img>` props for a stage layer: fill, `contain`, optimised by the loader. */
export function stageImageProps(
  image: StageImage,
  sizes: string,
  priority = false
) {
  if (!image.src) return null;
  return getImageProps({
    src: image.src,
    alt: image.alt,
    fill: true,
    sizes,
    priority,
  }).props;
}

/** Fetches and decodes an image at the candidate the stage would choose. */
function loadImage(image: StageImage, sizes: string): Promise<void> {
  const props = stageImageProps(image, sizes);
  if (!props || typeof window === "undefined") return Promise.resolve();
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
  return typeof img.decode === "function" ? img.decode() : Promise.resolve();
}

/** Warms the cache for the photographs either side of the current one. */
export function preloadImages(images: readonly StageImage[], sizes: string) {
  for (const image of images) void loadImage(image, sizes).catch(() => {});
}

interface Layers {
  layers: [StageImage | null, StageImage | null];
  front: 0 | 1;
}

export function useCrossfade(target: StageImage, sizes: string) {
  const [state, setState] = useState<Layers>({
    layers: [target, null],
    front: 0,
  });
  const token = useRef(0);

  const shownId = state.layers[state.front]?.id ?? null;

  useEffect(() => {
    // Back to what is already up: any load still in flight is now stale.
    if (target.id === shownId) {
      token.current++;
      return;
    }
    const mine = ++token.current;
    const swap = () => {
      if (mine !== token.current) return;
      setState((prev) => {
        const back = prev.front === 0 ? 1 : 0;
        const layers: Layers["layers"] = [...prev.layers];
        layers[back] = target;
        return { layers, front: back };
      });
    };
    // A failed decode still swaps: the browser shows what it can, and a stuck stage
    // would be worse than a slow one.
    loadImage(target, sizes).then(swap, swap);
    // `target` is compared by id; a new object for the same photograph is no change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.id, shownId, sizes]);

  /** Drops to a single layer showing `image`, with no fade (Activity restore). */
  const reset = useCallback((image: StageImage) => {
    token.current++;
    setState({ layers: [image, null], front: 0 });
  }, []);

  return {
    layers: state.layers,
    front: state.front,
    /** The photograph actually on screen, which lags `target` while it decodes. */
    shownId,
    reset,
  };
}
