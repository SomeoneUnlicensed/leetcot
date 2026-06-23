'use server';

import { prisma } from '@repo/db';
import type { Prisma } from '@repo/db';
import { Difficulty, Tags } from '@repo/db/types';
import type { Language } from '@repo/db/types';

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
const allDifficulties: Difficulty[] = Object.values(Difficulty);

const activeChallengeWhere = {
  status: 'ACTIVE',
  user: {
    NOT: {
      status: 'BANNED',
    },
  },
} satisfies Prisma.ChallengeWhereInput;

export interface FilterOptions {
  difficulty?: Difficulty;
  language?: Language;
  tag?: Tags;
  query?: string;
}

type ChallengeGroup =
  | {
      type: 'difficulty';
      value: Difficulty;
    }
  | {
      type: 'tag';
      value: Tags;
    };

function isTag(value: string): value is Tags {
  return allTags.includes(value as Tags);
}

function isDifficulty(value: string): value is Difficulty {
  return allDifficulties.includes(value as Difficulty);
}

function parseChallengeGroup(str: string): ChallengeGroup | null {
  const value = str.trim().toUpperCase();

  if (isTag(value)) {
    return { type: 'tag', value };
  }

  if (isDifficulty(value)) {
    return { type: 'difficulty', value };
  }

  return null;
}

function getFilteredChallengeInclude(userId?: string) {
  return {
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
        userId: userId || '',
        isSuccessful: true,
      },
      take: 1,
    },
  } satisfies Prisma.ChallengeInclude;
}

function getGroupWhere(group: ChallengeGroup): Prisma.ChallengeWhereInput {
  if (group.type === 'tag') {
    return {
      tags: {
        some: {
          tag: group.value,
        },
      },
    };
  }

  return {
    difficulty: group.value,
  };
}

/**
 * Fetches challenges with comprehensive filtering.
 */
export async function getFilteredChallenges(
  filters: FilterOptions,
  take?: number,
): Promise<FilteredChallenge[]> {
  const session = await auth();

  const where: Prisma.ChallengeWhereInput = { ...activeChallengeWhere };

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
    include: getFilteredChallengeInclude(session?.user?.id),
    orderBy: { createdAt: 'desc' },
    ...(take && {
      take,
    }),
  });
}

/**
 * Fetches challenges either by tag or difficulty.
 */
export async function getChallengesByTagOrDifficulty(
  str: string,
  take?: number,
): Promise<FilteredChallenge[]> {
  const session = await auth();
  const group = parseChallengeGroup(str);

  if (!group) {
    return [];
  }

  return prisma.challenge.findMany({
    where: {
      ...activeChallengeWhere,
      ...getGroupWhere(group),
    },
    include: getFilteredChallengeInclude(session?.user?.id),
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
      ...activeChallengeWhere,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ],
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
  const group = parseChallengeGroup(str);

  if (!group) {
    return 0;
  }

  return prisma.challenge.count({
    where: {
      ...activeChallengeWhere,
      ...getGroupWhere(group),
    },
  });
});

export const getAllChallenges = cache(async () => {
  const [
    popularChallenges,
    beginnerChallenges,
    easyChallenges,
    mediumChallenges,
    hardChallenges,
    extremeChallenges,
  ] = await Promise.all([
    getChallengesByTagOrDifficulty('popular', 12),
    getChallengesByTagOrDifficulty('beginner'),
    getChallengesByTagOrDifficulty('easy'),
    getChallengesByTagOrDifficulty('medium'),
    getChallengesByTagOrDifficulty('hard'),
    getChallengesByTagOrDifficulty('extreme'),
  ]);

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
