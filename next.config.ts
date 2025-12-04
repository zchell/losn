import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['fs', 'path'],
};

export default nextConfig;
