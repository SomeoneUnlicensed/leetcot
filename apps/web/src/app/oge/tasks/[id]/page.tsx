import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import { OgeTaskClient } from './client';

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await prisma.ogeTask.findFirst({
    where: { id: Number(id) },
    include: { track: true },
  });
  if (!task) return buildMetaForDefault({ title: 'Задание не найдено | ЛитКот' });
  return buildMetaForDefault({
    title: `Задание №${task.examQuestionNumber} | ОГЭ Информатика | ЛитКот`,
    description: `Практическое задание №${task.examQuestionNumber} КИМ ОГЭ по информатике.`,
  });
}

export default async function OgeTaskPage({ params }: TaskPageProps) {
  const { id } = await params;
  const session = await auth();

  const task = await prisma.ogeTask.findFirst({
    where: { id: Number(id) },
    include: {
      track: true,
      ogeTaskAttempts: session?.user
        ? {
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }
        : false,
    },
  });

  if (!task) {
    notFound();
  }

  const attempts = Array.isArray(task.ogeTaskAttempts) ? task.ogeTaskAttempts : [];
  const lastAttempt = attempts[0] ?? null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />

        <OgeTaskClient
          task={{
            id: task.id,
            examQuestionNumber: task.examQuestionNumber,
            difficulty: task.difficulty,
            prompt: task.prompt,
            taskData: task.taskData as Record<string, unknown> | null,
            type: task.type,
            correctAnswer: task.correctAnswer,
            solution: task.solution,
          }}
          trackSlug={task.track.slug}
          trackName={task.track.name}
          lastAttempt={lastAttempt ? { answer: lastAttempt.answer, isCorrect: lastAttempt.isCorrect, createdAt: lastAttempt.createdAt.toISOString() } : null}
        />
      </div>
      <Footsies />
    </>
  );
}
