import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { prisma, type DebugTask, type TaskEnvironment } from '@repo/db';

const execFileAsync = promisify(execFile);

const LABEL_APP = 'lentatech.app=debug-simulator';
const IDLE_MINUTES = Number(process.env.ENVIRONMENT_IDLE_MINUTES ?? 30);

function newContainerName(userId: string, taskSlug: string) {
  const suffix = randomBytes(4).toString('hex');
  const safeSlug = taskSlug.replace(/[^a-z0-9-]/g, '');
  return `lentatech-env-${safeSlug}-${userId.slice(0, 8)}-${suffix}`;
}

async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('docker', [
      'inspect',
      '-f',
      '{{.State.Running}}',
      containerName,
    ]);
    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}

async function removeContainer(containerName: string) {
  await execFileAsync('docker', ['rm', '-f', containerName]).catch(() => undefined);
}

async function runContainer(containerName: string, task: DebugTask & { dockerImage: string }) {
  const args = [
    'run',
    '-d',
    '--name',
    containerName,
    '--label',
    LABEL_APP,
    '--label',
    `lentatech.task=${task.slug}`,
    '--init',
    '--network',
    'none',
    '--memory',
    '256m',
    '--memory-swap',
    '256m',
    '--cpus',
    '0.5',
    '--pids-limit',
    '128',
    '--security-opt',
    'no-new-privileges:true',
    ...(task.dockerFlagPlain ? ['-e', `FLAG=${task.dockerFlagPlain}`] : []),
    task.dockerImage,
  ];

  try {
    await execFileAsync('docker', args);
  } catch (error) {
    // Most likely the image just isn't pulled locally yet — pull once and retry.
    await execFileAsync('docker', ['pull', task.dockerImage]);
    await execFileAsync('docker', args).catch(() => {
      throw error;
    });
  }
}

/** Starts (or reuses an already-running) environment container for this user/task. */
export async function startEnvironment(
  userId: string,
  task: DebugTask & { dockerImage: string },
): Promise<TaskEnvironment> {
  const existing = await prisma.taskEnvironment.findUnique({
    where: { taskId_userId: { taskId: task.id, userId } },
  });

  if (existing?.status === 'RUNNING' && (await isContainerRunning(existing.containerName))) {
    return prisma.taskEnvironment.update({
      where: { id: existing.id },
      data: { expiresAt: new Date(Date.now() + IDLE_MINUTES * 60_000) },
    });
  }

  if (existing) {
    await removeContainer(existing.containerName);
  }

  const containerName = newContainerName(userId, task.slug);
  await runContainer(containerName, task);

  const expiresAt = new Date(Date.now() + IDLE_MINUTES * 60_000);

  return prisma.taskEnvironment.upsert({
    where: { taskId_userId: { taskId: task.id, userId } },
    update: { containerName, status: 'RUNNING', createdAt: new Date(), expiresAt },
    create: { taskId: task.id, userId, containerName, status: 'RUNNING', expiresAt },
  });
}

export async function stopEnvironment(env: TaskEnvironment): Promise<void> {
  await removeContainer(env.containerName);
  await prisma.taskEnvironment.update({
    where: { id: env.id },
    data: { status: 'STOPPED' },
  });
}

export async function extendEnvironment(env: TaskEnvironment): Promise<void> {
  await prisma.taskEnvironment.update({
    where: { id: env.id },
    data: { expiresAt: new Date(Date.now() + IDLE_MINUTES * 60_000) },
  });
}

/** Reaps environments past their idle expiry. Call this on a timer from the server process. */
export async function reapExpiredEnvironments(): Promise<void> {
  const expired = await prisma.taskEnvironment.findMany({
    where: { status: 'RUNNING', expiresAt: { lt: new Date() } },
  });

  for (const env of expired) {
    await stopEnvironment(env).catch((error) => {
      console.error(`Failed to reap environment ${env.containerName}:`, error);
    });
  }
}
