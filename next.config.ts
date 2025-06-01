
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
      { // Added for Google Profile Pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      { // Added for GTV videos bucket (mock video URLs)
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/gtv-videos-bucket/**',
      },
      { // Added for Wikimedia Commons
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      { // Added for backend server (uploaded avatars)
        protocol: 'https', // Assuming your backend cloud workstation URL is HTTPS
        hostname: '5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
        port: '', // The port is part of the hostname in this cloud workstation URL structure
        pathname: '/uploads/**', // Allow any image from the /uploads/ directory and its subdirectories
      },
      { // Fallback for local development if backend runs on http://localhost:5000
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      }
      // Add other image source hostnames here if needed
    ],
  },
  allowedDevOrigins: [
    // Primary frontend origin (port 9002 as per IDX logs)
    'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:9002',
    
    // Origins from which requests were previously blocked (ports 9000, 6000)
    'https://9000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    
    // Backend URL (port 5000 public URL), for completeness if direct browser interactions are needed
    'https://5000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:5000', // For local backend testing if forwarded

    // Fallback/previous default port 3000 just in case
    'https://3000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'http://localhost:3000',
  ],
};

export default nextConfig;
