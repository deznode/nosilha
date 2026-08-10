import { Banner } from "frontend";

const noop = () => {};

/** Default tone. */
export function Default() {
  return (
    <Banner
      title="Help us fill the archive"
      message="Six of our eight directory entries have no photograph. If you have pictures of Brava, we would like to include them."
      linkUrl="/contribute"
    />
  );
}

/** High-contrast tone. */
export function HighContrast() {
  return (
    <Banner
      tone="high-contrast"
      title="Nos Ilha is in early development"
      message="Entries are incomplete and details may be wrong. Corrections are welcome."
      linkUrl="/about"
    />
  );
}

/** Dismissible. */
export function Dismissible() {
  return (
    <Banner
      title="New in the gallery"
      message="Twenty-six photographs from the 2026 collection are now online."
      linkUrl="/gallery"
      showDismissButton
      onDismiss={noop}
    />
  );
}
