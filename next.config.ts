import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vbrkioafueczjsoieryy.supabase.co', // Sizin Supabase proje URL'niz
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
