import { prisma, verifyFlag } from '@repo/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
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

    const isCorrect = verifyFlag(parsed.data.flag, task.flagHash);

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

    return NextResponse.json({ solved: true, points: task.points, totalScore: participant.score });
  } catch (error) {
    console.error('Debug task submission error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
