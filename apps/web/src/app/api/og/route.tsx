import { ImageResponse } from "next/og";

import { createComponentLogger } from "@/lib/logger";
import { OgTemplate } from "./og-template";

const log = createComponentLogger("OGRoute");

const ALLOWED_IMAGE_HOSTS = [
  "storage.googleapis.com",
  "media.nosilha.com",
  "images.unsplash.com",
];

function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some(
        (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
      )
    );
  } catch {
    return false;
  }
}

// Google Fonts static weight URLs (extracted from CSS API)
const FONT_URLS = {
  outfitRegular:
    "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf",
  outfitBold:
    "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf",
  frauncesBold:
    "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf",
};

let fontCache: {
  outfit: ArrayBuffer;
  outfitBold: ArrayBuffer;
  fraunces: ArrayBuffer;
} | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;

  const [outfit, outfitBold, fraunces] = await Promise.all([
    fetch(FONT_URLS.outfitRegular).then((res) => res.arrayBuffer()),
    fetch(FONT_URLS.outfitBold).then((res) => res.arrayBuffer()),
    fetch(FONT_URLS.frauncesBold).then((res) => res.arrayBuffer()),
  ]);

  fontCache = { outfit, outfitBold, fraunces };
  return fontCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "default";
  const title = searchParams.get("title") || "Nos Ilha - Brava, Cape Verde";
  const category = searchParams.get("category") || undefined;
  const slug = searchParams.get("slug") || undefined;
  const subtitle = searchParams.get("subtitle") || undefined;

  if (!["default", "directory", "article", "gallery"].includes(type)) {
    return new Response("Invalid type parameter", { status: 400 });
  }

  try {
    const fonts = await loadFonts();

    // For directory type, try to resolve image from slug
    let imageUrl: string | undefined;
    if (type === "directory" && slug) {
      const imageParam = searchParams.get("image");
      if (imageParam && isSafeImageUrl(imageParam)) {
        imageUrl = imageParam;
      }
    }

    return new ImageResponse(
      <OgTemplate
        type={type as "default" | "directory" | "article" | "gallery"}
        title={decodeURIComponent(title)}
        subtitle={subtitle ? decodeURIComponent(subtitle) : undefined}
        category={category ? decodeURIComponent(category) : undefined}
        imageUrl={imageUrl}
      />,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Outfit",
            data: fonts.outfit,
            style: "normal" as const,
            weight: 400 as const,
          },
          {
            name: "Outfit",
            data: fonts.outfitBold,
            style: "normal" as const,
            weight: 700 as const,
          },
          {
            name: "Fraunces",
            data: fonts.fraunces,
            style: "normal" as const,
            weight: 700 as const,
          },
        ],
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
        },
      }
    );
  } catch (error) {
    log.error(
      "OG image generation failed",
      error instanceof Error ? error : new Error(String(error))
    );
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
