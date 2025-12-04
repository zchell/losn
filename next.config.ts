import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.riker.replit.dev',
    '*.repl.co',
    'localhost:5000',
    '127.0.0.1:5000',
  ],
};

export default nextConfig;
