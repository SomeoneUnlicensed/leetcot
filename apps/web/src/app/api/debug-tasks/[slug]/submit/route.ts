import { prisma, verifyFlag } from '@repo/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { stopEnvironment } from '~/server/environments';
import { pointsAfterHints } from '~/server/hints';
import { getQueueState, isParticipantLocked } from '~/server/task-queue';
import { rateLimit } from '~/utils/rateLimit';

const SubmitFlagSchema = z.object({
  flag: z.string().min(1).max(500),
});

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002';
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
    }

    // Flag submission is exactly the kind of endpoint someone will try to brute-force, so it
    // gets a tight budget - per participant, not per IP: everyone at the event shares one
    // NAT address, an IP budget would lock the whole room out.
    if (rateLimit(`debug-task-submit:${user.id}`, { windowSize: 60 * 1000, maxRequests: 12 })) {
      return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
    }

    if (await isParticipantLocked(user.id)) {
      return NextResponse.json({ error: 'Организаторы завершили этот блок.' }, { status: 403 });
    }

    const parsed = SubmitFlagSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Флаг не заполнен.' }, { status: 400 });
    }

    const task = await prisma.debugTask.findUnique({ where: { slug: params.slug } });
    if (!task?.isActive) {
      return NextResponse.json({ error: 'Задача не найдена.' }, { status: 404 });
    }

    const alreadySolved = await prisma.debugSubmission.findFirst({
      where: { taskId: task.id, userId: user.id, isCorrect: true },
    });
    if (alreadySolved) {
      return NextResponse.json({ solved: true, alreadySolved: true });
    }

    // Tasks are worked in order; the page enforces it, so the API has to as well.
    const { currentTask } = await getQueueState(user.id);
    if (currentTask?.id !== task.id) {
      return NextResponse.json(
        { error: 'Эта задача пока закрыта: сначала решите предыдущие.' },
        { status: 403 },
      );
    }

    // Each participant's environment carries its own freshly generated flag (see
    // startEnvironment in server/environments.ts) so flags can't be copy-pasted
    // between participants on the same task — fall back to the task-wide hash only
    // for rows created before that existed, or tasks with no environment at all.
    const env = await prisma.taskEnvironment.findUnique({
      where: { taskId_userId: { taskId: task.id, userId: user.id } },
    });
    const expectedHash = env?.flagHash ?? task.flagHash;
    const isCorrect = verifyFlag(parsed.data.flag, expectedHash);

    if (!isCorrect) {
      await prisma.debugSubmission.create({
        data: { taskId: task.id, userId: user.id, isCorrect: false },
      });
      return NextResponse.json({ solved: false, error: 'Неверный флаг.' }, { status: 200 });
    }

    const hintsUsed = await prisma.debugHintReveal.count({ where: { taskId: task.id, userId: user.id } });
    const awarded = pointsAfterHints(task.points, hintsUsed);

    // The submission row and the score change commit together, and a partial unique index
    // (one correct submission per task and participant) makes concurrent duplicate submits
    // lose the race with a unique violation instead of scoring the task twice.
    let participant;
    try {
      participant = await prisma.$transaction(async (tx) => {
        await tx.debugSubmission.create({
          data: { taskId: task.id, userId: user.id, isCorrect: true },
        });
        return tx.championshipParticipant.upsert({
          where: {
            championshipId_userId: { championshipId: task.championshipId, userId: user.id },
          },
          update: { score: { increment: awarded } },
          create: { championshipId: task.championshipId, userId: user.id, score: awarded },
        });
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json({ solved: true, alreadySolved: true });
      }
      throw error;
    }

    // The task is done — free the container immediately rather than waiting for
    // idle-timeout, so we have headroom for everyone still working during the event.
    if (env?.status === 'RUNNING') {
      await stopEnvironment(env).catch((error) => {
        console.error(`Failed to stop environment ${env.containerName} after solve:`, error);
      });
    }

    // Tasks are worked as a queue (easiest first) — hand back what's next so the
    // client can jump straight there instead of returning to a free-choice catalog.
    const next = await getQueueState(user.id);

    return NextResponse.json({
      solved: true,
      points: awarded,
      totalScore: participant.score,
      nextTaskSlug: next.currentTask?.slug ?? null,
    });
  } catch (error) {
    console.error('Debug task submission error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
