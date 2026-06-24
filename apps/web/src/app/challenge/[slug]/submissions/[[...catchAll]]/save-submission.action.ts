'use server';
import { prisma } from '@repo/db';
import { revalidateTag } from 'next/cache';
import { auth } from '~/server/auth';
import type { ChallengeRouteData } from '../../getChallengeRouteData';
import { createCacheKeyForSolutions } from '../../solutions/_components/solutions.helpers';
import {
  createChallengeSubmissionCacheKey,
  createCompletedSubmissionCacheKey,
  createInProgressSubmissionCacheKey,
} from './cache-keys';

interface Args {
  challenge: ChallengeRouteData['challenge'];
  code: string;
  isSuccessful: boolean;
  executionTimeMs?: number | null;
}
export async function saveSubmission({ challenge, code, isSuccessful, executionTimeMs }: Args) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not Authorized');
  }
  const userId = session.user.id;

  const submission = await prisma.submission.create({
    data: {
      challengeId: challenge.id,
      userId,
      code,
      isSuccessful,
      ...(executionTimeMs != null ? { executionTimeMs } : {}),
    },
  });

  if (isSuccessful) {
    const activeParticipants = await prisma.championshipParticipant.findMany({
      where: {
        userId,
        championship: {
          status: 'ACTIVE',
          challenges: {
            some: {
              challengeId: challenge.id,
            },
          },
        },
      },
    });

    if (activeParticipants.length > 0) {
      const pointsMap: Record<string, number> = {
        BEGINNER: 50,
        EASY: 100,
        MEDIUM: 250,
        HARD: 500,
        EXTREME: 1000,
        EVENT: 200,
      };
      const points = pointsMap[challenge.difficulty] || 100;

      for (const participant of activeParticipants) {
        const existingSuccessful = await prisma.submission.findFirst({
          where: {
            userId,
            challengeId: challenge.id,
            isSuccessful: true,
            id: { not: submission.id },
          },
        });

        if (!existingSuccessful) {
          await prisma.championshipParticipant.update({
            where: { id: participant.id },
            data: {
              score: {
                increment: points,
              },
            },
          });
        }
      }
    }
  }

  revalidateTag(createChallengeSubmissionCacheKey(challenge.slug));
  revalidateTag(createCacheKeyForSolutions(challenge.slug));
  revalidateTag(createInProgressSubmissionCacheKey(userId));
  revalidateTag(createCompletedSubmissionCacheKey(userId));
  return submission;
}
