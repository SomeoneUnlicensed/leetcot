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
const QUEUE_VERIFIED_LANGUAGES: ChallengeRouteData['challenge']['language'][] = [
  'SQL',
  'PYTHON',
  'GO',
];
const ALL_ULTRA_BADGE_SLUG = 'all-ultra';

async function awardAllUltraBadgeIfEarned(userId: string) {
  const ultraChallenges = await prisma.challenge.findMany({
    where: {
      difficulty: 'ULTRA',
      isInfoOnly: false,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (ultraChallenges.length === 0) {
    return;
  }

  const solvedUltraChallenges = await prisma.submission.findMany({
    where: {
      userId,
      isSuccessful: true,
      challengeId: { in: ultraChallenges.map((challenge) => challenge.id) },
    },
    distinct: ['challengeId'],
    select: { challengeId: true },
  });

  if (solvedUltraChallenges.length !== ultraChallenges.length) {
    return;
  }

  await prisma.userBadge.upsert({
    where: {
      userId_badgeSlug: {
        userId,
        badgeSlug: ALL_ULTRA_BADGE_SLUG,
      },
    },
    update: {},
    create: {
      userId,
      badgeSlug: ALL_ULTRA_BADGE_SLUG,
    },
  });
}

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

  const normalizedExecutionTimeMs =
    verifiedExecutionTimeMs == null ? null : Math.max(0, Math.round(verifiedExecutionTimeMs));

  const submission = await prisma.submission.create({
    data: {
      challengeId: challenge.id,
      userId,
      code,
      isSuccessful: verifiedIsSuccessful,
      ...(normalizedExecutionTimeMs != null ? { executionTimeMs: normalizedExecutionTimeMs } : {}),
    },
  });

  revalidateTag(createChallengeSubmissionCacheKey(challenge.slug));
  revalidateTag(createCacheKeyForSolutions(challenge.slug));
  revalidateTag(createInProgressSubmissionCacheKey(userId));
  revalidateTag(createCompletedSubmissionCacheKey(userId));

  if (verifiedIsSuccessful) {
    await awardAllUltraBadgeIfEarned(userId);
  }

  return submission;
}
