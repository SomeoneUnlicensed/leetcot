'use server';

import { prisma } from '@repo/db';
import type { Prisma } from '@repo/db';
import { Difficulty, Tags } from '@repo/db/types';
import type { Language } from '@repo/db/types';

import { cache } from 'react';
import { auth } from '~/server/auth';

export type FilteredChallenge = Prisma.ChallengeGetPayload<{
  select: {
    id: true;
    createdAt: true;
    updatedAt: true;
    difficulty: true;
    language: true;
    name: true;
    slug: true;
    shortDescription: true;
    status: true;
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
      select: {
        id: true;
        isSuccessful: true;
      };
      take: number;
    };
  };
}>;

export type SearchedChallenge = Prisma.ChallengeGetPayload<{
  select: {
    id: true;
    difficulty: true;
    language: true;
    name: true;
    slug: true;
    status: true;
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

function getFilteredChallengeSelect(userId?: string) {
  return {
    id: true,
    createdAt: true,
    updatedAt: true,
    difficulty: true,
    language: true,
    name: true,
    slug: true,
    shortDescription: true,
    status: true,
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
      select: {
        id: true,
        isSuccessful: true,
      },
      take: 1,
    },
  } satisfies Prisma.ChallengeSelect;
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

  const challenges = await prisma.challenge.findMany({
    where,
    select: getFilteredChallengeSelect(session?.user?.id),
    orderBy: { createdAt: 'desc' },
    ...(take && {
      take,
    }),
  });

  return challenges;
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

  const challenges = await prisma.challenge.findMany({
    where: {
      ...activeChallengeWhere,
      ...getGroupWhere(group),
    },
    select: getFilteredChallengeSelect(session?.user?.id),
    ...(take && {
      take,
    }),
  });

  return challenges;
}

/**
 * Searches for challenges by name or slug.
 */
export async function searchChallenges(
  query: string,
  language?: Language,
): Promise<SearchedChallenge[]> {
  if (!query) return [];

  const challenges = await prisma.challenge.findMany({
    where: {
      ...activeChallengeWhere,
      ...(language ? { language } : {}),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      difficulty: true,
      language: true,
      name: true,
      slug: true,
      status: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 10,
  });

  return challenges;
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
    ultraChallenges,
  ] = await Promise.all([
    getChallengesByTagOrDifficulty('popular', 12),
    getChallengesByTagOrDifficulty('beginner'),
    getChallengesByTagOrDifficulty('easy'),
    getChallengesByTagOrDifficulty('medium'),
    getChallengesByTagOrDifficulty('hard'),
    getChallengesByTagOrDifficulty('extreme'),
    getChallengesByTagOrDifficulty('ultra'),
  ]);

  const allChallenges: AllChallenges = {
    popularChallenges,
    beginnerChallenges,
    easyChallenges,
    mediumChallenges,
    hardChallenges,
    extremeChallenges,
    ultraChallenges,
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
  ultraChallenges: ChallengesByTagOrDifficulty;
}
