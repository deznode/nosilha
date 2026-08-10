import { VideoGrid } from "frontend";
import { GALLERY_VIDEOS } from "../fixtures/data";

const noop = () => {};

/** The grid with a featured video promoted out of it. */
export function WithFeatured() {
  return (
    <VideoGrid
      items={GALLERY_VIDEOS}
      categoryFilter="all"
      featuredVideoId="v1"
      selectedVideoId="v2"
      onVideoSelect={noop}
    />
  );
}

/** No featured video — every item stays in the grid. */
export function AllItems() {
  return (
    <VideoGrid items={GALLERY_VIDEOS} categoryFilter="all" onVideoSelect={noop} />
  );
}

/** Empty — a category with no video yet. */
export function Empty() {
  return <VideoGrid items={[]} categoryFilter="Nature" onVideoSelect={noop} />;
}
