import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { hashFlag, prisma, type DebugTask, type TaskEnvironment } from '@repo/db';

const execFileAsync = promisify(execFile);

const LABEL_APP = 'lentatech.app=debug-simulator';
const IDLE_MINUTES = Number(process.env.ENVIRONMENT_IDLE_MINUTES ?? 30);

function newContainerName(userId: string, taskSlug: string) {
  const suffix = randomBytes(4).toString('hex');
  const safeSlug = taskSlug.replace(/[^a-z0-9-]/g, '');
  return `lentatech-env-${safeSlug}-${userId.slice(0, 8)}-${suffix}`;
}

// A fresh flag per container instance, not one shared task-wide value — so two
// participants working the same task can't just copy-paste each other's answer.
function generateEnvironmentFlag(taskSlug: string) {
  return `LENTA{${taskSlug.replace(/-/g, '_')}_${randomBytes(4).toString('hex')}}`;
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

// Installed into every environment container via `docker exec` (not baked into the
// image) so every task — present and future — gets the same real, in-shell
// `submit <flag>` command for free. It doesn't validate anything itself: it just
// prints a sentinel line that the browser's terminal client watches for and relays
// to the authenticated submit API, which does the real verification.
const SUBMIT_SCRIPT = '#!/bin/sh\nprintf \'===SUBMIT:%s===\\n\' "$1"\n';
const INSTALL_SUBMIT_CMD = `cat > /usr/local/bin/submit <<'SUBMIT_EOF'\n${SUBMIT_SCRIPT}SUBMIT_EOF\nchmod +x /usr/local/bin/submit`;

async function installSubmitHelper(containerName: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await execFileAsync('docker', ['exec', containerName, 'sh', '-c', INSTALL_SUBMIT_CMD]);
      return;
    } catch (error) {
      if (attempt === 3) {
        console.error(`Failed to install submit helper into ${containerName}:`, error);
        return;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 300);
      });
    }
  }
}

// A small number of tasks need a real capability beyond the sandbox's normal
// defaults to make their exercise possible at all (e.g. actually writing an
// iptables rule inside the container). Kept as an explicit allowlist rather than
// a DB column since so few tasks need it.
const EXTRA_CAPS_BY_TASK: Record<string, string[]> = {
  'firewall-block-malicious-ip': ['NET_ADMIN', 'NET_RAW'],
  'traffic-sniffing': ['NET_RAW', 'NET_ADMIN'],
};

// Where the entrypoints of the task images expect to find the flag. Handed over as a file, not
// `-e FLAG=...`: an environment variable is visible to every participant shell as $FLAG and in
// /proc/*/environ, which would give the flag away before the task is solved. The entrypoint
// reads the file once and deletes it.
const FLAG_HANDOFF_PATH = '/.lenta-flag';

async function provisionFlag(containerName: string, flagPlain: string) {
  const dir = await mkdtemp(path.join(tmpdir(), 'lenta-flag-'));
  try {
    const file = path.join(dir, 'flag');
    await writeFile(file, flagPlain, { mode: 0o600 });
    await execFileAsync('docker', ['cp', file, `${containerName}:${FLAG_HANDOFF_PATH}`]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runContainer(containerName: string, task: DebugTask & { dockerImage: string }, flagPlain: string) {
  const extraCaps = EXTRA_CAPS_BY_TASK[task.slug] ?? [];
  const createArgs = [
    'create',
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
    ...extraCaps.flatMap((cap) => ['--cap-add', cap]),
    task.dockerImage,
  ];

  try {
    await execFileAsync('docker', createArgs);
  } catch (error) {
    // Most likely the image just isn't pulled locally yet — pull once and retry.
    await execFileAsync('docker', ['pull', task.dockerImage]);
    await execFileAsync('docker', createArgs).catch(() => {
      throw error;
    });
  }

  try {
    await provisionFlag(containerName, flagPlain);
    await execFileAsync('docker', ['start', containerName]);
  } catch (error) {
    await removeContainer(containerName);
    throw error;
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
    await installSubmitHelper(existing.containerName);
    return prisma.taskEnvironment.update({
      where: { id: existing.id },
      data: { expiresAt: new Date(Date.now() + IDLE_MINUTES * 60_000) },
    });
  }

  if (existing) {
    await removeContainer(existing.containerName);
  }

  const containerName = newContainerName(userId, task.slug);
  const flagPlain = generateEnvironmentFlag(task.slug);
  const flagHash = hashFlag(flagPlain);
  await runContainer(containerName, task, flagPlain);
  await installSubmitHelper(containerName);

  const expiresAt = new Date(Date.now() + IDLE_MINUTES * 60_000);

  return prisma.taskEnvironment.upsert({
    where: { taskId_userId: { taskId: task.id, userId } },
    update: { containerName, status: 'RUNNING', createdAt: new Date(), expiresAt, flagHash },
    create: { taskId: task.id, userId, containerName, status: 'RUNNING', expiresAt, flagHash },
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
