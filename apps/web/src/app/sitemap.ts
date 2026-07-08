import type { MetadataRoute } from 'next';
import { prisma } from '@repo/db';
import type { Challenge } from '@repo/db/types';

import { SITE_URL } from './metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let allChallenges: Challenge[] = [];
  try {
    allChallenges = await prisma.challenge.findMany();
  } catch (error) {
    console.warn(
      'Warning: Database not available during sitemap build, skipping challenges:',
      error,
    );
  }

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/algorithms`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sql-fishing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/courses/golang-start`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...allChallenges.map((challenge) => ({
      url: `${SITE_URL}/challenge/${challenge.slug}`,
      lastModified: new Date(challenge.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
