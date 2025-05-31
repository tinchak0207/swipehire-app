
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
    // Frontend is now on port 9002
    'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9002',
    
    // Origins from which requests were blocked
    'https://9000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',

    // Keeping port 3000 just in case, but 9002 is the current target
    'https://3000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:3000',
    
    // Backend URL (port 5000), for completeness if direct browser interactions are needed, though unlikely for allowedDevOrigins
    'https://5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:5000',
  ],
};

export default nextConfig;
