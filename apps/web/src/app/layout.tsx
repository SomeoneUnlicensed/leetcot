import { Toaster } from '@repo/ui/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter, Dela_Gothic_One } from 'next/font/google';
import { Navigation } from '~/components/Navigation';
import { PromoBlock } from '~/components/promo-block';
import '../styles/globals.css';
import { OG_URL, tagline } from './metadata';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const delaGothicOne = Dela_Gothic_One({
  weight: '400',
  subsets: ['cyrillic', 'latin'],
  variable: '--font-dela-gothic',
});

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
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="ru" className={`${delaGothicOne.variable} dark`}>
      <body className={`${inter.className} flex flex-col bg-zinc-950 text-white`}>
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
