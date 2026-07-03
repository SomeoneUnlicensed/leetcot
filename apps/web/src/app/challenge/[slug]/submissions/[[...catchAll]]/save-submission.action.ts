'use server';
import { getCodeRunJobView } from '@repo/code-runner';
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

// Languages whose grading runs on the server (via @repo/code-runner), so the
// verdict is derived from the job the server itself computed instead of a
// client-supplied boolean. Other languages are still graded client-side today
// (TS/JS diagnostics checked in-browser) and remain on the trusted-boolean path
// below until that grading also moves behind a server-verified job.
const QUEUE_VERIFIED_LANGUAGES: ChallengeRouteData['challenge']['language'][] = ['SQL', 'PYTHON'];

interface Args {
  challenge: ChallengeRouteData['challenge'];
  code: string;
  executionTimeMs?: number | null;
  isSuccessful?: boolean;
  jobId?: string;
}
export async function saveSubmission({
  challenge,
  code,
  isSuccessful,
  executionTimeMs,
  jobId,
}: Args) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not Authorized');
  }
  const userId = session.user.id;

  let verifiedIsSuccessful: boolean;
  let verifiedExecutionTimeMs = executionTimeMs;

  const mustVerifyViaQueue =
    !challenge.isInfoOnly && QUEUE_VERIFIED_LANGUAGES.includes(challenge.language);

  if (mustVerifyViaQueue) {
    if (!jobId) {
      throw new Error('Отсутствует идентификатор серверной проверки решения');
    }

    const job = await getCodeRunJobView(jobId);

    if (!job || (job.status !== 'success' && job.status !== 'failure')) {
      throw new Error('Проверка решения ещё не завершена или устарела');
    }

    if (job.challengeId !== challenge.id || job.userId !== userId) {
      throw new Error('Результат проверки не относится к этой задаче или пользователю');
    }

    verifiedIsSuccessful = job.result?.success ?? false;
    verifiedExecutionTimeMs = job.result?.executionTimeMs ?? executionTimeMs;
  } else {
    verifiedIsSuccessful = Boolean(isSuccessful);
  }

  const submission = await prisma.submission.create({
    data: {
      challengeId: challenge.id,
      userId,
      code,
      isSuccessful: verifiedIsSuccessful,
      ...(verifiedExecutionTimeMs != null ? { executionTimeMs: verifiedExecutionTimeMs } : {}),
    },
  });

  if (verifiedIsSuccessful) {
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
