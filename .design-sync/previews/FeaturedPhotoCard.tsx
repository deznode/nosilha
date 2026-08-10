import { FeaturedPhotoCard } from "frontend";
import { FEATURED_PHOTO } from "../fixtures/data";

/** The hero card at the top of the gallery. */
export function Default() {
  return (
    <div className="max-w-2xl">
      <FeaturedPhotoCard photo={FEATURED_PHOTO} />
    </div>
  );
}
