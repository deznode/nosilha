// Map Feature - Public API
// Import from '@/features/map' instead of internal paths

export { default as BravaMap } from "./components/BravaMap";
export { InteractiveMap } from "./components/InteractiveMap";
export { MapFilterControl } from "./components/MapFilterControl";
export { CategoryMarkerIcon } from "./components/CategoryMarkerIcon";

// Types
export type {
  MapEntry,
  PointFeature,
  PointProperties,
  ClusterFeatureWithProps,
  Category,
  BBox,
} from "./types";

export { ALL_CATEGORIES, isClusterFeature } from "./types";
