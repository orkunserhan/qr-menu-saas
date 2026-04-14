import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
  async redirects() {
    return [
      {
        source: '/demo-restaurant',
        destination: '/demorest',
        permanent: true,
      },
      {
        source: '/:locale/demo-restaurant',
        destination: '/:locale/demorest',
        permanent: true,
      }
    ];
  },
};

export default withNextIntl(nextConfig);
