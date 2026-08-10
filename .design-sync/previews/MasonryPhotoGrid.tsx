import { MasonryPhotoGrid } from "frontend";
import { GALLERY_PHOTOS } from "../fixtures/data";

/**
 * Brief §6 case 4 — the masonry grid. The test is whether the palette
 * competes with the photography or recedes behind it.
 */
export function Populated() {
  return (
    <MasonryPhotoGrid
      photos={GALLERY_PHOTOS}
      categoryFilter="all"
      totalItems={GALLERY_PHOTOS.length}
    />
  );
}

/** A single item — what a narrowly filtered category actually returns today. */
export function SingleItem() {
  return (
    <MasonryPhotoGrid
      photos={GALLERY_PHOTOS.slice(0, 1)}
      categoryFilter="Heritage"
      totalItems={1}
    />
  );
}

/** Zero results — reachable on most category filters with 26 items total. */
export function Empty() {
  return <MasonryPhotoGrid photos={[]} categoryFilter="Nature" totalItems={0} />;
}

/** More available — the load-more affordance. */
export function WithMoreAvailable() {
  return (
    <MasonryPhotoGrid
      photos={GALLERY_PHOTOS}
      categoryFilter="all"
      totalItems={26}
      hasNextPage
      onLoadMore={() => {}}
    />
  );
}
