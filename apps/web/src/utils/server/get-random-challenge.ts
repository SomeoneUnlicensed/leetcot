'use server';
import { prisma } from '@repo/db';

interface Result {
  slug: string;
}

export async function getRandomChallenge() {
  try {
    const result: Result[] =
      await prisma.$queryRaw`SELECT slug FROM "Challenge" ORDER BY RANDOM() LIMIT 1`;

    if (result.length > 0 && result[0] && Boolean(result[0].slug)) {
      return result[0].slug;
    }
  } catch (error) {
    console.error('Error getting random challenge:', error);
  }

  return null;
}
