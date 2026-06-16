import type { MetadataRoute } from 'next';
import { prisma } from '@repo/db';
import type { Challenge } from '@repo/db/types';

const URL = 'https://leetcot.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let allChallenges: Challenge[] = [];
  try {
    allChallenges = await prisma.challenge.findMany();
  } catch (error) {
    console.warn('Warning: Database not available during sitemap build, skipping challenges:', error);
  }

  return [
    {
      url: `${URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/explore`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/tracks`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/tos`,
      lastModified: new Date(),
    },
    {
      url: `${URL}/privacy`,
      lastModified: new Date(),
    },
    ...allChallenges.map((challenge) => ({
      url: `${URL}/challenges/${challenge.slug}`,
      lastModified: new Date(challenge.updatedAt),
    })),
  ];
}
