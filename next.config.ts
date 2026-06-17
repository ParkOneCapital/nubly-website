import type { NextConfig } from 'next';

const firebaseFunctionsBase =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL ??
  'http://127.0.0.1:5001/livenublylanding/us-central1';

const nublyBackendProxy =
  process.env.NUBLY_BACKEND_PROXY_URL ?? 'http://127.0.0.1:3000';

const lanDevOrigins = (process.env.NEXT_DEV_ALLOWED_ORIGINS ?? '192.168.1.6')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevOrigins,
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
      {
        source: '/api/nubly/:path*',
        destination: `${nublyBackendProxy}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
