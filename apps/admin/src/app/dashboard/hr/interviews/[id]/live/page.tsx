import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { notFound } from 'next/navigation';
import { LiveCodingView } from './live-view';

export default async function LiveInterviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  assertAdminOrRecruiter(session);

  const interview = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      challenges: {
        include: { challenge: { select: { name: true, slug: true, difficulty: true, tests: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!interview) notFound();

  return (
    <div className="space-y-4">
      <LiveCodingView interview={JSON.parse(JSON.stringify(interview))} />
    </div>
  );
}
