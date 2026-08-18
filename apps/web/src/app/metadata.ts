import type { Metadata } from 'next';

export const SITE_URL = 'https://leetcot.ru';
export const tagline =
  'Дебаг-симулятор Lenta tech — живой сервер, реальные инциденты, один флаг за задачу.';
export const siteTitle = 'Дебаг-Симулятор — Lenta tech';

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Lenta tech',
  authors: [{ name: 'Lenta tech', url: SITE_URL }],
  creator: 'Lenta tech',
  publisher: 'Lenta tech',
  category: 'technology',
  keywords: ['Lenta tech', 'дебаг симулятор', 'debug simulator'],
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: siteTitle,
    template: '%s | Lenta tech',
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  description: tagline,
  openGraph: {
    title: siteTitle,
    description: tagline,
    url: SITE_URL,
    siteName: 'Lenta tech',
    locale: 'ru-RU',
    type: 'website',
  },
  twitter: {
    title: siteTitle,
    description: tagline,
    card: 'summary_large_image',
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
    'msapplication-TileColor': '#00A0FF',
  },
};

const withSiteSuffix = (title?: string) => {
  if (!title) return siteTitle;
  return title.includes('Lenta tech') ? title : `${title} | Lenta tech`;
};

/** Helper to build metadata with defaults, you should call this in generateMetadata() next function */
export const buildMetaForDefault = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}): Metadata => {
  const pageTitle = withSiteSuffix(title);
  const pageDescription = description ?? tagline;

  return {
    ...baseMetadata,
    title: { absolute: pageTitle },
    description: pageDescription,
    openGraph: {
      ...baseMetadata.openGraph,
      title: pageTitle,
      description: pageDescription,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: pageTitle,
      description: pageDescription,
    },
  };
};

export default baseMetadata;
