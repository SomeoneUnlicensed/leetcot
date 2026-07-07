/**
 * Exercises the real production grading path end to end: fetches a challenge's
 * `tests` straight from the DB, enqueues a job through @repo/code-runner exactly
 * like the web app does, and waits for the live code-runner worker (Docker
 * sandbox) to grade it. Run with a correct and a broken solution per language.
 *
 * Usage: dotenv -e .env -- tsx scripts/generate-closed-tests/e2e_check.ts
 */
import { PrismaClient } from '@prisma/client';
import { enqueueCodeRun, getCodeRunJobView } from '@repo/code-runner';

const prisma = new PrismaClient();

async function waitForResult(jobId: string, timeoutMs = 20000) {
  const start = Date.now();
  for (;;) {
    const job = await getCodeRunJobView(jobId);
    if (job && (job.status === 'success' || job.status === 'failure')) {
      return job;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for job ${jobId}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function check(slug: string, language: 'python' | 'sql' | 'go', code: string, label: string) {
  const challenge = await prisma.challenge.findUniqueOrThrow({ where: { slug } });
  const enqueued = await enqueueCodeRun({
    code,
    tests: challenge.tests,
    language,
    challengeId: challenge.id,
    userId: 'e2e-check',
  });
  const job = await waitForResult(enqueued.id);
  console.log(`\n=== ${slug} :: ${label} ===`);
  console.log('success:', job.result?.success);
  console.log('error:', job.result?.error);
  console.log('testSummary:', JSON.stringify(job.result?.testSummary));
}

async function main() {
  // Python: correct + broken
  const twosumGood = `def two_fish(weights, target):\n    prevMap = {}\n    for i, n in enumerate(weights):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []\n`;
  const twosumBad = `def two_fish(weights, target):\n    return [0, 0]\n`;
  await check('python-fish-twosum', 'python', twosumGood, 'correct solution');
  await check('python-fish-twosum', 'python', twosumBad, 'broken solution');

  // Go: correct + broken
  const fullBowlsGood = `package main\n\nfunc CountFullBowls(fish []int, limit int) int {\n\tcount := 0\n\tfor _, value := range fish {\n\t\tif value >= limit {\n\t\t\tcount++\n\t\t}\n\t}\n\treturn count\n}\n`;
  const fullBowlsBad = `package main\n\nfunc CountFullBowls(fish []int, limit int) int {\n\treturn 0\n}\n`;
  await check('go-cat-full-bowls', 'go', fullBowlsGood, 'correct solution');
  await check('go-cat-full-bowls', 'go', fullBowlsBad, 'broken solution');

  // SQL: correct + broken
  const avgCatchGood = `SELECT team, ROUND(AVG(fish_count), 1) AS avg_fish\nFROM catches\nGROUP BY team\nORDER BY avg_fish DESC;`;
  const avgCatchBad = `SELECT team, 0 AS avg_fish FROM catches GROUP BY team;`;
  await check('sql-cat-average-catch', 'sql', avgCatchGood, 'correct solution');
  await check('sql-cat-average-catch', 'sql', avgCatchBad, 'broken solution');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
