/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@reactflow/core'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    
    // Add handlebars loader
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader'
    });

    return config;
  },
};

module.exports = nextConfig;
