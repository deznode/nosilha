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
    ];
  },
};

export default nextConfig;
