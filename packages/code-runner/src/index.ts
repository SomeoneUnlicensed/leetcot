import { v4 as uuidv4 } from 'uuid';

export type CodeRunnerLanguage = 'javascript' | 'python';

export interface CodeRunPayload {
  code: string;
  tests: string;
  language: CodeRunnerLanguage;
}

export interface CodeRunResult {
  error?: string;
  output?: string;
  success: boolean;
}

export type CodeRunStatus = 'failure' | 'queued' | 'running' | 'success';

export interface CodeRunJob {
  createdAt: number;
  id: string;
  payload: CodeRunPayload;
  status: CodeRunStatus;
  updatedAt: number;
}

export interface CodeRunJobView {
  createdAt: number;
  id: string;
  position: number;
  result?: CodeRunResult;
  status: CodeRunStatus;
  updatedAt: number;
}

const QUEUE_KEY = 'code-runner:queue';
const JOB_KEY_PREFIX = 'code-runner:job:';
const JOB_TTL_SECONDS = 60 * 30;

async function getRedisClient() {
  const { redisClient } = await import('@repo/redis');

  return redisClient;
}

export function normalizeLanguage(language: string): CodeRunnerLanguage | null {
  const normalized = language.toLowerCase();

  if (normalized === 'javascript' || normalized === 'python') {
    return normalized;
  }

  return null;
}

function getJobKey(jobId: string) {
  return `${JOB_KEY_PREFIX}${jobId}`;
}

export async function enqueueCodeRun(payload: CodeRunPayload): Promise<CodeRunJobView> {
  const now = Date.now();
  const job: CodeRunJob = {
    createdAt: now,
    id: uuidv4(),
    payload,
    status: 'queued',
    updatedAt: now,
  };

  const redisClient = await getRedisClient();

  await redisClient.set(getJobKey(job.id), JSON.stringify(job), {
    EX: JOB_TTL_SECONDS,
  });
  await redisClient.rPush(QUEUE_KEY, job.id);

  return {
    createdAt: job.createdAt,
    id: job.id,
    position: await getQueuePosition(job.id),
    status: job.status,
    updatedAt: job.updatedAt,
  };
}

export async function getCodeRunJob(jobId: string): Promise<CodeRunJob | null> {
  const redisClient = await getRedisClient();
  const rawJob = await redisClient.get(getJobKey(jobId));

  if (!rawJob) {
    return null;
  }

  return JSON.parse(rawJob) as CodeRunJob;
}

export async function getCodeRunJobView(jobId: string): Promise<CodeRunJobView | null> {
  const job = await getCodeRunJob(jobId);

  if (!job) {
    return null;
  }

  return {
    createdAt: job.createdAt,
    id: job.id,
    position: job.status === 'queued' ? await getQueuePosition(job.id) : 0,
    result: 'result' in job ? (job as CodeRunJob & { result?: CodeRunResult }).result : undefined,
    status: job.status,
    updatedAt: job.updatedAt,
  };
}

export async function markCodeRunJob(
  jobId: string,
  status: Exclude<CodeRunStatus, 'queued'>,
  result?: CodeRunResult,
) {
  const job = await getCodeRunJob(jobId);

  if (!job) {
    return;
  }

  const nextJob = {
    ...job,
    ...(result ? { result } : {}),
    status,
    updatedAt: Date.now(),
  };

  const redisClient = await getRedisClient();

  await redisClient.set(getJobKey(jobId), JSON.stringify(nextJob), {
    EX: JOB_TTL_SECONDS,
  });
}

export async function dequeueCodeRunJob(timeoutSeconds: number): Promise<CodeRunJob | null> {
  const redisClient = await getRedisClient();
  const item = await redisClient.blPop(QUEUE_KEY, timeoutSeconds);
  const jobId = item?.element;

  if (!jobId) {
    return null;
  }

  const job = await getCodeRunJob(jobId);

  if (!job || job.status !== 'queued') {
    return null;
  }

  await markCodeRunJob(job.id, 'running');

  return job;
}

export async function getQueueDepth() {
  const redisClient = await getRedisClient();

  return redisClient.lLen(QUEUE_KEY);
}

export async function getQueuePosition(jobId: string) {
  const redisClient = await getRedisClient();
  const queue = await redisClient.lRange(QUEUE_KEY, 0, -1);
  const index = queue.indexOf(jobId);

  return index === -1 ? 0 : index + 1;
}
