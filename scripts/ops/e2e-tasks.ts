// End-to-end check of every task through the REAL environment code: for each of the 20 tasks,
// startEnvironment() (apps/web/src/server/environments.ts) creates the container, then this
// script behaves like a participant - it looks for leaks, SOLVES the task where the flag is
// earned, reads the flag the way the task hands it out, and checks that it is accepted, i.e.
// its hash equals the flagHash the submit route compares against.
//
// Uses the first ADMIN user's id for the environment rows and removes them again. Run inside an
// app container (scripts/ops/run-e2e-tasks.sh does the copy/exec/cleanup):
//   docker exec -w /app/apps/web <app> npx tsx e2e-tasks.ts [slug ...]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { hashFlag, prisma } from '@repo/db';
import { startEnvironment, stopEnvironment } from './src/server/environments';

const run = promisify(execFile);
const FLAG_RE = /LENTA\{[a-z0-9_]+\}/g;
const DISK_SCAN =
  "grep -rhoE 'LENTA\\{[a-z0-9_]+\\}' /etc /opt /root /home /srv /var /tmp /run 2>/dev/null | sort -u";

interface TaskCase {
  slug: string;
  /** shell run as root to solve a task whose flag is only handed out once it is fixed */
  solve?: string;
  /** ms to wait after solving for the task's watcher loop to notice */
  settleMs?: number;
  /** shell printing the flag where it does not sit on disk (memory / network / redis) */
  read?: string;
}

const CASES: TaskCase[] = [
  { slug: 'abandoned-admin-panel' },
  { slug: 'attacker-ip-log-filtering' },
  { slug: 'command-injection-ping' },
  {
    slug: 'docker-api-secrets',
    read: 'for id in $(wget -qO- http://127.0.0.1:2375/containers/json | grep -o \'"Id": *"[^"]*"\' | cut -d\'"\' -f4); do wget -qO- http://127.0.0.1:2375/containers/$id/json; done',
  },
  { slug: 'firewall-block-malicious-ip', solve: 'iptables -I INPUT -s 10.13.37.13 -j DROP', settleMs: 15000 },
  {
    slug: 'firewall-header-spoof-bypass',
    read: "wget -qO- --header 'X-Forwarded-For: 10.0.0.5' http://127.0.0.1:8080/internal/status",
  },
  { slug: 'hidden-process-detection', solve: 'kill $(cat /var/tmp/.cache/.pid)', settleMs: 5000 },
  {
    slug: 'log-rotation-setup',
    solve: 'gzip -c /var/log/app/access.log > /var/log/app/access.log.1.gz && : > /var/log/app/access.log',
    settleMs: 5000,
  },
  { slug: 'network-scan' },
  { slug: 'nfs-smb-exfiltration' },
  { slug: 'path-traversal-lfi' },
  { slug: 'restore-failed-replica-node', solve: 'redis-cli -p 6380 REPLICAOF 127.0.0.1 6379', settleMs: 9000 },
  { slug: 'restore-sudoers' },
  {
    slug: 'reverse-shell-access',
    solve:
      "python3 -c \"import socket,time; s=socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.bind(('127.0.0.1', 4444)); s.listen(1); c,_=s.accept(); time.sleep(20)\" >/dev/null 2>&1 & sleep 1; wget -qO- 'http://127.0.0.1:9090/trigger?host=127.0.0.1&port=4444'",
    settleMs: 4000,
  },
  { slug: 'ssh-bruteforce' },
  { slug: 'stolen-ssh-key' },
  {
    slug: 'traffic-sniffing',
    read: "timeout 20 tcpdump -i lo -l -A 'tcp port 8090' 2>/dev/null | grep -m1 -o 'LENTA{[a-z0-9_]*}'",
  },
  { slug: 'unprotected-database', read: 'redis-cli GET internal:backup_notes' },
  { slug: 'vulnerable-library-patch', solve: "sed -i 's/4\\.17\\.15/4.17.21/' /app/package-manifest.json", settleMs: 5000 },
  { slug: 'web-shell-cleanup', solve: 'rm -f /var/www/site/uploads/wp-cache-x9f.php', settleMs: 4000 },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sh = async (container: string, script: string): Promise<string> => {
  const result = await run('docker', ['exec', container, 'sh', '-l', '-c', script], { maxBuffer: 16 * 1024 * 1024 }).catch(
    (error: { stdout?: string }) => ({ stdout: error.stdout ?? '' }),
  );
  return String(result.stdout).trim();
};
const flagsIn = (text: string) => text.match(FLAG_RE) ?? [];

async function main() {
  const only = process.argv.slice(2);
  const cases = only.length > 0 ? CASES.filter((c) => only.includes(c.slug)) : CASES;
  const user = await prisma.user.findFirstOrThrow({ where: { roles: { some: { role: 'ADMIN' } } } });
  let failed = 0;

  for (const c of cases) {
    const problems: string[] = [];
    const task = await prisma.debugTask.findUniqueOrThrow({ where: { slug: c.slug } });
    if (!task.dockerImage) throw new Error(`${c.slug} has no docker image`);

    const env = await startEnvironment(user.id, { ...task, dockerImage: task.dockerImage });
    try {
      await sleep(4000); // let the entrypoint finish booting

      // 1. nothing to read off the process table before the task is done
      const cfg = (await run('docker', ['inspect', '-f', '{{json .Config.Env}}', env.containerName])).stdout;
      if (cfg.includes('FLAG=')) problems.push('FLAG in container config');
      if ((await sh(env.containerName, 'echo "$FLAG"')) !== '') problems.push('$FLAG visible in shell');
      const proc = await sh(env.containerName, 'cat /proc/[0-9]*/environ /proc/[0-9]*/cmdline 2>/dev/null | tr "\\0" "\\n"');
      if (flagsIn(proc).length > 0) problems.push('flag visible in /proc');

      // 2. earned tasks must not hand the flag out before they are solved
      if (c.solve) {
        const early = flagsIn(await sh(env.containerName, DISK_SCAN));
        if (early.some((f) => hashFlag(f) === env.flagHash)) problems.push('flag on disk BEFORE solving');
        await sh(env.containerName, c.solve);
        await sleep(c.settleMs ?? 4000);
      }

      // 3. read the flag the way the task delivers it, and check the submit route would accept it
      const found = flagsIn(c.read ? await sh(env.containerName, c.read) : await sh(env.containerName, DISK_SCAN));
      const accepted = found.some((f) => hashFlag(f) === env.flagHash);
      if (!accepted) problems.push(`no accepted flag found (candidates: ${found.length})`);
    } finally {
      await stopEnvironment(env).catch(() => undefined);
      await prisma.taskEnvironment.delete({ where: { id: env.id } }).catch(() => undefined);
    }

    const how = c.solve ? 'solved' : c.read ? 'read' : 'on disk';
    if (problems.length === 0) {
      console.log(`PASS  ${c.slug}  (${how})`);
    } else {
      console.log(`FAIL  ${c.slug}  (${how}): ${problems.join('; ')}`);
      failed++;
    }
  }

  console.log(`--- ${cases.length - failed} passed, ${failed} failed ---`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
