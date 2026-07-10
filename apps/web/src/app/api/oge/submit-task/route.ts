import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Необходимо войти в систему' }, { status: 401 });
  }

  try {
    const { taskId, answer, isCorrect } = await req.json();

    if (!taskId || answer === undefined) {
      return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
    }

    const task = await prisma.ogeTask.findUnique({
      where: { id: Number(taskId) },
      select: { id: true, trackId: true, correctAnswer: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Задание не найдено' }, { status: 404 });
    }

    // Record the attempt
    await prisma.ogeTaskAttempt.create({
      data: {
        userId: session.user.id,
        taskId: task.id,
        answer,
        isCorrect: Boolean(isCorrect),
        score: isCorrect ? 1 : 0,
      },
    });

    // Update progress
    const totalTasks = await prisma.ogeTask.count({
      where: { trackId: task.trackId, status: 'ACTIVE' },
    });

    const completedTasks = await prisma.ogeTaskAttempt.count({
      where: {
        userId: session.user.id,
        task: { trackId: task.trackId },
        isCorrect: true,
      },
    });

    const totalAttempts = await prisma.ogeTaskAttempt.count({
      where: {
        userId: session.user.id,
        task: { trackId: task.trackId },
      },
    });

    const accuracy = totalAttempts > 0
      ? (completedTasks / totalAttempts) * 100
      : 0;

    await prisma.ogeProgress.upsert({
      where: {
        userId_trackId: {
          userId: session.user.id,
          trackId: task.trackId,
        },
      },
      update: {
        completedTasks,
        totalTasks,
        accuracy,
      },
      create: {
        userId: session.user.id,
        trackId: task.trackId,
        completedLessons: 0,
        totalLessons: 0,
        completedTasks,
        totalTasks,
        accuracy,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit task:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
