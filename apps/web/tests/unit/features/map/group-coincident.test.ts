import { describe, it, expect } from "vitest";
import Supercluster, { type PointFeature } from "supercluster";
import { groupCoincident } from "@/features/map/shared/use-map-clustering";

type Props = { cluster: false; locationId: string };

const WORLD: [number, number, number, number] = [-180, -85, 180, 85];

function point(
  locationId: string,
  lng: number,
  lat: number
): PointFeature<Props> {
  return {
    type: "Feature",
    properties: { cluster: false, locationId },
    geometry: { type: "Point", coordinates: [lng, lat] },
  };
}

const ids = (features: PointFeature<Props>[]) =>
  features.map((f) => f.properties.locationId);

const noLeaves = () => [];

describe("groupCoincident", () => {
  it("merges points at byte-identical coordinates into one group", () => {
    const result = groupCoincident(
      [
        point("faja", -24.732, 14.873),
        point("nos-raiz", -24.732, 14.873),
        point("mato", -24.706, 14.857),
      ],
      noLeaves
    );

    expect(result.groups).toHaveLength(1);
    expect(ids(result.groups[0].leaves)).toEqual(["faja", "nos-raiz"]);
    // Supercluster 9 rebuilds features from projected coordinates, so they
    // carry float noise (~1e-14°). Coincident records still share one key.
    expect(result.groups[0].longitude).toBeCloseTo(-24.732, 9);
    expect(result.groups[0].latitude).toBeCloseTo(14.873, 9);
    expect(ids(result.points)).toEqual(["mato"]);
    expect(result.clusters).toEqual([]);
  });

  it("keeps near but distinct coordinates as separate points", () => {
    // About 11 m apart. Zooming separates these, so they need no fan.
    const result = groupCoincident(
      [point("a", -24.732, 14.873), point("b", -24.732, 14.8731)],
      noLeaves
    );

    expect(result.groups).toEqual([]);
    expect(ids(result.points)).toEqual(["a", "b"]);
  });

  it("turns a cluster whose leaves all share one point into a group", () => {
    const index = new Supercluster<Props>({ radius: 50, maxZoom: 14 }).load([
      point("faja", -24.732, 14.873),
      point("nos-raiz", -24.732, 14.873),
    ]);
    const features = index.getClusters(WORLD, 10);
    expect(features).toHaveLength(1);

    const result = groupCoincident(features, (id) =>
      index.getLeaves(id, Infinity)
    );

    expect(result.clusters).toEqual([]);
    expect(result.groups).toHaveLength(1);
    expect(ids(result.groups[0].leaves).sort()).toEqual(["faja", "nos-raiz"]);
    // Supercluster 9 rebuilds features from projected coordinates, so they
    // carry float noise (~1e-14°). Coincident records still share one key.
    expect(result.groups[0].longitude).toBeCloseTo(-24.732, 9);
    expect(result.groups[0].latitude).toBeCloseTo(14.873, 9);
  });

  it("keeps a cluster whose leaves sit at different points", () => {
    const index = new Supercluster<Props>({ radius: 50, maxZoom: 14 }).load([
      point("a", -24.732, 14.873),
      point("b", -24.731, 14.872),
    ]);
    const features = index.getClusters(WORLD, 10);
    expect(features).toHaveLength(1);

    const result = groupCoincident(features, (id) =>
      index.getLeaves(id, Infinity)
    );

    expect(result.clusters).toHaveLength(1);
    expect(result.groups).toEqual([]);
    expect(result.points).toEqual([]);
  });
});
