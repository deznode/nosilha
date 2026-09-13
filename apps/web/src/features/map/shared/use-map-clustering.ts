"use client";

import { useDeferredValue, useMemo } from "react";
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

type ClusterOrPoint<P extends GeoJsonProperties> =
  | Supercluster.ClusterFeature<Supercluster.AnyProps>
  | Supercluster.PointFeature<P>;

/** Records at byte-identical coordinates, which no zoom level can separate. */
export interface CoincidentGroup<P extends GeoJsonProperties> {
  key: string;
  longitude: number;
  latitude: number;
  leaves: Supercluster.PointFeature<P>[];
}

export interface GroupedFeatures<P extends GeoJsonProperties> {
  clusters: Supercluster.ClusterFeature<Supercluster.AnyProps>[];
  points: Supercluster.PointFeature<P>[];
  groups: CoincidentGroup<P>[];
}

function isCluster<P extends GeoJsonProperties>(
  feature: ClusterOrPoint<P>
): feature is Supercluster.ClusterFeature<Supercluster.AnyProps> {
  return Boolean((feature.properties as { cluster?: boolean } | null)?.cluster);
}

const coordinateKey = ([lng, lat]: number[]) => `${lng},${lat}`;

/**
 * Separates records that share exact coordinates from Supercluster's output.
 *
 * Clustering stops above `maxZoom`, so two records at one point render as stacked
 * markers and only the top one can be clicked; below it, expanding their cluster flies
 * to a zoom that still cannot split them. Both cases become one group that the map
 * fans out in pixel space. Spec 033 FR-012.
 */
export function groupCoincident<P extends GeoJsonProperties>(
  features: ClusterOrPoint<P>[],
  getLeaves: (clusterId: number) => Supercluster.PointFeature<P>[]
): GroupedFeatures<P> {
  const clusters: Supercluster.ClusterFeature<Supercluster.AnyProps>[] = [];
  const byCoordinate = new Map<string, Supercluster.PointFeature<P>[]>();

  const addPoint = (point: Supercluster.PointFeature<P>) => {
    const key = coordinateKey(point.geometry.coordinates);
    const bucket = byCoordinate.get(key);
    if (bucket) bucket.push(point);
    else byCoordinate.set(key, [point]);
  };

  for (const feature of features) {
    if (!isCluster(feature)) {
      addPoint(feature);
      continue;
    }

    const leaves = getLeaves(feature.properties.cluster_id);
    const firstKey = leaves[0] && coordinateKey(leaves[0].geometry.coordinates);
    const allCoincident =
      firstKey !== undefined &&
      leaves.every(
        (leaf) => coordinateKey(leaf.geometry.coordinates) === firstKey
      );

    if (allCoincident) leaves.forEach(addPoint);
    else clusters.push(feature);
  }

  const points: Supercluster.PointFeature<P>[] = [];
  const groups: CoincidentGroup<P>[] = [];

  for (const [key, bucket] of byCoordinate) {
    if (bucket.length === 1) {
      points.push(bucket[0]);
    } else {
      const [longitude, latitude] = bucket[0].geometry.coordinates;
      groups.push({ key, longitude, latitude, leaves: bucket });
    }
  }

  return { clusters, points, groups };
}

/**
 * Reusable hook wrapping Supercluster for map marker clustering.
 *
 * Accepts GeoJSON point features and returns clustered/individual features
 * with a helper to expand clusters on click. `grouped` additionally splits out
 * records at identical coordinates (see `groupCoincident`).
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

  const grouped = useMemo(
    () =>
      groupCoincident(clusters, (clusterId) => {
        // The deferred clusters can trail a reloaded index, whose ids no longer
        // match. An unknown id keeps the feature a plain cluster.
        try {
          return supercluster?.getLeaves(clusterId, Infinity) ?? [];
        } catch {
          return [];
        }
      }),
    [clusters, supercluster]
  );

  const expandCluster = (clusterId: number): number | null => {
    if (!supercluster) return null;
    return Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
  };

  return { clusters, grouped, supercluster, expandCluster };
}
