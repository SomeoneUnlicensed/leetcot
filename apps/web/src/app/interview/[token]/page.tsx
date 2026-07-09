import { prisma } from '@repo/db';
import { notFound, redirect } from 'next/navigation';
import { InterviewRoom } from './interview-room';

export default async function InterviewPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;

  const session = await prisma.interviewSession.findUnique({
    where: { token },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      challenges: {
        include: { challenge: { select: { name: true, slug: true, difficulty: true, tests: true, code: true, description: true } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!session || session.status === 'EXPIRED') notFound();
  if (session.status === 'COMPLETED') redirect('/');

  return <InterviewRoom session={JSON.parse(JSON.stringify(session))} />;
}
