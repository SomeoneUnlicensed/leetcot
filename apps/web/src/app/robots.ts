import type { MetadataRoute } from 'next';

const AI_CRAWLER_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'Bytespider',
  'Applebot-Extended',
  'cohere-ai',
  'Diffbot',
  'Meta-ExternalAgent',
  'Amazonbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://leetcot.ru',
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/favicon.ico', '/favicon.svg', '/bimi.svg', '/site.webmanifest'],
        disallow: ['/api/*'],
      },
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({ userAgent, disallow: '/' })),
    ],
    sitemap: 'https://leetcot.ru/sitemap.xml',
  };
}
