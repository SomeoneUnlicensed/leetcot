import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { buildMetaForDefault } from '~/app/metadata';
import { withUnstableCache } from '~/utils/withUnstableCache';
import { Submissions } from './_components';
import { createChallengeSubmissionCacheKey } from './cache-keys';

interface SubmissionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateMetadata() {
  return buildMetaForDefault({
    title: 'Отправки решения',
    description: 'История запусков и проверок решения задачи на ЛитКоте.',
  });
}

export default async function SubmissionPage(props: SubmissionPageProps) {
  const params = await props.params;

  const { slug } = params;

  const session = await auth();

  const submissions = await withUnstableCache({
    fn: getChallengeSubmissions,
    args: [session?.user?.id ?? '', slug],
    keys: ['all-challenge-submissions'],
    tags: [createChallengeSubmissionCacheKey(slug)],
  });

  if (!submissions) {
    return notFound();
  }

  return <Submissions submissions={submissions} />;
}

export type ChallengeSubmissions = NonNullable<Awaited<ReturnType<typeof getChallengeSubmissions>>>;
const getChallengeSubmissions = cache(async (userId: string, slug: string) => {
  const challenge = await prisma.challenge.findFirstOrThrow({
    where: { slug },
    select: { id: true },
  });
  return prisma.submission.findMany({
    where: { challengeId: challenge.id, userId },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });
});
