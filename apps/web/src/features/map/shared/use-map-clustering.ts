"use client";

import { useDeferredValue } from "react";
import useSupercluster from "use-supercluster";
import type Supercluster from "supercluster";
import type { GeoJsonProperties } from "geojson";
import type { UseMapClusteringOptions, MapBounds } from "./types";

const DEFAULT_RADIUS = 50;
const DEFAULT_MAX_ZOOM = 14;

interface UseMapClusteringParams<P extends GeoJsonProperties> {
  points: Supercluster.PointFeature<P>[];
  zoom: number;
  bounds: MapBounds;
  options?: UseMapClusteringOptions;
}

/**
 * Reusable hook wrapping Supercluster for map marker clustering.
 *
 * Accepts GeoJSON point features and returns clustered/individual features
 * with a helper to expand clusters on click.
 */
export function useMapClustering<P extends GeoJsonProperties>({
  points,
  zoom,
  bounds,
  options,
}: UseMapClusteringParams<P>) {
  const { clusters: rawClusters, supercluster } = useSupercluster({
    points,
    bounds: bounds as [number, number, number, number] | undefined,
    zoom,
    options: {
      radius: options?.radius ?? DEFAULT_RADIUS,
      maxZoom: options?.maxZoom ?? DEFAULT_MAX_ZOOM,
    },
  });

  const clusters = useDeferredValue(rawClusters);

  const expandCluster = (clusterId: number): number | null => {
    if (!supercluster) return null;
    return Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
  };

  return { clusters, supercluster, expandCluster };
}
