/** @type {import('next').NextConfig} */
const path = require('node:path');
const webpack = require('webpack');

// Bundle analyzer for performance optimization
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Enable SWC minification for better performance
  swcMinify: true,

  // Compression
  compress: true,

  // React optimizations
  reactStrictMode: true,

  // Package transpilation
  transpilePackages: ['@reactflow/core'],

  // Image optimization configuration
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-b.saashub.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'startupfa.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fazier.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.producthunt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vectorlogo.zone',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        providedExports: true,
        usedExports: true,
        sideEffects: false,
      };
    }

    // Configure handlebars loader and ignore require.extensions warnings
    config.module.rules.push({
      test: /\.hbs$/,
      use: 'handlebars-loader',
    });

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/lib\/handlebars$/,
        contextRegExp: /handlebars$/,
      })
    );

    // Add path aliases from tsconfig.json
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/ai': path.resolve(__dirname, 'src/ai'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/components/ui': path.resolve(__dirname, 'src/components/ui'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    };

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
