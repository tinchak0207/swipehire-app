
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
  // The webpack function is removed as it's not compatible with Turbopack.
  // Turbopack handles SVGs differently. If you were using SVGs as React components
  // (e.g., import MyIcon from './my-icon.svg'; <MyIcon />),
  // this should generally work with Turbopack out-of-the-box.
  // If specific @svgr/webpack transformations were critical,
  // you might need to adjust SVG usage or remove the --turbopack flag from your dev script.
  allowedDevOrigins: [
    // Add the specific preview URL from your Firebase Studio/IDX environment
    // It's important to use the correct protocol (http or https)
    'https://9005-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    // It's good practice to also include your local development origin if you ever run it directly
    'http://localhost:9005',
  ],
};

export default nextConfig;
