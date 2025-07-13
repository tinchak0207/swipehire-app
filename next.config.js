/** @type {import('next').NextConfig} */
const path = require('node:path');
const nextConfig = {
  transpilePackages: ['@reactflow/core'],
  images: {
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
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // Add handlebars loader
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    });

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

module.exports = nextConfig;
