'use server';

import { prisma, Prisma } from '@repo/db';
import { Tags } from '@repo/db/types';
import type { Language, Difficulty } from '@repo/db/types';

import { cache } from 'react';
import { auth } from '~/server/auth';

export type FilteredChallenge = Prisma.ChallengeGetPayload<{
  include: {
    _count: {
      select: { vote: true; comment: true };
    };
    user: {
      select: {
        name: true;
      };
    };
    submission: {
      where: {
        userId: string;
        isSuccessful: boolean;
      };
      take: number;
    };
  };
}>;

export type SearchedChallenge = Prisma.ChallengeGetPayload<{
  include: {
    user: {
      select: {
        name: true;
      };
    };
  };
}>;

export type ExploreChallengeData = ReturnType<typeof getChallengesByTagOrDifficulty>;
const allTags: Tags[] = Object.values(Tags);

export interface FilterOptions {
  difficulty?: Difficulty;
  language?: Language;
  tag?: Tags;
  query?: string;
}

/**
 * Fetches challenges with comprehensive filtering.
 */
export async function getFilteredChallenges(filters: FilterOptions, take?: number): Promise<FilteredChallenge[]> {
  const session = await auth();

  const where: Record<string, unknown> = {
    status: 'ACTIVE',
    user: {
      NOT: {
        status: 'BANNED',
      },
    },
  };

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters.language) {
    where.language = filters.language;
  }

  if (filters.tag) {
    where.tags = { some: { tag: filters.tag } };
  }

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { slug: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  return prisma.challenge.findMany({
    where,
    include: {
      _count: {
        select: { vote: true, comment: true },
      },
      user: {
        select: {
          name: true,
        },
      },
      submission: {
        where: {
          userId: session?.user?.id || '',
          isSuccessful: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    ...(take && {
      take,
    }),
  });
}

/**
 * Fetches challenges either by tag or difficulty.
 */
export async function getChallengesByTagOrDifficulty(str: string, take?: number): Promise<FilteredChallenge[]> {
  const session = await auth();
  const formattedStr = str.trim().toUpperCase();

  return prisma.challenge.findMany({
    where: {
      status: 'ACTIVE',
      user: {
        NOT: {
          status: 'BANNED',
        },
      },
      // OR didn't work. so this workaround is fine because IT WORKS :3
      ...(allTags.includes(formattedStr as keyof typeof Tags)
        ? {
            tags: { every: { tag: formattedStr as Tags } },
          }
        : {
            difficulty: { in: [formattedStr as Difficulty] },
          }),
    },
    include: {
      _count: {
        select: { vote: true, comment: true },
      },
      user: {
        select: {
          name: true,
        },
      },
      submission: {
        where: {
          userId: session?.user?.id || '',
          isSuccessful: true,
        },
        take: 1,
      },
    },
    ...(take && {
      take,
    }),
  });
}

/**
 * Searches for challenges by name or slug.
 */
export async function searchChallenges(query: string): Promise<SearchedChallenge[]> {
  if (!query) return [];

  return prisma.challenge.findMany({
    where: {
      status: 'ACTIVE',
      user: {
        NOT: {
          status: 'BANNED',
        },
      },
      OR: [{ name: { contains: query } }, { slug: { contains: query } }],
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 10,
  });
}

export type ChallengesByTagOrDifficulty = Awaited<
  ReturnType<typeof getChallengesByTagOrDifficulty>
>;

/**
 * Fetches the length of how many challenges are in a
 * difficutly / tag group
 * @param str difficutly or tag string
 */
export const getExploreChallengesLengthByTagOrDifficulty = cache(async (str: string) => {
  const formattedStr = str.trim().toUpperCase();

  return prisma.challenge.count({
    where: {
      status: 'ACTIVE',
      user: {
        NOT: {
          status: 'BANNED',
        },
      },
      difficulty: { in: [formattedStr as Difficulty] },
    },
  });
});

export const getAllChallenges = cache(async () => {
  const popularChallenges = await getChallengesByTagOrDifficulty('popular', 12);
  const beginnerChallenges = await getChallengesByTagOrDifficulty('beginner');
  const easyChallenges = await getChallengesByTagOrDifficulty('easy');
  const mediumChallenges = await getChallengesByTagOrDifficulty('medium');
  const hardChallenges = await getChallengesByTagOrDifficulty('hard');
  const extremeChallenges = await getChallengesByTagOrDifficulty('extreme');

  const allChallenges: AllChallenges = {
    popularChallenges,
    beginnerChallenges,
    easyChallenges,
    mediumChallenges,
    hardChallenges,
    extremeChallenges,
  };
  return allChallenges;
});

export interface AllChallenges {
  popularChallenges: ChallengesByTagOrDifficulty;
  beginnerChallenges: ChallengesByTagOrDifficulty;
  easyChallenges: ChallengesByTagOrDifficulty;
  mediumChallenges: ChallengesByTagOrDifficulty;
  hardChallenges: ChallengesByTagOrDifficulty;
  extremeChallenges: ChallengesByTagOrDifficulty;
}
