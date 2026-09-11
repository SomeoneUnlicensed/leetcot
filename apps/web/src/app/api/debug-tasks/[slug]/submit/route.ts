import { prisma, verifyFlag } from '@repo/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { stopEnvironment } from '~/server/environments';
import { getQueueState } from '~/server/task-queue';
import { rateLimit } from '~/utils/rateLimit';

const SubmitFlagSchema = z.object({
  flag: z.string().min(1).max(500),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  try {
    // Flag submission is exactly the kind of endpoint someone will try to brute-force,
    // so it gets a much tighter budget than the platform default.
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const isRateLimited = rateLimit(`debug-task-submit:${ip}`, {
      windowSize: 60 * 1000,
      maxRequests: 10,
    });
    if (isRateLimited) {
      return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
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

    // Each participant's environment carries its own freshly generated flag (see
    // startEnvironment in server/environments.ts) so flags can't be copy-pasted
    // between participants on the same task — fall back to the task-wide hash only
    // for rows created before that existed, or tasks with no environment at all.
    const env = await prisma.taskEnvironment.findUnique({
      where: { taskId_userId: { taskId: task.id, userId: user.id } },
    });
    const expectedHash = env?.flagHash ?? task.flagHash;
    const isCorrect = verifyFlag(parsed.data.flag, expectedHash);

    await prisma.debugSubmission.create({
      data: { taskId: task.id, userId: user.id, isCorrect },
    });

    if (!isCorrect) {
      return NextResponse.json({ solved: false, error: 'Неверный флаг.' }, { status: 200 });
    }

    const participant = await prisma.championshipParticipant.upsert({
      where: {
        championshipId_userId: { championshipId: task.championshipId, userId: user.id },
      },
      update: { score: { increment: task.points } },
      create: { championshipId: task.championshipId, userId: user.id, score: task.points },
    });

    // The task is done — free the container immediately rather than waiting for
    // idle-timeout, so we have headroom for everyone still working during the event.
    if (env?.status === 'RUNNING') {
      await stopEnvironment(env).catch((error) => {
        console.error(`Failed to stop environment ${env.containerName} after solve:`, error);
      });
    }

    // Tasks are worked as a queue (easiest first) — hand back what's next so the
    // client can jump straight there instead of returning to a free-choice catalog.
    const { currentTask } = await getQueueState(user.id);

    return NextResponse.json({
      solved: true,
      points: task.points,
      totalScore: participant.score,
      nextTaskSlug: currentTask?.slug ?? null,
    });
  } catch (error) {
    console.error('Debug task submission error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
