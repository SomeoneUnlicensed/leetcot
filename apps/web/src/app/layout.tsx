import { Toaster } from '@repo/ui/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { Navigation } from '~/components/Navigation';
import '../styles/globals.css';
import { OG_URL, tagline } from './metadata';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(OG_URL),
  title: 'ЛитКот',
  robots: {
    index: true,
    follow: true,
  },
  description: tagline,
  openGraph: {
    title: 'ЛитКот',
    description: tagline,
    siteName: 'ЛитКот',
    images: [
      {
        url: `${OG_URL}/api/default`,
        width: 1920,
        height: 1080,
      },
    ],
    locale: 'ru-RU',
    type: 'website',
  },
  twitter: {
    title: 'ЛитКот',
    card: 'summary_large_image',
    images: [
      {
        url: `${OG_URL}/api/default`,
        width: 1920,
        height: 1080,
      },
    ],
  },
  icons: {
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="ru" className="dark">
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} flex flex-col bg-zinc-950 text-white`}>
        <Providers>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
