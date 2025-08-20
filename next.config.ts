import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['convex'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
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