import type { Metadata } from 'next';
import { challengeParam, userParam } from '@repo/og-utils';

export const OG_URL =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:4200' : 'https://og.leetcot.ru';

export const SITE_URL = 'https://leetcot.ru';
export const tagline =
  'Решайте интересные задачи по Python, SQL и Go, которые не хочется бросать на середине.';
export const siteTitle = 'ЛитКот — задачи по программированию, которые хочется дорешать';

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'ЛитКот',
  authors: [{ name: 'ЛитКот', url: SITE_URL }],
  creator: 'ЛитКот',
  publisher: 'ЛитКот',
  category: 'education',
  keywords: [
    'ЛитКот',
    'задачи по программированию',
    'Python задачи',
    'SQL задачи',
    'Go задачи',
    'алгоритмы',
    'подготовка к собеседованию',
    'программирование на русском',
  ],
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: siteTitle,
    template: '%s | ЛитКот',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  description: tagline,
  openGraph: {
    title: siteTitle,
    description: tagline,
    url: SITE_URL,
    siteName: 'ЛитКот',
    images: [
      {
        url: `${OG_URL}/api/default`,
        width: 1920,
        height: 1080,
        alt: 'ЛитКот — задачи по программированию с котиками',
      },
    ],
    locale: 'ru-RU',
    type: 'website',
  },
  twitter: {
    title: siteTitle,
    description: tagline,
    card: 'summary_large_image',
    images: [
      {
        url: `${OG_URL}/api/default`,
        width: 1920,
        height: 1080,
        alt: 'ЛитКот — задачи по программированию с котиками',
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

const withSiteSuffix = (title?: string) => {
  if (!title) return siteTitle;
  return title.includes('ЛитКот') ? title : `${title} | ЛитКот`;
};

// TODO: infer from ZOD
interface MetaParamsForChallenge {
  title: string;
  description: string;
  username: string;
  difficulty: 'BEGINNER' | 'EASY' | 'EVENT' | 'EXTREME' | 'HARD' | 'MEDIUM' | 'ULTRA';
  date: string;
}

interface MetaParamsForUser {
  title: string;
  description: string;
  username: string;
  avatar: string;
  dateSince: string;
}
/** Helper to build opengraph metadata for a user, you should call this in generateMetadata() next function */
export const buildMetaForUser = ({
  title,
  description,
  username,
  dateSince,
  avatar,
}: MetaParamsForUser): Metadata => {
  const params = userParam.toSearchString({
    username,
    avatar,
    dateSince,
  });

  const ogImageUrl = `${OG_URL}/api/user?${params}`;

  return buildMeta({
    ogImageUrl,
    title,
    description,
  });
};

/** Helper to build opengraph metadata for a challenge, you should call this in generateMetadata() next function */
export const buildMetaForChallenge = ({
  title,
  description,
  username,
  difficulty,
  date,
}: MetaParamsForChallenge): Metadata => {
  const params = challengeParam.toSearchString({
    description,
    title,
    username,
    difficulty,
    date,
  });

  const ogImageUrl = `${OG_URL}/api/challenge?${params}`;

  return buildMeta({
    ogImageUrl,
    title,
    description,
  });
};

/** Helper to build opengraph metadata with defaults, you should call this in generateMetadata() next function */
export const buildMetaForDefault = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}): Metadata => {
  return buildMeta({
    ogImageUrl: `${OG_URL}/api/default?cache-bust=${new Date().getDate()}`,
    title,
    description,
  });
};

/** update the metadata for og */
const buildMeta = ({
  ogImageUrl,
  description,
  title,
}: {
  ogImageUrl: string;
  description?: string;
  title?: string;
}): Metadata => {
  const pageTitle = withSiteSuffix(title);
  const pageDescription = description ?? tagline;

  return {
    ...baseMetadata,
    title: { absolute: pageTitle },
    description: pageDescription,
    alternates: {
      ...baseMetadata.alternates,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: pageTitle,
      description: pageDescription,
      images: ogImageUrl,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: pageTitle,
      description: pageDescription,
      images: ogImageUrl,
    },
  };
};

export default baseMetadata;
