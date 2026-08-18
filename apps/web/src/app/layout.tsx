import { Toaster } from '@repo/ui/components/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Jost } from 'next/font/google';
import { Navigation } from '~/components/Navigation';
import '../styles/globals.css';
import baseMetadata from './metadata';
import { Providers } from './providers';

const jost = Jost({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-brand' });

export const metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={jost.variable}>
      <body className="flex flex-col bg-white font-sans text-[#131722]">
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
