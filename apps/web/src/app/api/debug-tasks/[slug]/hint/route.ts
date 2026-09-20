import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { HINT_PENALTY_PERCENT } from '~/server/hints';
import { getQueueState, isParticipantLocked } from '~/server/task-queue';
import { rateLimit } from '~/utils/rateLimit';

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002';
}

/** Opens the next hint of the participant's current task (each one costs points, see hints.ts). */
export async function POST(
  _req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нужно авторизоваться.' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Участник не найден.' }, { status: 404 });
    }
    if (rateLimit(`debug-task-hint:${user.id}`, { windowSize: 60_000, maxRequests: 20 })) {
      return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
    }
    if (await isParticipantLocked(user.id)) {
      return NextResponse.json({ error: 'Организаторы завершили этот блок.' }, { status: 403 });
    }

    const task = await prisma.debugTask.findUnique({ where: { slug: params.slug } });
    if (!task?.isActive) {
      return NextResponse.json({ error: 'Задача не найдена.' }, { status: 404 });
    }

    const solved = await prisma.debugSubmission.findFirst({
      where: { taskId: task.id, userId: user.id, isCorrect: true },
      select: { id: true },
    });
    if (solved) {
      return NextResponse.json({ error: 'Задача уже решена.' }, { status: 409 });
    }

    const { currentTask } = await getQueueState(user.id);
    if (currentTask?.id !== task.id) {
      return NextResponse.json(
        { error: 'Эта задача пока закрыта: сначала решите предыдущие.' },
        { status: 403 },
      );
    }

    const opened = await prisma.debugHintReveal.count({ where: { taskId: task.id, userId: user.id } });
    if (opened >= task.hints.length) {
      return NextResponse.json({ error: 'Подсказок больше нет.' }, { status: 409 });
    }

    const level = opened + 1;
    try {
      await prisma.debugHintReveal.create({ data: { taskId: task.id, userId: user.id, level } });
    } catch (error) {
      // a double click opened the same level twice - the hint is open either way
      if (!isUniqueViolation(error)) throw error;
    }

    return NextResponse.json({
      level,
      remaining: task.hints.length - level,
      penaltyPercent: HINT_PENALTY_PERCENT,
    });
  } catch (error) {
    console.error('Debug task hint error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
