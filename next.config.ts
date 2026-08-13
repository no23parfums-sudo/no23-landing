import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    // Include 100 so Section 3 can request maximum encoder quality when optimized.
    qualities: [75, 85, 88, 100],
    // Dev-only: bypass optimizer so same-filename /public replaces show immediately.
    // Production keeps default next/image optimization.
    ...(isDev ? { unoptimized: true } : {}),
  },
};

export default nextConfig;
