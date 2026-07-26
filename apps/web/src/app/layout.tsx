import { Toaster } from '@repo/ui/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Dela_Gothic_One } from 'next/font/google';
import { DesktopOnlyGate } from '~/components/desktop-only-gate';
import { Navigation } from '~/components/Navigation';
import { PromoBlock } from '~/components/promo-block';
import '../styles/globals.css';
import baseMetadata from './metadata';
import { Providers } from './providers';

const delaGothic = Dela_Gothic_One({ weight: '400', subsets: ['latin'], variable: '--font-dela' });

export const metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="ru" className={`dark ${delaGothic.variable}`}>
      <body className="flex flex-col bg-zinc-950 font-sans text-white">
        <DesktopOnlyGate />
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
