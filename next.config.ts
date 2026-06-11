import type { NextConfig } from 'next';

const firebaseFunctionsBase =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL ??
  'http://127.0.0.1:5001/livenublylanding/us-central1';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    return [
      {
        source: '/api/firebase/:path*',
        destination: `${firebaseFunctionsBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
