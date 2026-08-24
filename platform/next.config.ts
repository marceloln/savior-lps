import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output for optimized Docker/Vercel deploys
  output: 'standalone',

  // Strict React mode for development
  reactStrictMode: true,

  // External packages that should not be bundled server-side
  serverExternalPackages: [],

  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vaoolcqccxvxvacyepen.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
