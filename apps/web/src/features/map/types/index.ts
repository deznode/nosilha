import type { Feature, Point, BBox } from "geojson";
import type {
  ClusterFeature,
  PointFeature as SuperclusterPointFeature,
} from "supercluster";

// --- Map Entry Types ---
export type { DirectoryEntry as MapEntry } from "@/types/directory";

// --- Point Feature Types ---
export type PointProperties = {
  cluster: false;
  entryId: string;
  category: string;
  name: string;
  slug: string;
};

export type PointFeature = Feature<Point, PointProperties>;

// --- Cluster Feature Types ---
export type ClusterFeatureWithProps = ClusterFeature<Record<string, unknown>>;

// --- Re-export useful geojson types ---
export type { BBox };

// --- Type Guard ---
export function isClusterFeature(
  feature: SuperclusterPointFeature<PointProperties> | ClusterFeatureWithProps
): feature is ClusterFeatureWithProps {
  return !!(feature.properties as { cluster?: boolean }).cluster;
}

// --- Map Constants ---
export const ALL_CATEGORIES = [
  "Restaurant",
  "Hotel",
  "Beach",
  "Heritage",
  "Nature",
] as const;
export type Category = (typeof ALL_CATEGORIES)[number];
