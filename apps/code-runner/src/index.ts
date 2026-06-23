import { exec, spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  dequeueCodeRunJob,
  markCodeRunJob,
  type CodeRunJob,
  type CodeRunPayload,
  type CodeRunResult,
} from '@repo/code-runner';

const execAsync = promisify(exec);

const MEMORY_LIMIT = process.env.CODE_RUNNER_MEMORY_LIMIT ?? '128m';
const CPU_LIMIT = process.env.CODE_RUNNER_CPU_LIMIT ?? '0.5';

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

const CONCURRENCY = getPositiveInteger(process.env.CODE_RUNNER_CONCURRENCY, 2);
const TIMEOUT_MS = getPositiveInteger(process.env.CODE_RUNNER_TIMEOUT_MS, 10_000);
const MAX_OUTPUT_BYTES = getPositiveInteger(process.env.CODE_RUNNER_MAX_OUTPUT_BYTES, 16_000);

interface DockerRunResult {
  exitCode: number | null;
  stderr: string;
  stdout: string;
  timedOut: boolean;
}

interface LanguageRuntime {
  command: string;
  fileName: string;
  image: string;
}

const runtimes = {
  javascript: {
    command: 'node main.js',
    fileName: 'main.js',
    image: 'node:20-alpine',
  },
  python: {
    command: 'python main.py',
    fileName: 'main.py',
    image: 'python:3.11-alpine',
  },
} satisfies Record<CodeRunPayload['language'], LanguageRuntime>;

function trimOutput(output = '') {
  if (Buffer.byteLength(output, 'utf8') <= MAX_OUTPUT_BYTES) {
    return output;
  }

  return `${Buffer.from(output).subarray(0, MAX_OUTPUT_BYTES).toString('utf8')}\n...output truncated...`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown runner error';
}

async function forceRemoveContainer(containerName: string) {
  await execAsync(`docker rm -f "${containerName}"`).catch(() => undefined);
}

async function runSandboxContainer(
  args: string[],
  containerName: string,
): Promise<DockerRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: DockerRunResult) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const timeout = setTimeout(() => {
      void forceRemoveContainer(containerName).finally(() => {
        child.kill('SIGKILL');
        finish({
          exitCode: null,
          stderr,
          stdout,
          timedOut: true,
        });
      });
    }, TIMEOUT_MS);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', (exitCode) => {
      finish({
        exitCode,
        stderr,
        stdout,
        timedOut: false,
      });
    });
  });
}

async function executeJob(job: CodeRunJob): Promise<CodeRunResult> {
  const runtime = runtimes[job.payload.language];
  const containerName = `litkot-run-${job.id}`;
  const tmpDir = path.join(os.tmpdir(), `litkot-run-${job.id}`);

  await mkdir(tmpDir, { recursive: true });

  try {
    const fullCode = `${job.payload.code}\n\n${job.payload.tests}`;
    const filePath = path.join(tmpDir, runtime.fileName);
    await writeFile(filePath, fullCode);

    const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
    const dockerArgs = [
      'run',
      '--rm',
      '--name',
      containerName,
      '--network',
      'none',
      '-m',
      MEMORY_LIMIT,
      '--cpus',
      CPU_LIMIT,
      '--pids-limit',
      '128',
      '-v',
      `${normalizedTmpDir}:/code`,
      '-w',
      '/code',
      runtime.image,
      ...runtime.command.split(' '),
    ];

    try {
      const result = await runSandboxContainer(dockerArgs, containerName);

      if (result.timedOut) {
        return {
          error: `ТАЙМАУТ: Код выполнялся дольше ${Math.ceil(TIMEOUT_MS / 1000)} секунд. Возможно бесконечный цикл или очень медленное выполнение.`,
          output: trimOutput(result.stdout),
          success: false,
        };
      }

      if (result.exitCode !== 0) {
        return {
          error: trimOutput(result.stderr || `Процесс завершился с кодом ${result.exitCode}`),
          output: trimOutput(result.stdout),
          success: false,
        };
      }

      return {
        error: trimOutput(result.stderr),
        output: trimOutput(result.stdout),
        success: true,
      };
    } catch (error: unknown) {
      const err = error as {
        killed?: boolean;
        message?: string;
        stderr?: string;
        stdout?: string;
      };

      if (err.killed || err.message?.includes('SIGTERM') || err.message?.includes('ETIMEDOUT')) {
        return {
          error: `ТАЙМАУТ: Код выполнялся дольше ${Math.ceil(TIMEOUT_MS / 1000)} секунд. Возможно бесконечный цикл или очень медленное выполнение.`,
          output: trimOutput(err.stdout),
          success: false,
        };
      }

      return {
        error: trimOutput(err.stderr || err.message || 'Ошибка выполнения тестов'),
        output: trimOutput(err.stdout),
        success: false,
      };
    }
  } finally {
    await forceRemoveContainer(containerName);
    await rm(tmpDir, { force: true, recursive: true });
  }
}

async function worker(workerId: number) {
  console.log(`Code runner worker ${workerId} started`);

  for (;;) {
    const job = await dequeueCodeRunJob(5);

    if (!job) {
      continue;
    }

    console.log(`Worker ${workerId} running job ${job.id}`);

    try {
      const result = await executeJob(job);
      await markCodeRunJob(job.id, result.success ? 'success' : 'failure', result);
      console.log(`Worker ${workerId} finished job ${job.id}`);
    } catch (error: unknown) {
      await markCodeRunJob(job.id, 'failure', {
        error: `Ошибка песочницы: ${getErrorMessage(error)}`,
        success: false,
      });
      console.error(`Worker ${workerId} failed job ${job.id}`, error);
    }
  }
}

for (let i = 0; i < CONCURRENCY; i += 1) {
  void worker(i + 1);
}
