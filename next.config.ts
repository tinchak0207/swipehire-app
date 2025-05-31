
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add other image source hostnames here if needed
      // e.g. for actual avatar/logo storage
    ],
  },
  allowedDevOrigins: [
    // IDX preview URL for port 3000 (current target)
    'https://3000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    // Localhost for port 3000 (current target)
    'http://localhost:3000',
    // Fallback/previously attempted ports (can be removed if 3000 is stable)
    'https://9007-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9007',
    'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9002',
    'https://9005-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9005'
  ],
};

export default nextConfig;
