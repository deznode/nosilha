import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    content: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
    entry: {
      stale: 60,
      revalidate: 1800,
      expire: 86400,
    },
    longLived: {
      stale: 600,
      revalidate: 7200,
      expire: 604800,
    },
  },
  reactCompiler: true,
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudflare-image-loader.ts",
    // remotePatterns retained for development mode (custom loader bypasses in dev)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.nosilha.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/directory/landmark",
        destination: "/directory/heritage",
        permanent: true, // 301 redirect for SEO after Landmark → Heritage split
      },
      {
        source: "/directory/entry/:slug",
        destination: "/api/redirect/entry/:slug",
        permanent: false, // Use temporary redirect to API handler
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isDev
              ? "no-store, max-age=0"
              : "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking - blocks site from being embedded in iframes
          { key: "X-Frame-Options", value: "DENY" },

          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },

          // Force HTTPS (Cloud Run handles TLS, but good for defense in depth)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },

          // Content Security Policy - allows MapLibre/CARTO, Google Analytics, Supabase, fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}'wasm-unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://static.cloudflareinsights.com`,
              "style-src 'self' 'unsafe-inline' https://basemaps.cartocdn.com https://fonts.googleapis.com",
              // `https:` already covers every https host — no per-host entries needed here.
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${isDev ? "http://localhost:8080 " : ""}https://api.nosilha.com https://*.nosilha.com https://*.cartocdn.com https://fonts.openmaptiles.org https://s3.amazonaws.com/elevation-tiles-prod/ https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co https://www.clarity.ms https://*.clarity.ms https://*.r2.cloudflarestorage.com https://cloudflareinsights.com`,
              "worker-src 'self' blob:",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
