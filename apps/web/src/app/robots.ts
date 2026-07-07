import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://leetcot.ru',
    rules: {
      userAgent: '*',
      allow: ['/', '/favicon.ico', '/favicon.svg', '/bimi.svg', '/site.webmanifest'],
      disallow: ['/api/*'],
    },
    sitemap: 'https://leetcot.ru/sitemap.xml',
  };
}
