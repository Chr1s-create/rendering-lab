import type { NextConfig } from "next";
import path from "node:path";

// Modern model: Cache Components (PPR). Route segment config like
// `export const revalidate` / `dynamic` is NOT allowed here; use 'use cache' + cacheLife instead.
const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["@lab/learn-ui"],
  turbopack: { root: path.join(__dirname, "../..") },
  cacheLife: {
    // custom profile used in /cache-life
    lab: { stale: 5, revalidate: 10, expire: 60 },
  },
};

export default nextConfig;
