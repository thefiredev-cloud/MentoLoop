import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['convex'],
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  },
  webpack: (config) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').join(__dirname, './')
    }
    return config
  }
};

export default nextConfig;