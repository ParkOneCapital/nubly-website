import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { PermissionsProvider } from '@/lib/hooks/Permissions.provider';
import GoogleTagManager from '@/components/Tracking/Google/GoogleTagManager';
import PageViewTracker from '@/components/Tracking/PageViewTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteDescription = 'Nubly automatically puts your paycheck to work';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.livenubly.com'),
  title: 'Nubly',
  description: siteDescription,
  openGraph: {
    title: 'Nubly',
    description: siteDescription,
    siteName: 'Nubly',
    type: 'website',
    images: [
      {
        url: '/assets/og.png',
        width: 1200,
        height: 630,
        alt: 'Nubly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nubly',
    description: siteDescription,
    images: ['/assets/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PermissionsProvider>
          <GoogleTagManager />
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>

          {/* GTM noscript fallback */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=GTM-K2G3J9SS`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>

          {children}
        </PermissionsProvider>
      </body>
    </html>
  );
}
