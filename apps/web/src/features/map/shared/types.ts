import type { BBox } from "geojson";

/** Props for individual point features in clustering */
export interface ClusterPointProperties {
  cluster: false;
  [key: string]: unknown;
}

/** Props for cluster features returned by Supercluster */
export interface ClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: number;
}

/** A GeoJSON point feature used as input to clustering */
export interface GeoPointFeature<P = ClusterPointProperties> {
  type: "Feature";
  properties: P;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

/** Options for the useMapClustering hook */
export interface UseMapClusteringOptions {
  radius?: number;
  maxZoom?: number;
}

/** Mapbox map bounds as a tuple */
export type MapBounds = BBox | undefined;
