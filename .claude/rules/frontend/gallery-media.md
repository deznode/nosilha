---
paths: apps/web/**
---

# Gallery Media URL Handling

## URL Field Semantics

External media (`PublicExternalMedia`) has three URL fields with distinct purposes:

| Field | Contains | Safe for `<Image>`? |
|-------|----------|---------------------|
| `url` | Original source URL (YouTube watch/embed URL for VIDEO, direct image URL for IMAGE) | Only for IMAGE |
| `thumbnailUrl` | Stored thumbnail — may be a video page URL if data was ingested incorrectly | Use `resolveExternalThumbnail()` |
| `embedUrl` | Embeddable player URL (YouTube `/embed/...`) | Never — use in `<iframe>` only |

User uploads (`PublicUserUploadMedia`) have `publicUrl` — always safe for `<Image>`.

## Golden Rule

**Never pass an external VIDEO/AUDIO `url` or `embedUrl` to `next/image`.**

These are video page or player URLs (e.g. `youtube.com/embed/...`, `youtube.com/watch?v=...`), not image URLs. Passing them to `<Image>` crashes the page.

## Required Pattern: Resolving Image URLs

Always use `resolveExternalThumbnail()` from `@/lib/gallery-mappers` for external VIDEO/AUDIO thumbnails:

```typescript
import { resolveExternalThumbnail } from "@/lib/gallery-mappers";

// For external media, branch on mediaType:
if (media.mediaType === "IMAGE") {
  imageUrl = media.url || media.thumbnailUrl || null;  // url is a direct image URL
} else {
  // VIDEO/AUDIO: resolve safe thumbnail, never use url/embedUrl for <Image>
  imageUrl = resolveExternalThumbnail(media.thumbnailUrl, media.platform, media.externalId);
}
```

`resolveExternalThumbnail()` filters out non-image URLs and falls back to YouTube's thumbnail API (`img.youtube.com/vi/{id}/hqdefault.jpg`).

## Rendering Pattern: VIDEO vs IMAGE

```tsx
// VIDEO items: render YouTubeFacade (thumbnail + play button → iframe)
{media.mediaSource === "EXTERNAL" && media.mediaType === "VIDEO" ? (
  <YouTubeFacade video={videoMediaItem} />
) : imageUrl ? (
  <Image src={imageUrl} ... />
) : (
  <div>Image not available</div>
)}
```

Import: `import { YouTubeFacade } from "@/components/gallery/youtube-facade"`

## Quick Lookup: Which URL for `<Image>`

| Source | Type | Use for `<Image>` |
|--------|------|-------------------|
| `USER_UPLOAD` | IMAGE | `publicUrl` |
| `EXTERNAL` | IMAGE | `url` or `thumbnailUrl` |
| `EXTERNAL` | VIDEO | `resolveExternalThumbnail(thumbnailUrl, platform, externalId)` |
| `EXTERNAL` | AUDIO | `resolveExternalThumbnail(thumbnailUrl, platform, externalId)` |

## Canonical Mapping

`mapGalleryMediaToMediaItem()` in `apps/web/src/lib/gallery-mappers.ts` is the authoritative mapper. It correctly handles all media types. When building new gallery list views, prefer using this mapper over writing custom URL resolution logic.

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/gallery-mappers.ts` | `resolveExternalThumbnail()`, `mapGalleryMediaToMediaItem()` |
| `apps/web/src/types/gallery.ts` | `PublicExternalMedia`, `PublicUserUploadMedia` type definitions |
| `apps/web/src/types/media.ts` | `MediaItem` (frontend-normalized shape) |
| `apps/web/src/components/gallery/youtube-facade.tsx` | YouTube thumbnail + play button → iframe facade |
