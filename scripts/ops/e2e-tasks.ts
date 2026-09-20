// Spec-driven end-to-end check of every task (packages/db/seed/data/debug-tasks.ts):
//
//   1. text checks - three non-empty hints, every solution command appears VERBATIM in the
//      instructions or the hints (so the text participants read is what gets verified), and no
//      broken placeholders such as "/containers//json";
//   2. the container is started by the REAL app code (startEnvironment) and, as a participant would,
//      nothing reveals the flag up front (env, /proc, and - for tasks marked earnedLater - disk);
//   3. the solution commands run in order, and a flag that the submit route would accept (its hash
//      equals the environment's flagHash) shows up in their output or on disk.
//
// Uses the first ADMIN user for the environment rows and removes them again. The tasks must be seeded
// in the database. Run inside an app container (scripts/ops/run-e2e-tasks.sh copies and runs it):
//   docker exec -w /app/apps/web <app> npx tsx e2e-tasks.ts [slug ...]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { hashFlag, prisma } from '@repo/db';
import { debugTasks } from '../../packages/db/seed/data/debug-tasks';
import { startEnvironment, stopEnvironment } from './src/server/environments';

const run = promisify(execFile);
const FLAG_RE = /LENTA\{[a-z0-9_]+\}/g;
const DISK_SCAN =
  "grep -rhoE 'LENTA\\{[a-z0-9_]+\\}' /etc /opt /root /home /srv /var /tmp /run 2>/dev/null | sort -u";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const flagsIn = (text: string) => text.match(FLAG_RE) ?? [];

const sh = async (container: string, script: string): Promise<string> => {
  const result = await run('docker', ['exec', container, 'sh', '-l', '-c', script], { maxBuffer: 16 * 1024 * 1024 }).catch(
    (error: { stdout?: string; stderr?: string }) => ({ stdout: `${error.stdout ?? ''}${error.stderr ?? ''}` }),
  );
  return String(result.stdout).trim();
};

function textProblems(task: (typeof debugTasks)[number]): string[] {
  const problems: string[] = [];
  const text = `${task.instructions}\n${task.hints.join('\n')}`;
  if (task.hints.length !== 3 || task.hints.some((h) => h.trim().length < 20)) {
    problems.push('needs exactly 3 real hints');
  }
  if (task.solution.length === 0) problems.push('no solution commands');
  for (const command of task.solution) {
    if (!text.includes(command)) problems.push(`solution command not in the text: ${command}`);
  }
  if (/[^:/]\/\/[^/]/.test(text)) {
    problems.push('text contains "//" (a lost placeholder?)');
  }
  return problems;
}

async function main() {
  const only = process.argv.slice(2);
  const tasks = only.length > 0 ? debugTasks.filter((t) => only.includes(t.slug)) : debugTasks;
  const user = await prisma.user.findFirstOrThrow({ where: { roles: { some: { role: 'ADMIN' } } } });
  let failed = 0;

  for (const spec of tasks) {
    const problems = textProblems(spec);
    const started = Date.now();
    let solvedInMs = 0;

    const task = await prisma.debugTask.findUnique({ where: { slug: spec.slug } });
    if (!task?.dockerImage) {
      problems.push('task is not seeded in the database');
    } else {
      const env = await startEnvironment(user.id, { ...task, dockerImage: task.dockerImage });
      try {
        await sleep(4000); // let the entrypoint finish booting

        const cfg = (await run('docker', ['inspect', '-f', '{{json .Config.Env}}', env.containerName])).stdout;
        if (cfg.includes('FLAG=')) problems.push('FLAG in container config');
        if ((await sh(env.containerName, 'echo "$FLAG"')) !== '') problems.push('$FLAG visible in shell');
        const proc = await sh(env.containerName, 'cat /proc/[0-9]*/environ /proc/[0-9]*/cmdline 2>/dev/null | tr "\\0" "\\n"');
        if (flagsIn(proc).length > 0) problems.push('flag visible in /proc');
        if (spec.earnedLater) {
          const early = flagsIn(await sh(env.containerName, DISK_SCAN));
          if (early.some((f) => hashFlag(f) === env.flagHash)) problems.push('flag on disk BEFORE solving');
        }

        const t0 = Date.now();
        const outputs: string[] = [];
        for (const command of spec.solution) outputs.push(await sh(env.containerName, command));
        await sleep(spec.settleMs ?? 500);
        solvedInMs = Date.now() - t0;

        const found = [...outputs.flatMap(flagsIn), ...flagsIn(await sh(env.containerName, DISK_SCAN))];
        if (!found.some((f) => hashFlag(f) === env.flagHash)) {
          problems.push(`following the solution does not yield an accepted flag (candidates: ${found.length})`);
        }
      } finally {
        await stopEnvironment(env).catch(() => undefined);
        await prisma.taskEnvironment.delete({ where: { id: env.id } }).catch(() => undefined);
      }
    }

    const label = `${String(spec.sortOrder).padStart(2)} ${spec.slug}`;
    if (problems.length === 0) {
      console.log(`PASS  ${label}  (solution ${Math.round(solvedInMs / 100) / 10}s, total ${Math.round((Date.now() - started) / 1000)}s)`);
    } else {
      console.log(`FAIL  ${label}: ${problems.join('; ')}`);
      failed++;
    }
  }

  console.log(`--- ${tasks.length - failed} passed, ${failed} failed ---`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
