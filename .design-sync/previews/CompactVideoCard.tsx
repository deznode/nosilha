import { CompactVideoCard } from "frontend";
import { GALLERY_VIDEOS } from "../fixtures/data";

const noop = () => {};

/** Resting state. */
export function Default() {
  return (
    <div className="max-w-xs">
      <CompactVideoCard item={GALLERY_VIDEOS[1]} onSelect={noop} />
    </div>
  );
}

/** Active — carries the bougainvillea-pink ring that marks the promoted video. */
export function Active() {
  return (
    <div className="max-w-xs">
      <CompactVideoCard item={GALLERY_VIDEOS[0]} onSelect={noop} isActive />
    </div>
  );
}

/** A row of three, one of them active. */
export function Row() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {GALLERY_VIDEOS.map((item, i) => (
        <CompactVideoCard
          key={item.id}
          item={item}
          onSelect={noop}
          isActive={i === 0}
        />
      ))}
    </div>
  );
}
