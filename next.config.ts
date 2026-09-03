import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["better-sqlite3", "@netlify/blobs"],
  async rewrites() {
    // Missing public/uploads files (e.g. on Netlify) are served from Blobs via API.
    return [{ source: "/uploads/:name", destination: "/api/media/:name" }];
  },
};

export default nextConfig;
