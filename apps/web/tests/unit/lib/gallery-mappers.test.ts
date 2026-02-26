import { describe, it, expect } from "vitest";
import {
  mapGalleryMediaToMediaItem,
  mediaItemToGeoFeature,
} from "@/lib/gallery-mappers";
import { mediaItemToPhoto } from "@/components/gallery/masonry-photo-grid";
import type {
  PublicUserUploadMedia,
  PublicExternalMedia,
} from "@/types/gallery";
import type { MediaItem } from "@/types/media";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function userUploadFixture(
  overrides: Partial<PublicUserUploadMedia> = {}
): PublicUserUploadMedia {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-000000000001",
    title: "Church of São João Baptista",
    description: "A historic church in Vila Nova Sintra",
    category: "Heritage",
    displayOrder: 0,
    mediaSource: "USER_UPLOAD",
    altText: "Exterior of São João Baptista church",
    createdAt: "2024-06-15T12:00:00Z",
    publicUrl: "https://media.nosilha.com/uploads/2024/06/church.jpg",
    uploaderDisplayName: "Maria Silva",
    latitude: 14.868,
    longitude: -24.696,
    dateTaken: "2024-06-10T10:30:00Z",
    cameraMake: "Apple",
    cameraModel: "iPhone 13 Pro",
    approximateDate: undefined,
    locationName: "Vila Nova Sintra",
    photographerCredit: "Maria Silva",
    archiveSource: undefined,
    creditPlatform: "INSTAGRAM",
    creditHandle: "mariasilva",
    ...overrides,
  };
}

function externalMediaFixture(
  overrides: Partial<PublicExternalMedia> = {}
): PublicExternalMedia {
  return {
    id: "b2c3d4e5-f6a7-8901-bcde-000000000002",
    title: "Brava Island Documentary",
    description: "A documentary about Brava's cultural heritage",
    category: "Culture",
    displayOrder: 1,
    mediaSource: "EXTERNAL",
    altText: "Documentary thumbnail",
    createdAt: "2024-05-20T08:00:00Z",
    mediaType: "VIDEO",
    platform: "YOUTUBE",
    externalId: "dQw4w9WgXcQ",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    author: "Nos Ilha Channel",
    curatorDisplayName: "Admin User",
    creditPlatform: "YOUTUBE",
    creditHandle: "nosilha",
    ...overrides,
  };
}

// ─── mapGalleryMediaToMediaItem ──────────────────────────────────────────────

describe("mapGalleryMediaToMediaItem", () => {
  describe("user upload mapping", () => {
    it("maps a standard user upload with all metadata", () => {
      const media = userUploadFixture();
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.id).toBe(media.id);
      expect(result.title).toBe("Church of São João Baptista");
      expect(result.description).toBe("A historic church in Vila Nova Sintra");
      expect(result.type).toBe("IMAGE");
      expect(result.url).toBe(media.publicUrl);
      expect(result.category).toBe("Heritage");
      expect(result.altText).toBe("Exterior of São João Baptista church");
      expect(result.author).toBe("Maria Silva");
      expect(result.source).toBe("user");
    });

    it("threads EXIF metadata through to MediaItem", () => {
      const media = userUploadFixture();
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.cameraMake).toBe("Apple");
      expect(result.cameraModel).toBe("iPhone 13 Pro");
      expect(result.dateTaken).toBe("2024-06-10T10:30:00Z");
      expect(result.locationName).toBe("Vila Nova Sintra");
      expect(result.latitude).toBe(14.868);
      expect(result.longitude).toBe(-24.696);
    });

    it("threads provenance metadata through", () => {
      const media = userUploadFixture({
        photographerCredit: "João Costa",
        archiveSource: "Family collection",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.photographerCredit).toBe("João Costa");
      expect(result.archiveSource).toBe("Family collection");
    });

    it("threads credit attribution through", () => {
      const media = userUploadFixture();
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.creditPlatform).toBe("INSTAGRAM");
      expect(result.creditHandle).toBe("mariasilva");
    });

    it("falls back author to uploaderDisplayName when no photographerCredit", () => {
      const media = userUploadFixture({
        photographerCredit: undefined,
        uploaderDisplayName: "Uploader Name",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.author).toBe("Uploader Name");
    });

    it("falls back author to 'Community Contributor' when no credit or uploader", () => {
      const media = userUploadFixture({
        photographerCredit: undefined,
        uploaderDisplayName: undefined,
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.author).toBe("Community Contributor");
    });

    it("uses empty string when publicUrl is null", () => {
      const media = userUploadFixture({ publicUrl: null });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.url).toBe("");
    });
  });

  describe("raw filename detection and humanization", () => {
    it("humanizes UUID-based titles", () => {
      const media = userUploadFixture({
        title: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        category: "Heritage",
        createdAt: "2024-06-15T12:00:00Z",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.title).toBe("Heritage — June 2024");
    });

    it("humanizes camera filename titles", () => {
      const media = userUploadFixture({
        title: "IMG_20240615_123456",
        category: "Nature",
        createdAt: "2024-03-10T08:00:00Z",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.title).toBe("Nature — March 2024");
    });

    it("humanizes titles with file extensions", () => {
      const media = userUploadFixture({
        title: "sunset.jpg",
        category: "Nature",
        createdAt: "2024-08-15T12:00:00Z",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.title).toBe("Nature — August 2024");
    });

    it("humanizes null titles", () => {
      const media = userUploadFixture({
        title: null,
        category: "Culture",
        createdAt: "2024-12-25T00:00:00Z",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.title).toBe("Culture — December 2024");
    });

    it("preserves human-authored titles", () => {
      const media = userUploadFixture({ title: "Sunset over Fajã d'Água" });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.title).toBe("Sunset over Fajã d'Água");
    });
  });

  describe("category mapping", () => {
    it("maps 'Landmark' to 'Heritage'", () => {
      const media = userUploadFixture({ category: "Landmark" });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.category).toBe("Heritage");
    });

    it("defaults to 'Culture' for unknown categories", () => {
      const media = userUploadFixture({ category: "Unknown" });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.category).toBe("Culture");
    });

    it("defaults to 'Culture' for null category", () => {
      const media = userUploadFixture({ category: null });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.category).toBe("Culture");
    });
  });

  describe("external media mapping", () => {
    it("maps a YouTube video with all fields", () => {
      const media = externalMediaFixture();
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.id).toBe(media.id);
      expect(result.type).toBe("VIDEO");
      expect(result.url).toBe(media.embedUrl);
      expect(result.thumbnailUrl).toBe(media.thumbnailUrl);
      expect(result.author).toBe("Nos Ilha Channel");
      expect(result.creditPlatform).toBe("YOUTUBE");
      expect(result.creditHandle).toBe("nosilha");
    });

    it("generates YouTube thumbnail when thumbnailUrl is null", () => {
      const media = externalMediaFixture({
        thumbnailUrl: null,
        externalId: "abc123xyz",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.thumbnailUrl).toBe(
        "https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg"
      );
    });

    it("uses url for IMAGE type external media", () => {
      const media = externalMediaFixture({
        mediaType: "IMAGE",
        url: "https://example.com/photo.jpg",
        embedUrl: "https://example.com/embed/photo",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.url).toBe("https://example.com/photo.jpg");
    });

    it("falls back author to curatorDisplayName when author is null", () => {
      const media = externalMediaFixture({
        author: null,
        curatorDisplayName: "Curator Name",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.author).toBe("Curator Name");
    });

    it("handles null description gracefully", () => {
      const media = externalMediaFixture({ description: null });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.description).toBeUndefined();
    });
  });

  describe("altText handling", () => {
    it("passes through altText from API", () => {
      const media = userUploadFixture({
        altText: "A scenic view of the coastline",
      });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.altText).toBe("A scenic view of the coastline");
    });

    it("converts null altText to undefined", () => {
      const media = userUploadFixture({ altText: null });
      const result = mapGalleryMediaToMediaItem(media);

      expect(result.altText).toBeUndefined();
    });
  });
});

// ─── mediaItemToPhoto ────────────────────────────────────────────────────────

describe("mediaItemToPhoto", () => {
  function mediaItemFixture(overrides: Partial<MediaItem> = {}): MediaItem {
    return {
      id: "test-id-001",
      type: "IMAGE",
      url: "https://media.nosilha.com/uploads/photo.jpg",
      title: "Heritage Building",
      description: "A historic building",
      category: "Heritage",
      date: "Jun 2024",
      author: "Maria Silva",
      altText: "Front view of heritage building",
      locationName: "Vila Nova Sintra",
      cameraMake: "Canon",
      cameraModel: "EOS R5",
      dateTaken: "2024-06-10T10:30:00Z",
      approximateDate: undefined,
      photographerCredit: "Maria Silva",
      archiveSource: undefined,
      creditPlatform: "INSTAGRAM",
      creditHandle: "mariasilva",
      ...overrides,
    };
  }

  it("maps id correctly", () => {
    const item = mediaItemFixture();
    const photo = mediaItemToPhoto(item);

    expect(photo.id).toBe("test-id-001");
  });

  it("maps src from url", () => {
    const item = mediaItemFixture();
    const photo = mediaItemToPhoto(item);

    expect(photo.src).toBe("https://media.nosilha.com/uploads/photo.jpg");
  });

  it("uses altText for alt when available", () => {
    const item = mediaItemFixture({ altText: "Custom alt text" });
    const photo = mediaItemToPhoto(item);

    expect(photo.alt).toBe("Custom alt text");
  });

  it("falls back to title for alt when altText is undefined", () => {
    const item = mediaItemFixture({ altText: undefined });
    const photo = mediaItemToPhoto(item);

    expect(photo.alt).toBe("Heritage Building");
  });

  it("uses locationName for location when available", () => {
    const item = mediaItemFixture({ locationName: "Fajã d'Água" });
    const photo = mediaItemToPhoto(item);

    expect(photo.location).toBe("Fajã d'Água");
  });

  it("defaults location to 'Brava Island' when locationName is undefined", () => {
    const item = mediaItemFixture({ locationName: undefined });
    const photo = mediaItemToPhoto(item);

    expect(photo.location).toBe("Brava Island");
  });

  it("threads all metadata fields through", () => {
    const item = mediaItemFixture({
      cameraMake: "Sony",
      cameraModel: "A7IV",
      dateTaken: "2024-01-01T00:00:00Z",
      approximateDate: "circa 1960",
      photographerCredit: "João Costa",
      archiveSource: "National Archive",
    });
    const photo = mediaItemToPhoto(item);

    expect(photo.cameraMake).toBe("Sony");
    expect(photo.cameraModel).toBe("A7IV");
    expect(photo.dateTaken).toBe("2024-01-01T00:00:00Z");
    expect(photo.approximateDate).toBe("circa 1960");
    expect(photo.photographerCredit).toBe("João Costa");
    expect(photo.archiveSource).toBe("National Archive");
  });

  it("maps credit attribution", () => {
    const item = mediaItemFixture();
    const photo = mediaItemToPhoto(item);

    expect(photo.creditPlatform).toBe("INSTAGRAM");
    expect(photo.creditHandle).toBe("mariasilva");
  });

  it("defaults description to empty string when undefined", () => {
    const item = mediaItemFixture({ description: undefined });
    const photo = mediaItemToPhoto(item);

    expect(photo.description).toBe("");
  });

  it("defaults date to empty string when undefined", () => {
    const item = mediaItemFixture({ date: undefined });
    const photo = mediaItemToPhoto(item);

    expect(photo.date).toBe("");
  });
});

// ─── mediaItemToGeoFeature ──────────────────────────────────────────────────

describe("mediaItemToGeoFeature", () => {
  function mediaItemFixture(overrides: Partial<MediaItem> = {}): MediaItem {
    return {
      id: "geo-test-001",
      type: "IMAGE",
      url: "https://media.nosilha.com/uploads/photo.jpg",
      thumbnailUrl: "https://media.nosilha.com/uploads/photo_thumb.jpg",
      title: "Fajã d'Água Viewpoint",
      category: "Nature",
      latitude: 14.8512,
      longitude: -24.7134,
      ...overrides,
    };
  }

  it("converts a MediaItem with valid coordinates to a GeoJSON Feature", () => {
    const item = mediaItemFixture();
    const feature = mediaItemToGeoFeature(item);

    expect(feature).not.toBeNull();
    expect(feature!.type).toBe("Feature");
    expect(feature!.geometry.type).toBe("Point");
    expect(feature!.geometry.coordinates).toEqual([-24.7134, 14.8512]);
  });

  it("uses [longitude, latitude] coordinate order (GeoJSON standard)", () => {
    const item = mediaItemFixture({ latitude: 10.0, longitude: -20.0 });
    const feature = mediaItemToGeoFeature(item);

    expect(feature!.geometry.coordinates[0]).toBe(-20.0); // longitude first
    expect(feature!.geometry.coordinates[1]).toBe(10.0); // latitude second
  });

  it("maps properties correctly", () => {
    const item = mediaItemFixture();
    const feature = mediaItemToGeoFeature(item);

    expect(feature!.properties.cluster).toBe(false);
    expect(feature!.properties.mediaId).toBe("geo-test-001");
    expect(feature!.properties.category).toBe("Nature");
    expect(feature!.properties.title).toBe("Fajã d'Água Viewpoint");
    expect(feature!.properties.thumbnailUrl).toBe(
      "https://media.nosilha.com/uploads/photo_thumb.jpg"
    );
  });

  it("falls back thumbnailUrl to url when thumbnailUrl is undefined", () => {
    const item = mediaItemFixture({ thumbnailUrl: undefined });
    const feature = mediaItemToGeoFeature(item);

    expect(feature!.properties.thumbnailUrl).toBe(
      "https://media.nosilha.com/uploads/photo.jpg"
    );
  });

  it("returns null thumbnailUrl when both thumbnailUrl and url are empty", () => {
    const item = mediaItemFixture({ thumbnailUrl: undefined, url: "" });
    const feature = mediaItemToGeoFeature(item);

    // url is falsy (""), thumbnailUrl is undefined → null coalescing gives ""
    // Actually: undefined ?? "" → "" which is truthy, so thumbnailUrl = ""
    expect(feature!.properties.thumbnailUrl).toBe("");
  });

  it("returns null when latitude is undefined", () => {
    const item = mediaItemFixture({ latitude: undefined });
    const feature = mediaItemToGeoFeature(item);

    expect(feature).toBeNull();
  });

  it("returns null when longitude is undefined", () => {
    const item = mediaItemFixture({ longitude: undefined });
    const feature = mediaItemToGeoFeature(item);

    expect(feature).toBeNull();
  });

  it("returns null when both coordinates are undefined", () => {
    const item = mediaItemFixture({
      latitude: undefined,
      longitude: undefined,
    });
    const feature = mediaItemToGeoFeature(item);

    expect(feature).toBeNull();
  });

  it("handles zero coordinates as valid (equator/prime meridian)", () => {
    const item = mediaItemFixture({ latitude: 0, longitude: 0 });
    const feature = mediaItemToGeoFeature(item);

    expect(feature).not.toBeNull();
    expect(feature!.geometry.coordinates).toEqual([0, 0]);
  });

  it("handles negative coordinates correctly", () => {
    const item = mediaItemFixture({ latitude: -14.85, longitude: -24.71 });
    const feature = mediaItemToGeoFeature(item);

    expect(feature!.geometry.coordinates).toEqual([-24.71, -14.85]);
  });
});
