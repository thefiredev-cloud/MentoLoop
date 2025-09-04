import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['convex'],
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // Ensure type errors fail the build for security
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ensure ESLint errors fail the build for code quality
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  },
  webpack: (config) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, './')
    }
    return config
  },
  // Increase body size limit for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;