import { MetadataBadges } from "frontend";

/*
 * The prop is a PhotoMetadata, not a loose bag: dateTimeOriginal is a real
 * Date, camera fields are `make`/`model` (not cameraMake/cameraModel), and
 * gpsPrivacyLevel is required. The component returns null for a falsy
 * metadata, so there is no "empty object" story — the honest empty case is
 * `null`.
 */

/** A modern upload with full EXIF and precise coordinates. */
export function FullExif() {
  return (
    <MetadataBadges
      metadata={{
        dateTimeOriginal: new Date("2026-02-11T09:14:00Z"),
        make: "Fujifilm",
        model: "X-T5",
        latitude: 14.8564,
        longitude: -24.7361,
        locationName: "Fajã d'Água",
        photoType: "CULTURAL_SITE",
        gpsPrivacyLevel: "FULL",
        hasExifData: true,
      }}
    />
  );
}

/** Coordinates deliberately blurred before publication. */
export function ApproximateLocation() {
  return (
    <MetadataBadges
      metadata={{
        dateTimeOriginal: new Date("2026-01-30T15:02:00Z"),
        make: "Apple",
        model: "iPhone 15 Pro",
        locationName: "Nossa Senhora do Monte",
        photoType: "COMMUNITY_EVENT",
        gpsPrivacyLevel: "APPROXIMATE",
        hasExifData: true,
      }}
    />
  );
}

/**
 * A donated historical photograph: no EXIF at all, only what a contributor
 * could tell us. This is the common case for the archive's older material.
 */
export function ManualHistorical() {
  return (
    <MetadataBadges
      metadata={{
        approximateDate: "1960s",
        locationName: "Nova Sintra",
        archiveSource: "Family collection",
        photoType: "PERSONAL",
        gpsPrivacyLevel: "NONE",
        hasExifData: false,
      }}
    />
  );
}

/** Nothing known yet, with the prompt to fill details in by hand. */
export function UnknownWithPrompt() {
  return (
    <MetadataBadges
      metadata={{
        photoType: "PERSONAL",
        gpsPrivacyLevel: "STRIPPED",
        hasExifData: false,
      }}
      showManualPrompt
    />
  );
}
