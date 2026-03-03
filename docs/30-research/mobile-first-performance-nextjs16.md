---
slug: mobile-first-performance-nextjs16
title: Mobile-First Frontend Performance Optimization with Next.js 16
aliases:
  - next16-performance
  - mobile-performance-nextjs
  - ppr-nextjs16
tags:
  - nextjs
  - performance
  - mobile
  - ppr
  - mapbox
  - maplibre
  - core-web-vitals
  - react19
  - caching
  - image-optimization
researched_at: 2026-02-26T00:00:00.000Z
expires_at: 2026-03-28T00:00:00.000Z
sources:
  - url: https://nextjs.org/blog/next-16
    title: Next.js 16 Official Release Notes
  - url: https://nextjs.org/docs/app/getting-started/cache-components
    title: Next.js Cache Components Documentation
  - url: https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide
    title: Core Web Vitals 2026 INP LCP CLS Optimization
  - url: https://www.infoq.com/news/2025/12/react-compiler-meta/
    title: Meta React Compiler 1.0 - InfoQ
  - url: https://makerkit.dev/blog/tutorials/react-19-2
    title: React 19.2 Upgrade Guide - MakerKit
  - url: https://focusreactive.com/configure-cdn-caching-for-self-hosted-next-js-websites
    title: CDN Caching for Self-hosted Next.js
  - url: https://www.sherpa.sh/blog/secrets-of-self-hosting-nextjs-at-scale-in-2025
    title: Secrets of Self-hosting Next.js at Scale 2025
  - url: https://nextjs.org/docs/app/guides/self-hosting
    title: Next.js Self-Hosting Official Guide
---

# Mobile-First Frontend Performance Optimization with Next.js 16

## Overview

This document captures current best practices (as of February 2026) for frontend performance optimization using Next.js 16, with specific focus on serving users in low-bandwidth markets such as Cape Verde (West Africa), Portugal, and the US East Coast on 3G/4G mobile devices.

Next.js 16 (released October 2025) fundamentally changes the rendering and caching model. The old implicit caching strategy is replaced with an explicit opt-in model via Cache Components and the `"use cache"` directive. Partial Prerendering (PPR) — experimental since 2023 — is now production-stable and completed via this same model. React 19.2 (bundled with Next.js 16) adds `<Activity>`, `useEffectEvent`, View Transitions, and the stable React Compiler.

The project (Nos Ilha) runs on **Google Cloud Run** (not Vercel), which has specific implications for image optimization, ISR caching, and edge delivery.

---

## 1. Partial Prerendering (PPR) — Status and Usage in Next.js 16

### Is PPR Stable in Next.js 16?

Yes. PPR is production-stable in Next.js 16, implemented through the **Cache Components** programming model. The previous `experimental.ppr` flag and `export const experimental_ppr` route exports have been removed. The `experimental.dynamicIO` flag has been renamed to `cacheComponents`.

Enable it in `next.config.ts`:

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

### How PPR Works

PPR splits a page into a **static shell** (prerendered at build time) and **dynamic holes** (deferred to request time, streamed via Suspense). The key insight: the static shell is delivered to the CDN as pure HTML — sub-100ms TTFB — while dynamic slots stream in without blocking.

```tsx
// app/heritage/[slug]/page.tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

// This static shell is prerendered — served instantly from CDN
export default function HeritagePage() {
  return (
    <>
      <SiteHeader />           {/* Static — always the same */}
      <CachedHeroImage />      {/* Cached — revalidates every 24h */}
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent />     {/* Dynamic — streamed per request */}
      </Suspense>
      <Suspense fallback={<MapSkeleton />}>
        <InteractiveMap />     {/* Dynamic — loaded on demand */}
      </Suspense>
    </>
  )
}

// Cached component — uses 'use cache' directive
async function CachedHeroImage() {
  'use cache'
  cacheLife('days')           // stale: 1d, revalidate: 7d, expire: 30d
  const image = await fetchHeroImage()
  return <HeroImageDisplay image={image} />
}
```

### The `"use cache"` Directive

The `"use cache"` directive can be applied at three levels:

```ts
// 1. File level — entire module is cached
'use cache'
export default async function BlogPage() { ... }

// 2. Component level — just this component
async function ProductGrid() {
  'use cache'
  cacheLife('hours')
  const data = await fetchProducts()
  return <Grid items={data} />
}

// 3. Function level — just this data fetch
export async function getSiteData() {
  'use cache'
  cacheLife({ stale: 3600, revalidate: 7200, expire: 86400 })
  return await db.query('SELECT ...')
}
```

Cache keys are **compiler-generated automatically** from serializable arguments and closed-over values. Non-serializable props (JSX, functions, Promises) are excluded from the key but restored at runtime.

### Real-World FCP/LCP Impact on Mobile

Benchmarks from production case studies (Nov-Dec 2025):

| Metric | Before PPR (fully dynamic) | After PPR + Cache Components |
|--------|---------------------------|------------------------------|
| TTFB | 800ms–1.2s | 50–100ms |
| FCP | ~2.5s (3G) | ~0.8s (3G) |
| LCP | ~3.8s (3G) | ~1.6s (3G) |

The gains are most pronounced for pages that mix mostly-stable content (cultural heritage articles) with a small amount of dynamic content (user preferences, view counts). For Nos Ilha, gallery pages, heritage pages, and directory listings are ideal PPR candidates.

### Critical: Self-Hosted Cache Behavior

When running on Cloud Run (multiple instances), `"use cache"` uses **in-memory caching by default**, which means each instance has its own cache and cache invalidation does not propagate across instances. Solutions:

1. Use `cacheHandlers` (plural) configuration with a shared Redis/Upstash instance for `"use cache"` directives.
2. Use the existing `cacheHandler` (singular) for ISR/route handler responses.
3. For Nos Ilha's current single-instance Cloud Run setup, in-memory is acceptable for content pages, but be aware of cold start cache misses.

```ts
// next.config.ts — for multi-instance deployments
const nextConfig = {
  cacheComponents: true,
  cacheHandlers: {
    default: require.resolve('./cache-handler-redis.js'),
  },
}
```

---

## 2. Mapbox GL JS Optimization and Alternatives

### Bundle Size Reality (2026)

| Library | Min+Gzip | Notes |
|---------|----------|-------|
| `mapbox-gl` v3.x | ~245 kB | Proprietary license, usage-based pricing |
| `maplibre-gl` v5.x | ~225 kB | Open source (BSD-2), drop-in API replacement |
| Leaflet v1.9 | ~42 kB | Raster tiles only, no WebGL, no vector tiles |

Both Mapbox GL JS and MapLibre GL JS are large (~225-250 kB gzipped). The bundle cost is unavoidable for full interactive vector maps. The strategy must be **lazy loading** — never including the library in the initial bundle.

### Recommendation: Switch to MapLibre GL JS

For Nos Ilha, MapLibre GL JS v5 (Jan 2025) is the correct choice:
- Identical API to Mapbox GL JS (drop-in replacement via `react-map-gl/maplibre`)
- No Mapbox account or API key required for self-hosted tile sources
- Can use free tile providers (MapTiler, Stadia Maps, OpenFreeMap) or self-hosted PMTiles
- `react-map-gl` v8 (Oct 2025) provides first-class MapLibre v5 support via `react-map-gl/maplibre`
- Smaller total cost: no per-load billing, no proprietary dependency

### Pattern: Static Image Preview → Interactive Swap

This is the critical pattern for mobile users on slow connections. Show a static image immediately; swap to the interactive map only when the user explicitly requests it.

```tsx
// components/heritage-map.tsx
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Image from 'next/image'

// MapLibre is NOT in the initial bundle — loads only when user clicks
const InteractiveMap = dynamic(
  () => import('./interactive-map-inner'),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
)

interface HeritageMapProps {
  lat: number
  lng: number
  zoom: number
  siteName: string
  // Pre-generated static image URL (Mapbox Static Images API or MapTiler)
  staticImageUrl: string
}

export function HeritageMap({ lat, lng, zoom, siteName, staticImageUrl }: HeritageMapProps) {
  const [isInteractive, setIsInteractive] = useState(false)

  if (isInteractive) {
    return (
      <InteractiveMap
        lat={lat}
        lng={lng}
        zoom={zoom}
        siteName={siteName}
      />
    )
  }

  return (
    <div className="relative">
      <Image
        src={staticImageUrl}
        alt={`Map showing location of ${siteName}`}
        width={800}
        height={450}
        className="rounded-lg"
        priority={false}
      />
      <button
        onClick={() => setIsInteractive(true)}
        className="absolute bottom-3 right-3 bg-white/90 px-3 py-2 rounded-md text-sm shadow"
      >
        View interactive map
      </button>
    </div>
  )
}
```

```tsx
// components/interactive-map-inner.tsx
'use client'

import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAPTILER_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`

export default function InteractiveMapInner({ lat, lng, zoom, siteName }: Props) {
  return (
    <Map
      initialViewState={{ longitude: lng, latitude: lat, zoom }}
      style={{ width: '100%', height: 450 }}
      mapStyle={MAPTILER_STYLE}
    >
      <NavigationControl />
      <Marker longitude={lng} latitude={lat}>
        <span title={siteName}>📍</span>
      </Marker>
    </Map>
  )
}
```

### Static Map Image URL Generation

Generate static map preview images using the Mapbox Static Images API (free tier: 50,000 requests/month) or MapTiler Static Maps API. Store the URL as part of your site/location data in the database.

```
# Mapbox Static Images API example
https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/
  pin-s+ff0000({lng},{lat})/
  {lng},{lat},{zoom},0/
  800x450@2x
  ?access_token={TOKEN}
```

For Nos Ilha, generate these URLs at content ingestion time and cache them. This means the map page loads with zero JavaScript for the map until the user opts in.

### Lighter Alternative for Simple Use Cases

For pages that only need to **show location** (no interaction, no custom data layers), consider:
- **Mapbox Static Images API** / **MapTiler Static Maps** — just an `<Image>` tag, zero JS
- **Google Maps Embed API** — free for basic embeds, no JS library needed

Reserve interactive MapLibre only for the directory/gallery pages where users need to explore.

---

## 3. Edge Caching Strategies for Next.js 16 on Cloud Run

### Four Caching Layers

Next.js 16 has four distinct caching layers:

| Layer | Scope | Controlled by |
|-------|-------|---------------|
| Request Memoization | Single render pass | Automatic (deduplicates identical `fetch` calls) |
| Data Cache | Across requests | `"use cache"` + `cacheLife()` |
| Full Route Cache | Prerendered pages | `cacheComponents: true` + `revalidate` |
| Router Cache | Client-side navigation | Automatic, TTL-based prefetch cache |

### Cache-Control Headers for Cloud Run + Cloudflare

When self-hosting on Cloud Run behind Cloudflare (recommended), configure `Cache-Control` headers explicitly in `next.config.ts`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [
      {
        // Static assets — cache forever (hashed filenames)
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Public assets (images, fonts)
        source: '/public/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Heritage/directory content pages — ISR-friendly
        source: '/(directory|heritage|gallery)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}
```

### ISR vs `"use cache"` in Next.js 16

For App Router with Next.js 16, the **recommended approach** is `"use cache"` + `cacheLife()` at the component/function level rather than route-level `export const revalidate`. They can coexist but serve different purposes:

```ts
// OLD approach (still works, route-level)
export const revalidate = 3600 // entire route regenerates every hour

// NEW approach (preferred, component-level granularity)
async function ArticleContent({ slug }: { slug: string }) {
  'use cache'
  cacheLife({ stale: 3600, revalidate: 7200, expire: 604800 })
  cacheTag(`article-${slug}`, 'articles')
  return await fetchArticle(slug)
}
```

`cacheTag` enables on-demand revalidation via `revalidateTag('articles')` from a Server Action or API route when content is updated.

### `revalidateTag` in Next.js 16

In Next.js 16, `revalidateTag()` now requires a `cacheLife` profile as the second argument:

```ts
import { revalidateTag } from 'next/cache'

// In a Server Action triggered by CMS webhook
export async function revalidateArticle(slug: string) {
  'use server'
  revalidateTag(`article-${slug}`, 'max')
}
```

### Cloudflare Stale-While-Revalidate

Cloudflare supports `stale-while-revalidate` in `Cache-Control` headers. For content-heavy pages serving Cape Verde and diaspora users (PT/US East Coast), this is highly effective: users get instant cached responses while Cloudflare refreshes in the background.

Key Cloudflare settings for Next.js self-hosted:
- Enable **Tiered Caching** (reduces origin hits)
- Set **Cache TTL** via Page Rules or Cache Rules to honor `s-maxage`
- Enable **Early Hints** (103) to push preloads before full response
- Use **Polish** (image optimization at CDN layer) as a supplement to Sharp

### ISR Cache Persistence on Cloud Run

Cloud Run containers are ephemeral. The file-based ISR cache (`.next/cache/`) is lost on container restart. For production reliability:

```js
// cache-handler.js — custom cache handler for shared storage
// Use @neshca/cache-handler with Redis or Upstash
const { CacheHandler } = require('@neshca/cache-handler')
const createRedisHandler = require('@neshca/cache-handler/redis-strings')

CacheHandler.onCreation(async () => {
  const redisClient = createClient({ url: process.env.REDIS_URL })
  await redisClient.connect()
  return {
    handlers: [createRedisHandler({ client: redisClient })],
  }
})

module.exports = CacheHandler
```

For Nos Ilha's current low-traffic situation, the **in-memory default is acceptable** for a single Cloud Run instance. Add Redis when scaling to multiple instances or when cache warm-up time on cold starts becomes a problem.

---

## 4. Image Optimization on Non-Vercel Platforms (Cloud Run)

### Sharp is Now Auto-Installed (Next.js 15+)

Since Next.js 15, `sharp` is installed automatically as a dependency (no longer optional). However, when using **Docker + standalone build mode**, there is a known issue where `sharp` is not included in the standalone output.

**Fix for Docker/Cloud Run:**

```json
// package.json — add sharp as an explicit direct dependency
{
  "dependencies": {
    "sharp": "^0.33.0"
  }
}
```

Then in your Dockerfile, ensure it is installed:

```dockerfile
FROM node:22-alpine AS runner
# Sharp requires libc on Alpine — use glibc-based image OR install compat layer
FROM node:22-slim AS runner   # Debian-slim is preferred for Sharp on Cloud Run
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Sharp is already in node_modules from the standalone output with explicit dep
EXPOSE 3000
CMD ["node", "server.js"]
```

**Note for Alpine Linux**: Sharp requires a glibc-compatible system. Use `node:22-slim` (Debian) rather than `node:22-alpine` on Cloud Run to avoid Sharp compatibility issues and excessive memory usage.

### Next.js `<Image>` Component Best Practices

```tsx
// Hero images above the fold — always priority
<Image
  src="/images/brava-landscape.jpg"
  alt="Landscape view of Brava island"
  width={1200}
  height={630}
  priority            // Preloads in <head>, skip lazy loading
  sizes="100vw"
  quality={80}        // Default is 75; 80 for hero images
/>

// Gallery thumbnails — lazy load, responsive sizes
<Image
  src={photo.url}
  alt={photo.caption}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  // No priority — lazy loads as user scrolls
/>
```

### AVIF vs WebP: Format Selection

In Next.js 16, configure accepted formats in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // AVIF first: ~50% smaller than JPEG, supported by Chrome 85+, Firefox 93+, Safari 16+
    // WebP fallback for older browsers
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // For external images from Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

### External Image CDN as Alternative

For high-traffic or large image libraries, consider offloading image optimization to an external service rather than Sharp on Cloud Run:

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| Sharp (self-hosted) | Free | No external dependency | CPU/memory on Cloud Run |
| Cloudflare Images | $5/mo + usage | CDN-native, global | Additional cost |
| Imgix | Usage-based | Feature-rich | Cost at scale |
| Cloudinary | Free tier 25GB | Transformation API | Vendor lock-in |

For Nos Ilha's current scale (volunteer project), Sharp on Cloud Run with Cloudflare CDN caching the optimized outputs is the right balance.

---

## 5. Core Web Vitals 2026 Thresholds and Mobile Best Practices

### Current Thresholds (unchanged from March 2024 update)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | 200–500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| TTFB (Time to First Byte) | ≤ 800ms | — | — |

**INP replaced FID in March 2024.** As of 2026, 43% of sites still fail the 200ms INP threshold. LCP and CLS are the metrics most improved by PPR + image optimization.

### Mobile 3G/4G Reality for Cape Verde Users

Cape Verde's mobile infrastructure uses 3G/4G LTE. Typical conditions:
- 3G: ~1.5 Mbps download, 150ms RTT
- 4G LTE: ~10 Mbps download, 50ms RTT

Target performance budget for a heritage content page at 3G:
- TTFB: < 200ms (served from CDN edge, not Cloud Run origin)
- FCP: < 1.5s
- LCP: < 2.5s
- TTI: < 4s
- Total page weight: < 500 kB (first load), < 200 kB (navigation)

### Highest-Impact Fixes by Metric

**LCP (most impactful fixes):**
1. PPR / `"use cache"` to serve static shell from CDN edge
2. `priority` prop on hero `<Image>` — eliminates LCP image discovery delay
3. Preload hero image in `<head>` if not using Next.js Image:
   ```html
   <link rel="preload" as="image" href="/hero.avif" fetchpriority="high" />
   ```
4. Inline critical CSS (Next.js does this automatically for CSS Modules)
5. Font preloading with `display: swap`:
   ```tsx
   // app/layout.tsx
   import localFont from 'next/font/local'
   const siteFont = localFont({
     src: './fonts/site-font.woff2',
     display: 'swap',
     preload: true,
   })
   ```

**INP (most impactful fixes):**
1. React Compiler (automatic memoization eliminates re-render overhead)
2. Break long tasks — any event handler > 50ms must yield:
   ```ts
   async function handleGalleryFilter(filter: string) {
     // Yield to browser before heavy filter operation
     await new Promise(resolve => setTimeout(resolve, 0))
     applyFilter(filter)
   }
   ```
3. Debounce search inputs (≥ 300ms)
4. Use `startTransition` for non-urgent state updates (switching gallery views, filters)

**CLS (most impactful fixes):**
1. Always specify `width` and `height` on `<Image>` — Next.js enforces this
2. Reserve space for dynamically loaded content (Suspense fallbacks with matching dimensions)
3. Font display swap with `size-adjust` fallback font:
   ```tsx
   const font = localFont({
     src: './fonts/font.woff2',
     display: 'swap',
     adjustFontFallback: true,  // Next.js auto-adjusts fallback metrics
   })
   ```
4. Do not inject content above existing content on page load

### Measuring Real User Performance

Google CrUX (Chrome User Experience Report) drives rankings, not Lighthouse lab scores. For Nos Ilha, monitor with:
- **Google Search Console** → Core Web Vitals report (field data)
- **Vercel Speed Insights** alternative for self-hosted: `@vercel/speed-insights` still works on Cloud Run
- Alternatively, use the free tier of **Sentry** with performance monitoring enabled

---

## 6. React 19 Performance Features

### What Ships in React 19 / 19.2 (Next.js 16 Bundle)

Next.js 16 ships with React 19.2 (released October 2025). Key performance-relevant additions:

#### React Compiler — Stable (React 19 + Next.js 16)

The React Compiler (formerly "React Forget") reached 1.0 in December 2025. It is now stable in Next.js 16 with `reactCompiler: true` in config.

**What it does:** Performs automatic memoization at build time. Inserts cache boundaries per reactive scope rather than per hook call. Eliminates the need for manual `useMemo`, `useCallback`, and `React.memo` in most cases.

**Production results from Meta:** Up to 12% faster initial loads, 2.5x faster interactions in the Meta Quest Store. Sanity Studio and Wakelet report measurable rendering efficiency improvements.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,  // stable in Next.js 16
}
```

**Caution:** Do not enable blindly. The compiler requires code that follows React's Rules of Hooks strictly. Run `eslint-plugin-react-hooks` v6 (ships with compiler) first to identify violations.

```bash
# Check for compiler-incompatible patterns before enabling
npx react-compiler-healthcheck
```

#### `use()` Hook — Consume Promises in Components

The `use()` hook allows suspending on a Promise directly inside a component, replacing `useEffect` + `useState` loading patterns:

```tsx
import { use, Suspense } from 'react'

async function getGalleryData(id: string): Promise<GalleryItem[]> {
  const res = await fetch(`/api/gallery/${id}`)
  return res.json()
}

// In a Server Component, create the Promise
export default function GalleryPage({ params }: { params: { id: string } }) {
  const galleryPromise = getGalleryData(params.id)  // no await here

  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent galleryPromise={galleryPromise} />
    </Suspense>
  )
}

// Client component reads the Promise
function GalleryContent({ galleryPromise }: { galleryPromise: Promise<GalleryItem[]> }) {
  const items = use(galleryPromise)  // suspends until resolved
  return <GalleryGrid items={items} />
}
```

This pattern removes the client-side waterfall: the Promise starts on the server, is passed to the client, and the client suspends without issuing a new network request.

#### `<Activity>` Component (React 19.2)

Preserves component state when hidden, unlike CSS `display: none` which destroys state. Useful for tab-based UIs, slide-out panels, and gallery views:

```tsx
import { Activity } from 'react'

// Gallery view switcher — preserves scroll position and loaded data
function GalleryViewSwitcher({ activeView }: { activeView: 'grid' | 'timeline' }) {
  return (
    <>
      <Activity mode={activeView === 'grid' ? 'visible' : 'hidden'}>
        <GridView />          {/* State preserved when switching to timeline */}
      </Activity>
      <Activity mode={activeView === 'timeline' ? 'visible' : 'hidden'}>
        <TimelineView />      {/* State preserved when switching to grid */}
      </Activity>
    </>
  )
}
```

When `mode="hidden"`: children are hidden from DOM, effects are unmounted (cleanup runs), updates are deferred, but state is preserved in memory.

#### View Transitions (React 19.2 + Next.js 16)

Native browser View Transitions API, integrated with React. Next.js 16 uses `<Activity>` for client-side navigation when `cacheComponents` is enabled.

```tsx
// Enable in next.config.ts
const nextConfig = {
  viewTransition: true,  // experimental in Next.js 16
}

// In components — CSS class applied during transition
// _view-transition.css
::view-transition-old(gallery-image),
::view-transition-new(gallery-image) {
  animation-duration: 0.3s;
}
```

#### `useEffectEvent` (React 19.2)

Stable function reference inside `useEffect` that always reads latest props/state, eliminating stale closure bugs and unnecessary effect re-runs:

```tsx
import { useEffect, useEffectEvent } from 'react'

function MapComponent({ onLocationChange, currentFilter }: Props) {
  // onConnected is stable — doesn't cause effect re-runs when currentFilter changes
  const onMapMove = useEffectEvent((event: MapMoveEvent) => {
    onLocationChange(event.center, currentFilter)  // always sees latest currentFilter
  })

  useEffect(() => {
    const map = initializeMap()
    map.on('moveend', onMapMove)
    return () => map.off('moveend', onMapMove)
  }, [])  // No dependency on currentFilter needed — useEffectEvent handles it
}
```

### Suspense SSR Batching (React 19.2)

React 19.2 batches Suspense boundary reveals during SSR streaming. Instead of each Suspense boundary streaming independently (which can cause visual jitter), React batches reveals into short windows, creating smoother progressive loading. This directly improves perceived performance on slow mobile connections.

---

## Application to Nos Ilha

### Priority Optimizations (Immediate Impact)

1. **Enable Cache Components** in `next.config.ts` — single config line, immediate TTFB improvement for all content pages
2. **Static image → interactive map swap** — eliminates 225 kB MapLibre from initial page load
3. **Migrate from Mapbox to MapLibre GL JS** — removes proprietary dependency and API key billing risk
4. **Add `priority` to hero images** on heritage/gallery pages — fixes LCP for above-fold images
5. **Explicit `width`/`height` on all images** — prevents CLS (already enforced by Next.js Image)

### Medium-Term Optimizations

6. **Enable React Compiler** after running healthcheck — eliminates manual `useMemo`/`useCallback` debt
7. **Configure Cloudflare CDN** in front of Cloud Run with proper `Cache-Control` headers
8. **Use `<Activity>`** for gallery view switching (grid/timeline/map) — preserves state on tab switch
9. **Font preloading** with `adjustFontFallback: true` — eliminates font-induced CLS

### Caching Strategy for Content Pages

```
Heritage pages (/heritage/[slug]):
  - Static shell: prerendered at build time (PPR)
  - Article content: 'use cache', cacheLife('days'), cacheTag('heritage', slug)
  - Gallery images: 'use cache', cacheLife('weeks')
  - Map preview: static image (no JS), lazy interactive map on demand

Gallery pages (/gallery/*):
  - Timeline view: 'use cache', cacheLife('hours'), cacheTag('gallery-timeline')
  - Individual photos: 'use cache', cacheLife('days')

Directory pages (/directory/[category]):
  - Listing: 'use cache', cacheLife('hours'), cacheTag('directory', category)
  - Map view: static image preview + lazy MapLibre

On-demand revalidation:
  - Spring Boot API fires webhook on content update → Next.js API route → revalidateTag()
```

---

## References

| Source | URL |
|--------|-----|
| Next.js 16 Release Notes | https://nextjs.org/blog/next-16 |
| Cache Components Docs | https://nextjs.org/docs/app/getting-started/cache-components |
| Next.js Self-Hosting Guide | https://nextjs.org/docs/app/guides/self-hosting |
| React 19.2 Upgrade Guide | https://makerkit.dev/blog/tutorials/react-19-2 |
| React Compiler 1.0 InfoQ | https://www.infoq.com/news/2025/12/react-compiler-meta/ |
| Core Web Vitals 2026 | https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide |
| CWV Pass Guide 2026 | https://www.corewebvitals.io/core-web-vitals/how-to-pass |
| MapLibre GL JS | https://maplibre.org/maplibre-gl-js/docs/ |
| react-map-gl v8 | https://visgl.github.io/react-map-gl/docs/whats-new |
| CDN Caching Self-hosted Next.js | https://focusreactive.com/configure-cdn-caching-for-self-hosted-next-js-websites |
| Self-hosting Next.js at Scale | https://www.sherpa.sh/blog/secrets-of-self-hosting-nextjs-at-scale-in-2025 |
| Sharp in Docker/Next.js | https://ermakovich.ru/posts/2025-06-30-fix-image-optimization-nextjs-standalone-build/ |
