/**
 * Runs every graded challenge's real reference solution through the actual
 * production grading path (DB -> Redis queue -> live code-runner worker ->
 * Docker sandbox), to catch anything the offline verify scripts couldn't
 * (queue behavior, container warm-up, real timeouts, etc).
 *
 * Usage: dotenv -e ../../.env -- tsx scripts/generate-closed-tests/e2e_check_all.ts
 */
import { PrismaClient } from '@prisma/client';
import { enqueueCodeRun, getCodeRunJobView } from '@repo/code-runner';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const CHALLENGES_DIR = path.join(__dirname, '../../challenges');

async function waitForResult(jobId: string, timeoutMs = 20_000) {
  const start = Date.now();
  for (;;) {
    const job = await getCodeRunJobView(jobId);
    if (job && (job.status === 'success' || job.status === 'failure')) {
      return job;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timed out waiting for job ${jobId}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

function readSlugAndLanguage(dir: string) {
  const metaPath = path.join(CHALLENGES_DIR, dir, 'metadata.json');
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  if (meta.isInfoOnly) return null;
  return { slug: meta.id as string, language: (meta.language as string).toLowerCase() };
}

function readSolution(dir: string, language: string): string | null {
  const fileByLang: Record<string, string> = {
    python: 'solution.py',
    go: 'solution.go',
    sql: 'solution.sql',
  };
  const file = fileByLang[language];
  if (!file) return null;
  const p = path.join(CHALLENGES_DIR, dir, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

async function main() {
  const dirs = fs
    .readdirSync(CHALLENGES_DIR)
    .filter((d) => fs.statSync(path.join(CHALLENGES_DIR, d)).isDirectory());

  const results: { slug: string; ok: boolean; detail: string }[] = [];

  for (const dir of dirs) {
    const info = readSlugAndLanguage(dir);
    if (!info) continue;
    const { slug, language } = info;
    if (!['python', 'go', 'sql'].includes(language)) continue;

    const solution = readSolution(dir, language);
    if (!solution) {
      results.push({ slug, ok: false, detail: 'no solution file found' });
      continue;
    }

    const challenge = await prisma.challenge.findUnique({ where: { slug } });
    if (!challenge) {
      results.push({ slug, ok: false, detail: 'not found in DB' });
      continue;
    }

    try {
      const enqueued = await enqueueCodeRun({
        code: solution,
        tests: challenge.tests,
        language: language as 'python' | 'sql' | 'go',
        challengeId: challenge.id,
        userId: 'e2e-check-all',
      });
      const job = await waitForResult(enqueued.id);
      if (job.result?.success) {
        const total = job.result.testSummary?.total;
        results.push({ slug, ok: true, detail: total ? `${total}/${total}` : 'ok' });
      } else {
        results.push({ slug, ok: false, detail: job.result?.error ?? 'unknown failure' });
      }
    } catch (err) {
      results.push({ slug, ok: false, detail: String(err) });
    }

    process.stdout.write(`${results[results.length - 1]!.ok ? '.' : 'X'}`);
  }

  console.log('\n');
  const failures = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.slug}  ${r.detail}`);
  }
  console.log(`\n${results.length - failures.length}/${results.length} passed`);

  await prisma.$disconnect();
  if (failures.length > 0) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
