import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { startEnvironment, stopEnvironment } from '~/server/environments';
import { isParticipantLocked } from '~/server/task-queue';
import { rateLimit } from '~/utils/rateLimit';

type GetUserAndTaskResult =
  | { error: 'locked' | 'not-found' | 'unauthorized' }
  | { user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>; task: NonNullable<Awaited<ReturnType<typeof prisma.debugTask.findUnique>>> };

async function getUserAndTask(slug: string): Promise<GetUserAndTaskResult> {
  const session = await auth();
  if (!session?.user?.email) return { error: 'unauthorized' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: 'unauthorized' };
  if (await isParticipantLocked(user.id)) return { error: 'locked' };

  const task = await prisma.debugTask.findUnique({ where: { slug } });
  if (!task?.isActive) return { error: 'not-found' };

  return { user, task };
}

function errorResponse(error: 'locked' | 'not-found' | 'unauthorized'): NextResponse {
  if (error === 'locked') {
    return NextResponse.json({ error: 'Организаторы завершили этот блок.' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Не найдено.' }, { status: error === 'unauthorized' ? 401 : 404 });
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (rateLimit(`env-start:${ip}`, { windowSize: 60_000, maxRequests: 6 })) {
    return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
  }

  const result = await getUserAndTask(params.slug);
  if ('error' in result) {
    return errorResponse(result.error);
  }
  const { user, task } = result;

  if (!task.dockerImage) {
    return NextResponse.json(
      { error: 'Для этой задачи ещё нет автоматического окружения.' },
      { status: 400 },
    );
  }

  try {
    const env = await startEnvironment(user.id, { ...task, dockerImage: task.dockerImage });
    return NextResponse.json({ status: env.status, containerName: env.containerName });
  } catch (error) {
    console.error('Failed to start environment:', error);
    return NextResponse.json({ error: 'Не удалось запустить окружение.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const result = await getUserAndTask(params.slug);
  if ('error' in result) {
    return errorResponse(result.error);
  }
  const { user, task } = result;

  const env = await prisma.taskEnvironment.findUnique({
    where: { taskId_userId: { taskId: task.id, userId: user.id } },
  });
  if (env && env.status === 'RUNNING') {
    await stopEnvironment(env);
  }

  return NextResponse.json({ status: 'STOPPED' });
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  const result = await getUserAndTask(params.slug);
  if ('error' in result) {
    return errorResponse(result.error);
  }
  const { user, task } = result;

  const env = await prisma.taskEnvironment.findUnique({
    where: { taskId_userId: { taskId: task.id, userId: user.id } },
  });

  return NextResponse.json({
    hasEnvironment: Boolean(task.dockerImage),
    status: env?.status ?? null,
  });
}
