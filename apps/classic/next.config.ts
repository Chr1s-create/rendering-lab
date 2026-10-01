import type { NextConfig } from "next";
import path from "node:path";

// Classic model: NO cacheComponents, so route segment config
// (export const revalidate / dynamic) and fetch cache options work as in Next 13-15.
const nextConfig: NextConfig = {
  transpilePackages: ["@lab/learn-ui"],
  turbopack: { root: path.join(__dirname, "../..") },
};

export default nextConfig;
