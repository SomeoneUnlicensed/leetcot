import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { startEnvironment, stopEnvironment } from '~/server/environments';
import { getQueueState, isParticipantLocked } from '~/server/task-queue';
import { getClientIp, rateLimit } from '~/utils/rateLimit';

// A participant works one task at a time; a few extra covers re-opening solved ones. The
// cap protects the host (every environment is a container) from someone starting them all.
const MAX_RUNNING_ENVIRONMENTS_PER_USER = 3;

type GetUserAndTaskError = 'locked' | 'not-found' | 'task-locked' | 'unauthorized';

type GetUserAndTaskResult =
  | { error: GetUserAndTaskError }
  | { user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>; task: NonNullable<Awaited<ReturnType<typeof prisma.debugTask.findUnique>>> };

async function getUserAndTask(
  slug: string,
  options: { enforceQueue?: boolean } = {},
): Promise<GetUserAndTaskResult> {
  const session = await auth();
  if (!session?.user?.email) return { error: 'unauthorized' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: 'unauthorized' };
  if (await isParticipantLocked(user.id)) return { error: 'locked' };

  const task = await prisma.debugTask.findUnique({ where: { slug } });
  if (!task?.isActive) return { error: 'not-found' };

  // Tasks are worked in order; the page enforces it, so the API has to as well.
  if (options.enforceQueue) {
    const { currentTask, solvedTaskIds } = await getQueueState(user.id);
    if (!solvedTaskIds.has(task.id) && currentTask?.id !== task.id) {
      return { error: 'task-locked' };
    }
  }

  return { user, task };
}

function errorResponse(error: GetUserAndTaskError): NextResponse {
  if (error === 'locked') {
    return NextResponse.json({ error: 'Организаторы завершили этот блок.' }, { status: 403 });
  }
  if (error === 'task-locked') {
    return NextResponse.json(
      { error: 'Эта задача пока закрыта: сначала решите предыдущие.' },
      { status: 403 },
    );
  }
  return NextResponse.json({ error: 'Не найдено.' }, { status: error === 'unauthorized' ? 401 : 404 });
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
): Promise<NextResponse> {
  // Everyone at the event shares one NAT address, so the per-IP cap is only a flood guard;
  // the real budget is per participant below.
  const ip = getClientIp(req.headers.get('x-forwarded-for'));
  if (rateLimit(`env-start-ip:${ip}`, { windowSize: 60_000, maxRequests: 600 })) {
    return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
  }

  const result = await getUserAndTask(params.slug, { enforceQueue: true });
  if ('error' in result) {
    return errorResponse(result.error);
  }
  const { user, task } = result;

  if (rateLimit(`env-start:${user.id}`, { windowSize: 60_000, maxRequests: 10 })) {
    return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
  }

  if (!task.dockerImage) {
    return NextResponse.json(
      { error: 'Для этой задачи ещё нет автоматического окружения.' },
      { status: 400 },
    );
  }

  const otherRunning = await prisma.taskEnvironment.count({
    where: { userId: user.id, status: 'RUNNING', taskId: { not: task.id } },
  });
  if (otherRunning >= MAX_RUNNING_ENVIRONMENTS_PER_USER) {
    return NextResponse.json(
      { error: 'Запущено слишком много окружений. Остановите ненужные и повторите.' },
      { status: 429 },
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
