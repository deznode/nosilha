import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
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

          // Content Security Policy - allows Mapbox, Google Analytics, Supabase, fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://*.mapbox.com https://*.supabase.co",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:8080 https://api.nosilha.com https://*.nosilha.com https://api.mapbox.com https://*.mapbox.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co https://www.clarity.ms https://*.clarity.ms https://*.r2.cloudflarestorage.com",
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
