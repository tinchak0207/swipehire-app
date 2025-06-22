import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking for better type safety
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checking during builds
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Enable compression
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Power optimizations
  poweredByHeader: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        // Added for Google Profile Pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        // Added for GTV videos bucket (mock video URLs)
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/gtv-videos-bucket/**',
      },
      {
        // Added for Wikimedia Commons
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        // Added for backend server (uploaded avatars/media from /uploads/)
        protocol: 'https',
        hostname:
          '5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
        port: '',
        pathname: '/uploads/**',
      },
      {
        // Fallback for local development if backend runs on http://localhost:5000
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        // Added for Google Cloud Storage
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**', // Allow all paths for GCS, can be more specific if needed
      },
      {
        // Added to fix the reported error
        protocol: 'https',
        hostname: 'lf-flow-web-cdn.doubao.com',
        port: '',
        pathname: '/**',
      },
      // For CSP img-src alignment
      { protocol: 'https', hostname: 'www.googletagmanager.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.google-analytics.com', pathname: '/**' },
      { protocol: 'https', hostname: 'user-images.trustpilot.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.ctfassets.net', pathname: '/**' }, // Example CDN
      { protocol: 'https', hostname: 'widget.trustpilot.com', pathname: '/**' },
      { protocol: 'https', hostname: 'swipehire.top', pathname: '/**' }, // New domain for images
      { protocol: 'https', hostname: 'www.swipehire.top', pathname: '/**' }, // New www domain for images
      {
        // Added for SaaSHub badge
        protocol: 'https',
        hostname: 'cdn-b.saashub.com',
        port: '',
        pathname: '/**',
      },
      {
        // Added for Startup Fame badge
        protocol: 'https',
        hostname: 'startupfa.me',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    // Primary frontend origin (port 9002 as per IDX logs)
    'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9002',

    // Origins from which requests were previously blocked (ports 9000, 6000)
    'https://9000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://9000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',

    // Backend URL (port 5000 public URL), for completeness if direct browser interactions are needed
    'https://5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:5000', // For local backend testing if forwarded

    // Fallback/previous default port 3000 just in case
    'https://3000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:3000',
    'https://swipehire.top', // New domain for dev origins if needed
    'http://swipehire.top', // New domain for dev origins if needed
  ],
};

export default nextConfig;
