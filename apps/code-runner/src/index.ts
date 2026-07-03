import { exec, spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
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
  command: string[];
  fileName: string;
  image: string;
}

const pythonRuntime: LanguageRuntime = {
  command: ['python', 'main.py'],
  fileName: 'main.py',
  image: 'python:3.11-alpine',
};

const runtimes = {
  python: pythonRuntime,
  // SQL challenges are graded by generating a Python program (below) that runs the
  // query through the stdlib sqlite3 module — no separate image/runtime needed.
  sql: pythonRuntime,
} satisfies Record<CodeRunPayload['language'], LanguageRuntime>;

// Must match packages/db/seed/data/challenge-ingest.ts's PYTHON_ORACLE_MARKER and
// apps/web's getChallengeRouteData sanitizePythonTestsForClient.
const PYTHON_ORACLE_MARKER = '# ---LEETCOT-ORACLE---';

interface PythonOracleConfig {
  entryPoint: string;
  referenceSolution: string;
  seedGenerator: string;
  // Some problems explicitly allow the result list in any order (e.g. two_fish may
  // return either index first) — set via challenges/*/oracle-config.json.
  resultOrderInsensitive?: boolean;
}

function parsePythonOracle(testsRaw: string): PythonOracleConfig | null {
  const markerIndex = testsRaw.indexOf(PYTHON_ORACLE_MARKER);
  if (markerIndex === -1) {
    return null;
  }
  const afterMarker = testsRaw.slice(markerIndex + PYTHON_ORACLE_MARKER.length);
  const jsonLine = afterMarker
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('#') && line.slice(1).trim().startsWith('{'));

  if (!jsonLine) {
    return null;
  }

  try {
    return JSON.parse(jsonLine.slice(jsonLine.indexOf('{'))) as PythonOracleConfig;
  } catch {
    return null;
  }
}

/**
 * Runs the user's function against the author's reference solution on freshly
 * generated random inputs (not the same data every run, unlike the visible
 * tests.py's fixed-seed cases), so a submission has to be genuinely equivalent to
 * the reference rather than overfit to specific fixed inputs. Arguments are
 * deep-copied per call since some solutions (e.g. permutations) mutate their input.
 */
function buildPythonOracleProgram(userCode: string, oracle: PythonOracleConfig): string {
  return `
import copy
import sys

USER_NS = {}
exec(${JSON.stringify(userCode)}, USER_NS)

REF_NS = {}
exec(${JSON.stringify(oracle.referenceSolution)}, REF_NS)

GEN_NS = {}
exec(${JSON.stringify(oracle.seedGenerator)}, GEN_NS)

ENTRY_POINT = ${JSON.stringify(oracle.entryPoint)}
RESULT_ORDER_INSENSITIVE = ${oracle.resultOrderInsensitive ? 'True' : 'False'}
TRIALS = 5

user_fn = USER_NS.get(ENTRY_POINT)
ref_fn = REF_NS.get(ENTRY_POINT)
generate_case = GEN_NS.get('generate_case')

if user_fn is None:
    print(f'Функция {ENTRY_POINT} не найдена в решении', file=sys.stderr)
    sys.exit(1)
if ref_fn is None or generate_case is None:
    print('Ошибка конфигурации oracle-проверки', file=sys.stderr)
    sys.exit(1)

def normalize(value):
    if isinstance(value, (list, tuple)):
        items = [normalize(item) for item in value]
        if RESULT_ORDER_INSENSITIVE:
            try:
                return sorted(items)
            except TypeError:
                return items
        return items
    return value

for trial in range(TRIALS):
    args = generate_case()
    user_args = copy.deepcopy(args)
    ref_args = copy.deepcopy(args)

    try:
        actual = user_fn(*user_args)
    except Exception as exc:
        print(f'Ошибка выполнения на наборе {trial + 1}/{TRIALS}: {exc}', file=sys.stderr)
        sys.exit(1)

    expected = ref_fn(*ref_args)

    if normalize(actual) != normalize(expected):
        print(
            f'MISMATCH on trial {trial + 1}/{TRIALS}: args={args} '
            f'expected={expected} actual={actual}',
            file=sys.stderr,
        )
        sys.exit(1)

print('OK')
sys.exit(0)
`;
}

/**
 * SQL challenges store their test fixture as JSON in `tests`, not as literal source
 * code appended after the user's solution like the other languages. This
 * synthesizes a self-contained Python script that runs the check in one of two
 * modes:
 *
 * - Oracle mode (`seedGenerator` + `referenceSolution` present, folded in by
 *   challenge-ingest.ts from a challenge's generator.py/solution.sql): generates a
 *   FRESH random seed on every run, runs both the author's reference solution and
 *   the user's query against the identical seed, and compares the two outputs.
 *   Because the data is never the same twice and the expected rows are never
 *   computed until the check actually happens, a user can't just hardcode a
 *   literal result set that matches a fixed, publicly-visible fixture — the query
 *   has to be genuinely equivalent to the reference solution. Repeated a few times
 *   so a query that only coincidentally matches one random draw still fails.
 * - Legacy mode (fallback for challenges without a generator): compares against
 *   the static `expected`/`expectedQuery` in the fixture, same as before.
 */
function buildSqlProgram(userSql: string, testsJson: string): string {
  return `
import json
import sqlite3
import sys

TESTS = json.loads(${JSON.stringify(testsJson)})
USER_SQL = ${JSON.stringify(userSql)}

SCHEMA = TESTS.get('schema')
EXPECTED_TYPE = TESTS.get('expectedType')
EXPECTED_QUERY = TESTS.get('expectedQuery')
SEED_GENERATOR = TESTS.get('seedGenerator')
REFERENCE_SOLUTION = TESTS.get('referenceSolution')
ORACLE_TRIALS = 3

def _num(value):
    if isinstance(value, bool):
        raise TypeError('not numeric')
    return float(value)

def rows_match(actual, expected):
    if len(actual) != len(expected):
        return False
    for actual_row, expected_row in zip(actual, expected):
        for key, expected_value in expected_row.items():
            actual_value = actual_row.get(key)
            if isinstance(actual_value, str) and isinstance(expected_value, str):
                if actual_value.lower() != expected_value.lower():
                    return False
                continue
            try:
                if abs(_num(actual_value) - _num(expected_value)) > 0.001:
                    return False
                continue
            except (TypeError, ValueError):
                pass
            if str(actual_value) != str(expected_value):
                return False
    return True

def is_select_like(sql):
    remainder = sql
    while True:
        trimmed = remainder.lstrip()
        if trimmed.startswith('--'):
            newline_idx = trimmed.find('\\n')
            remainder = '' if newline_idx == -1 else trimmed[newline_idx + 1:]
            continue
        if trimmed.startswith('/*'):
            end_idx = trimmed.find('*/')
            remainder = '' if end_idx == -1 else trimmed[end_idx + 2:]
            continue
        remainder = trimmed
        break
    upper = remainder.upper()
    return upper.startswith('SELECT') or upper.startswith('WITH')

def run_query(seed_sql, query):
    conn = sqlite3.connect(':memory:')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    if SCHEMA:
        cur.executescript(SCHEMA)
    if seed_sql:
        cur.executescript(seed_sql)
    conn.commit()

    clean_sql = query.strip()
    if clean_sql.endswith(';'):
        clean_sql = clean_sql[:-1]

    cur.execute(clean_sql)
    if is_select_like(clean_sql):
        rows = [dict(row) for row in cur.fetchall()]
    else:
        conn.commit()
        rows = None

    if EXPECTED_TYPE == 'state' and EXPECTED_QUERY:
        cur.execute(EXPECTED_QUERY)
        return [dict(row) for row in cur.fetchall()]
    return rows if rows is not None else []

def generate_seed():
    namespace = {}
    exec(SEED_GENERATOR, namespace)
    seed_sql = namespace.get('GENERATED_SEED')
    if not isinstance(seed_sql, str):
        raise RuntimeError('generator.py must set GENERATED_SEED to a SQL string')
    return seed_sql

try:
    if SEED_GENERATOR and REFERENCE_SOLUTION:
        for trial in range(ORACLE_TRIALS):
            seed_sql = generate_seed()
            oracle_rows = run_query(seed_sql, REFERENCE_SOLUTION)
            user_rows = run_query(seed_sql, USER_SQL)
            if not rows_match(user_rows, oracle_rows):
                print(
                    f'MISMATCH on trial {trial + 1}/{ORACLE_TRIALS}: '
                    f'expected={oracle_rows} actual={user_rows}',
                    file=sys.stderr,
                )
                sys.exit(1)
        print('OK')
        sys.exit(0)
    else:
        actual_rows = run_query(TESTS.get('seed'), USER_SQL)
        expected = TESTS.get('expected') or []
        if rows_match(actual_rows, expected):
            print('OK')
            sys.exit(0)
        else:
            print(f'MISMATCH expected={expected} actual={actual_rows}', file=sys.stderr)
            sys.exit(1)
except Exception as exc:
    print(f'SQL_ERROR: {exc}', file=sys.stderr)
    sys.exit(1)
`;
}

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

async function cleanupSandbox(containerName: string, tmpDir: string) {
  await forceRemoveContainer(containerName);
  await rm(tmpDir, { force: true, recursive: true });
}

async function cleanupStaleSandboxContainers() {
  const { stdout } = await execAsync(
    'docker ps -aq --filter "name=^/litkot-run-" --filter "label=litkot.runner=code-runner"',
  ).catch(() => ({ stdout: '' }));
  const containerIds = stdout.split(/\s+/).filter(Boolean);

  if (containerIds.length === 0) {
    return;
  }

  await execAsync(`docker rm -f ${containerIds.join(' ')}`).catch(() => undefined);
  console.log(`Removed ${containerIds.length} stale sandbox container(s)`);
}

async function warmRuntimeImages() {
  const images = [...new Set(Object.values(runtimes).map((runtime) => runtime.image))];

  await Promise.all(
    images.map(async (image) => {
      await execAsync(`docker pull "${image}"`);
      console.log(`Runtime image ready: ${image}`);
    }),
  );
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
    let timedOut = false;

    const finish = (result: DockerRunResult) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      void forceRemoveContainer(containerName);
      child.kill('SIGKILL');
      finish({
        exitCode: null,
        stderr,
        stdout,
        timedOut: true,
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
        timedOut,
      });
    });
  });
}

async function executeJob(job: CodeRunJob): Promise<CodeRunResult> {
  const runtime = runtimes[job.payload.language];
  const containerName = `litkot-run-${job.id}`;
  const tmpDir = path.join(os.tmpdir(), `litkot-run-${job.id}`);
  let shouldCleanupInBackground = false;

  await mkdir(tmpDir, { recursive: true });

  try {
    const pythonOracle =
      job.payload.language === 'python' ? parsePythonOracle(job.payload.tests) : null;

    const fullCode =
      job.payload.language === 'sql'
        ? buildSqlProgram(job.payload.code, job.payload.tests)
        : pythonOracle
          ? buildPythonOracleProgram(job.payload.code, pythonOracle)
          : `${job.payload.code}\n\n${job.payload.tests}`;
    const filePath = path.join(tmpDir, runtime.fileName);
    await writeFile(filePath, fullCode);

    const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
    const dockerArgs = [
      'run',
      '--rm',
      '--name',
      containerName,
      '--label',
      'litkot.runner=code-runner',
      '--label',
      `litkot.job=${job.id}`,
      '--pull',
      'never',
      '--network',
      'none',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
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
      ...runtime.command,
    ];

    try {
      const startTime = performance.now();
      const result = await runSandboxContainer(dockerArgs, containerName);
      const executionTimeMs = Math.round(performance.now() - startTime);

      if (result.timedOut) {
        shouldCleanupInBackground = true;

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
        executionTimeMs,
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
    const cleanup = cleanupSandbox(containerName, tmpDir);

    if (shouldCleanupInBackground) {
      void cleanup;
    } else {
      await cleanup;
    }
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

async function main() {
  await cleanupStaleSandboxContainers();
  await warmRuntimeImages();

  for (let i = 0; i < CONCURRENCY; i += 1) {
    void worker(i + 1);
  }
}

void main().catch((error: unknown) => {
  console.error('Code runner failed to start', error);
  process.exit(1);
});
