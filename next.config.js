/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  transpilePackages: ['@reactflow/core'],
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
    };

    return config;
  },
};

module.exports = nextConfig;
