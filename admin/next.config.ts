import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: '../',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lccxrnsoyeowkcfdkhwu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
