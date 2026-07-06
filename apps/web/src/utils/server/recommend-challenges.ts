'use server';

import type { Challenge } from '@repo/db/types';
import { prisma } from '@repo/db';

const difficultyWeight: Record<string, number> = {
  BEGINNER: 0,
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXTREME: 4,
  ULTRA: 5,
  EVENT: 2,
};

type ChallengeWithTracks = Challenge & {
  TrackChallenge: {
    trackId: number | null;
    orderId: number;
  }[];
};

function challengeOnly(challenge: ChallengeWithTracks): Challenge {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { TrackChallenge, ...plainChallenge } = challenge;
  return {
    ...plainChallenge,
    code: '',
    tests: '',
  };
}

function difficultyDistance(a: string, b: string) {
  return Math.abs((difficultyWeight[a] ?? 1) - (difficultyWeight[b] ?? 1));
}

export async function getRecommendedChallenges({
  currentChallengeId,
  userId,
  maxChallenges = 3,
}: {
  currentChallengeId: number;
  userId?: string;
  maxChallenges?: number;
}): Promise<Challenge[]> {
  const current = await prisma.challenge.findFirst({
    where: {
      id: currentChallengeId,
      status: 'ACTIVE',
    },
    include: {
      TrackChallenge: {
        select: {
          trackId: true,
          orderId: true,
        },
      },
    },
  });

  if (!current) {
    return [];
  }

  const solvedIds = userId
    ? (
        await prisma.submission.findMany({
          where: {
            userId,
            isSuccessful: true,
          },
          select: {
            challengeId: true,
          },
        })
      ).map((submission) => submission.challengeId)
    : [];

  const recentFailedAttempts = userId
    ? await prisma.submission.findMany({
        where: {
          userId,
          isSuccessful: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        select: {
          challenge: {
            select: {
              difficulty: true,
              language: true,
            },
          },
        },
      })
    : [];

  const weakLanguages = new Set(recentFailedAttempts.map((attempt) => attempt.challenge.language));
  const weakDifficulties = new Set(
    recentFailedAttempts.map((attempt) => attempt.challenge.difficulty),
  );
  const currentTrackIds = new Set(
    current.TrackChallenge.map((item) => item.trackId).filter((trackId) => trackId !== null),
  );

  const candidates = await prisma.challenge.findMany({
    where: {
      status: 'ACTIVE',
      id: {
        notIn: [...solvedIds, currentChallengeId],
      },
    },
    include: {
      TrackChallenge: {
        select: {
          trackId: true,
          orderId: true,
        },
      },
    },
    take: 80,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const scored = candidates.map((candidate) => {
    const sameLanguage = candidate.language === current.language;
    const sameDifficulty = candidate.difficulty === current.difficulty;
    const distance = difficultyDistance(candidate.difficulty, current.difficulty);
    const sharedTrack = candidate.TrackChallenge.some((trackChallenge) =>
      trackChallenge.trackId === null ? false : currentTrackIds.has(trackChallenge.trackId),
    );
    const isWeakLanguage = weakLanguages.has(candidate.language);
    const isWeakDifficulty = weakDifficulties.has(candidate.difficulty);

    let score = 0;
    if (sameLanguage) score += 32;
    if (sharedTrack) score += 28;
    if (sameDifficulty) score += 20;
    score += Math.max(0, 14 - distance * 7);
    if (isWeakLanguage) score += 10;
    if (isWeakDifficulty) score += 6;
    score += Math.max(0, 5 - (Math.min(candidate.id, current.id) % 5));

    return {
      challenge: candidate,
      score,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.challenge.id - b.challenge.id)
    .slice(0, maxChallenges)
    .map((item) => challengeOnly(item.challenge));
}
