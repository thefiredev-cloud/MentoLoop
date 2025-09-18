import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['convex'],
  outputFileTracingRoot: path.join(__dirname),
  // Expose Sentry DSN to the client without adding new Netlify vars
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN,
  },
  typescript: {
    // Ensure type errors fail the build for security
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ensure ESLint errors fail the build for code quality
    ignoreDuringBuilds: false,
  },
  images: {
    // Enable image optimization for better performance
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [], // Add external domains if needed
    // Enable placeholder for better UX
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, './')
    }
    
    // Optimize for production (temporarily disable vendor splitting to fix SSR issues)
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 40,
              enforce: true,
            },
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|@tabler)[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Temporarily comment out animations and vendor chunks to avoid SSR issues
            // animations: {
            //   name: 'animations',
            //   test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
            //   priority: 30,
            //   enforce: true,
            // },
            // vendor: {
            //   name: 'vendor',
            //   test: /[\\/]node_modules[\\/]/,
            //   priority: 10,
            //   enforce: true,
            // },
          },
        },
      }
    }
    
    return config
  },
  // Performance optimizations
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    },
    // Enable modern features for better performance
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@tabler/icons-react'],
  },
  // Enable compression
  compress: true,
  // Add security headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/(.*)\\.(js|css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  }
};
export default withSentryConfig(nextConfig, {
  silent: true,
  // Keep bundle size minimal; do not include source maps unless env configured
  disableLogger: true,
});
