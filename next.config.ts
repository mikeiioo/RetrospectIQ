import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // Pin the root: a stray lockfile in a parent directory otherwise confuses detection.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
