import { Toaster } from '@repo/ui/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Dela_Gothic_One } from 'next/font/google';
import { Navigation } from '~/components/Navigation';
import { PromoBlock } from '~/components/promo-block';
import '../styles/globals.css';
import { OG_URL, tagline } from './metadata';
import { Providers } from './providers';

const delaGothic = Dela_Gothic_One({ weight: '400', subsets: ['latin'], variable: '--font-dela' });

export const metadata = {
  metadataBase: new URL(OG_URL),
  title: 'ЛитКот',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://leetcot.ru',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#09090b',
    'msapplication-config': '/browserconfig.xml',
    'yandex-tableau-widget': 'logo=/yandex-tableau.png, color=#09090b',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="ru" className={`dark ${delaGothic.variable}`}>
      <body className="flex flex-col bg-zinc-950 font-sans text-white">
        <Providers>
          <PromoBlock variant="banner" text="ИНФОРМАЦИЯ (ГЛОБАЛЬНЫЙ БАННЕР)" />
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
