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
  type CodeRunTestSummary,
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
const RUNTIME_PULL_TIMEOUT_MS = getPositiveInteger(
  process.env.CODE_RUNNER_RUNTIME_PULL_TIMEOUT_MS,
  600_000,
);

interface DockerRunResult {
  exitCode: number | null;
  stderr: string;
  stdout: string;
  timedOut: boolean;
}

interface LanguageRuntime {
  cacheVolumes?: string[];
  command: string[];
  cpuLimit?: string;
  env?: string[];
  fileName: string;
  image: string;
  label: string;
  memoryLimit?: string;
  timeoutMs?: number;
}

const pythonRuntime: LanguageRuntime = {
  command: ['python', 'main.py'],
  fileName: 'main.py',
  image: 'python:3.11-alpine',
  label: 'Python',
};

const sqlRuntime: LanguageRuntime = {
  ...pythonRuntime,
  label: 'SQL',
};

const goRuntime: LanguageRuntime = {
  cacheVolumes: ['litkot-go-build-cache:/root/.cache/go-build', 'litkot-go-mod-cache:/go/pkg/mod'],
  command: [
    'env',
    'GO111MODULE=off',
    'GOCACHE=/root/.cache/go-build',
    'GOMODCACHE=/go/pkg/mod',
    'GOFLAGS=-buildvcs=false',
    'go',
    'test',
    '-vet=off',
    '-run',
    'Test',
    '-count=1',
    '-timeout',
    '8s',
    '.',
  ],
  cpuLimit: process.env.CODE_RUNNER_GO_CPU_LIMIT ?? '1.0',
  fileName: 'main.go',
  image: 'golang:1.24-alpine',
  label: 'Go',
  memoryLimit: process.env.CODE_RUNNER_GO_MEMORY_LIMIT ?? '256m',
  timeoutMs: getPositiveInteger(process.env.CODE_RUNNER_GO_TIMEOUT_MS, 12_000),
};

const runtimes = {
  python: pythonRuntime,
  // SQL challenges are graded by generating a Python program (below) that runs the
  // query through the stdlib sqlite3 module — no separate image/runtime needed.
  sql: sqlRuntime,
  go: goRuntime,
} satisfies Record<CodeRunPayload['language'], LanguageRuntime>;

const readyRuntimeImages = new Set<string>();
const hotGoRunners = new Map<number, { baseDir: string; containerName: string }>();
const hotPythonRunners = new Map<number, { baseDir: string; containerName: string }>();

function getRuntimeUnavailableMessage(language: CodeRunPayload['language']) {
  if (language === 'sql') {
    return 'SQL-проверка временно недоступна: сервер не успел подготовить изолированную песочницу. Мы уже пробуем поднять runtime автоматически, повторите проверку через минуту.';
  }

  if (language === 'go') {
    return 'Go-проверка временно недоступна: сервер не успел подготовить изолированную песочницу. Мы уже пробуем поднять runtime автоматически, повторите проверку через минуту.';
  }

  return 'Проверка кода временно недоступна: сервер не успел подготовить изолированную песочницу. Мы уже пробуем поднять runtime автоматически, повторите проверку через минуту.';
}

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
import json
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

def short_repr(value):
    text = repr(value)
    return text if len(text) <= 220 else text[:217] + '...'

def finish(success, passed, cases=None):
    print(json.dumps({
        'passed': passed,
        'total': TRIALS,
        'cases': cases or [],
    }, ensure_ascii=False))
    sys.exit(0 if success else 1)

def failed_case(name, message):
    return {'name': name, 'passed': False, 'message': message}

user_fn = USER_NS.get(ENTRY_POINT)
ref_fn = REF_NS.get(ENTRY_POINT)
generate_case = GEN_NS.get('generate_case')

if user_fn is None:
    finish(False, 0, [
        failed_case('Проверка функции', f'В решении должна быть функция {ENTRY_POINT}(...). Сейчас она не найдена.')
    ])
if ref_fn is None or generate_case is None:
    finish(False, 0, [
        failed_case('Настройка проверки', 'Проверка задачи временно настроена неверно. Мы уже знаем, где чинить.')
    ])

def normalize(value):
    if hasattr(value, 'next'):
        result = []
        seen = 0
        while value is not None and seen < 10000:
            result.append(getattr(value, 'val', None))
            value = getattr(value, 'next', None)
            seen += 1
        return result
    if hasattr(value, 'left') or hasattr(value, 'right'):
        return (
            getattr(value, 'val', None),
            normalize(getattr(value, 'left', None)),
            normalize(getattr(value, 'right', None)),
        )
    if isinstance(value, (list, tuple)):
        items = [normalize(item) for item in value]
        if RESULT_ORDER_INSENSITIVE:
            try:
                return sorted(items, key=repr)
            except TypeError:
                return items
        return items
    if isinstance(value, dict):
        return {key: normalize(value[key]) for key in sorted(value)}
    return value

def run_callable(obj, args):
    if ENTRY_POINT == 'FeedingQueue':
        queue = obj()
        output = []
        values = list(args[0])
        for index, value in enumerate(values):
            queue.add_cat(value)
            if index % 3 == 1:
                output.append(queue.feed_next())
        while True:
            value = queue.feed_next()
            output.append(value)
            if value is None:
                break
        return output
    return obj(*args)

for trial in range(TRIALS):
    case_name = f'Тест {trial + 1}'
    args = generate_case()
    if not isinstance(args, tuple):
        args = (args,)
    user_args = copy.deepcopy(args)
    ref_args = copy.deepcopy(args)

    try:
        actual = run_callable(user_fn, user_args)
    except Exception as exc:
        finish(False, trial, [
            failed_case(case_name, f'Решение упало на тесте: {exc}')
        ])

    expected = run_callable(ref_fn, ref_args)

    if normalize(actual) != normalize(expected):
        finish(False, trial, [
            failed_case(
                case_name,
                f'Ожидалось {short_repr(expected)}, получено {short_repr(actual)}'
            )
        ])

finish(True, TRIALS)
`;
}

function parseTestSummary(output: string): CodeRunTestSummary | undefined {
  const line = output
    .split('\n')
    .map((part) => part.trim())
    .reverse()
    .find((part) => part.startsWith('{') && part.endsWith('}'));

  if (!line) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(line) as Partial<CodeRunTestSummary>;
    if (
      typeof parsed.passed === 'number' &&
      typeof parsed.total === 'number' &&
      parsed.total >= 0
    ) {
      return {
        cases: Array.isArray(parsed.cases) ? parsed.cases : [],
        passed: parsed.passed,
        total: parsed.total,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
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

function isMissingRuntimeImageError(output = '') {
  return (
    output.includes('No such image') ||
    output.includes('Unable to find image') ||
    output.includes('pull access denied') ||
    output.includes('not found: manifest unknown')
  );
}

async function ensureRuntimeImage(runtime: LanguageRuntime) {
  if (readyRuntimeImages.has(runtime.image)) {
    return;
  }

  try {
    await execAsync(`docker image inspect "${runtime.image}"`);
    readyRuntimeImages.add(runtime.image);
    return;
  } catch {
    console.warn(`${runtime.label} runtime image ${runtime.image} is missing; pulling it now.`);
  }

  await execAsync(`docker pull "${runtime.image}"`, { timeout: RUNTIME_PULL_TIMEOUT_MS });
  await execAsync(`docker image inspect "${runtime.image}"`);
  readyRuntimeImages.add(runtime.image);
}

async function forceRemoveContainer(containerName: string) {
  await execAsync(`docker rm -f "${containerName}"`).catch(() => undefined);
}

async function cleanupSandbox(containerName: string, tmpDir: string) {
  await forceRemoveContainer(containerName);
  await rm(tmpDir, { force: true, recursive: true });
}

async function cleanupStaleSandboxContainers() {
  const staleQueries = [
    'docker ps -aq --filter "name=^/litkot-run-" --filter "label=litkot.runner=code-runner"',
    'docker ps -aq --filter "name=^/litkot-hot-go-" --filter "label=litkot.runner=hot"',
    'docker ps -aq --filter "name=^/litkot-hot-python-" --filter "label=litkot.runner=hot"',
  ];
  const stdout = (
    await Promise.all(staleQueries.map((query) => execAsync(query).catch(() => ({ stdout: '' }))))
  )
    .map((result) => result.stdout)
    .join('\n');
  const containerIds = stdout.split(/\s+/).filter(Boolean);

  if (containerIds.length === 0) {
    return;
  }

  await execAsync(`docker rm -f ${containerIds.join(' ')}`).catch(() => undefined);
  console.log(`Removed ${containerIds.length} stale sandbox container(s)`);
}

async function ensureHotGoRunner(workerId: number) {
  const existing = hotGoRunners.get(workerId);
  if (existing) {
    const { stdout } = await execAsync(
      `docker inspect -f "{{.State.Running}}" "${existing.containerName}"`,
    ).catch(() => ({ stdout: '' }));
    if (stdout.trim() === 'true') {
      return existing;
    }
    hotGoRunners.delete(workerId);
  }

  await ensureRuntimeImage(goRuntime);

  const containerName = `litkot-hot-go-${workerId}`;
  const baseDir = path.join(os.tmpdir(), 'litkot-hot-go', String(workerId));
  await rm(baseDir, { force: true, recursive: true });
  await mkdir(baseDir, { recursive: true });
  await forceRemoveContainer(containerName);

  const normalizedBaseDir = baseDir.replace(/\\/g, '/');
  await execAsync(
    [
      'docker',
      'run',
      '-d',
      '--name',
      `"${containerName}"`,
      '--label',
      'litkot.runner=hot',
      '--pull',
      'never',
      '--network',
      'none',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
      '-m',
      goRuntime.memoryLimit ?? MEMORY_LIMIT,
      '--cpus',
      goRuntime.cpuLimit ?? CPU_LIMIT,
      '--pids-limit',
      '128',
      '-v',
      `"${normalizedBaseDir}:/work"`,
      ...(goRuntime.cacheVolumes ?? []).flatMap((volume) => ['-v', volume]),
      '-w',
      '/work',
      goRuntime.image,
      'sh',
      '-c',
      '"sleep infinity"',
    ].join(' '),
  );

  const runner = { baseDir, containerName };
  hotGoRunners.set(workerId, runner);
  return runner;
}

async function ensureHotPythonRunner(workerId: number) {
  const existing = hotPythonRunners.get(workerId);
  if (existing) {
    const { stdout } = await execAsync(
      `docker inspect -f "{{.State.Running}}" "${existing.containerName}"`,
    ).catch(() => ({ stdout: '' }));
    if (stdout.trim() === 'true') {
      return existing;
    }
    hotPythonRunners.delete(workerId);
  }

  await ensureRuntimeImage(pythonRuntime);

  const containerName = `litkot-hot-python-${workerId}`;
  const baseDir = path.join(os.tmpdir(), 'litkot-hot-python', String(workerId));
  await rm(baseDir, { force: true, recursive: true });
  await mkdir(baseDir, { recursive: true });
  await forceRemoveContainer(containerName);

  const normalizedBaseDir = baseDir.replace(/\\/g, '/');
  await execAsync(
    [
      'docker',
      'run',
      '-d',
      '--name',
      `"${containerName}"`,
      '--label',
      'litkot.runner=hot',
      '--pull',
      'never',
      '--network',
      'none',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
      '-m',
      pythonRuntime.memoryLimit ?? MEMORY_LIMIT,
      '--cpus',
      pythonRuntime.cpuLimit ?? CPU_LIMIT,
      '--pids-limit',
      '128',
      '-v',
      `"${normalizedBaseDir}:/work"`,
      '-w',
      '/work',
      pythonRuntime.image,
      'sh',
      '-c',
      '"sleep infinity"',
    ].join(' '),
  );

  const runner = { baseDir, containerName };
  hotPythonRunners.set(workerId, runner);
  return runner;
}

async function executeGoHotJob(job: CodeRunJob, workerId: number): Promise<CodeRunResult> {
  const runner = await ensureHotGoRunner(workerId);
  const jobDir = path.join(runner.baseDir, job.id);
  await mkdir(jobDir, { recursive: true });
  await writeFile(path.join(jobDir, goRuntime.fileName), job.payload.code);
  await writeFile(path.join(jobDir, 'main_test.go'), job.payload.tests);

  const timeoutSeconds = Math.ceil((goRuntime.timeoutMs ?? TIMEOUT_MS) / 1000);
  const dockerArgs = [
    'exec',
    '-w',
    `/work/${job.id}`,
    runner.containerName,
    'timeout',
    '-s',
    'KILL',
    `${timeoutSeconds}s`,
    ...goRuntime.command,
  ];

  try {
    const startTime = performance.now();
    const result = await runSandboxContainer(
      dockerArgs,
      runner.containerName,
      (goRuntime.timeoutMs ?? TIMEOUT_MS) + 2_000,
    );
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (result.timedOut || result.exitCode === 137) {
      hotGoRunners.delete(workerId);
      return {
        error: `ТАЙМАУТ: Код выполнялся дольше ${timeoutSeconds} секунд. Возможно бесконечный цикл или очень медленное выполнение.`,
        output: trimOutput(result.stdout),
        success: false,
      };
    }

    if (result.exitCode !== 0) {
      const testSummary = parseTestSummary(result.stdout);
      const failedCase = testSummary?.cases?.find((item) => !item.passed);

      return {
        error:
          failedCase?.message ||
          trimOutput(result.stderr || `Процесс завершился с кодом ${result.exitCode}`),
        output: testSummary ? '' : trimOutput(result.stdout),
        success: false,
        testSummary,
      };
    }

    const testSummary = parseTestSummary(result.stdout);

    return {
      error: '',
      executionTimeMs,
      output: testSummary ? '' : trimOutput(result.stdout),
      success: true,
      testSummary,
    };
  } finally {
    await rm(jobDir, { force: true, recursive: true });
  }
}

async function executePythonHotJob(job: CodeRunJob, workerId: number): Promise<CodeRunResult> {
  const runner = await ensureHotPythonRunner(workerId);
  const jobDir = path.join(runner.baseDir, job.id);
  await mkdir(jobDir, { recursive: true });

  const pythonOracle =
    job.payload.language === 'python' ? parsePythonOracle(job.payload.tests) : null;
  const fullCode =
    job.payload.language === 'sql'
      ? buildSqlProgram(job.payload.code, job.payload.tests)
      : pythonOracle
        ? buildPythonOracleProgram(job.payload.code, pythonOracle)
        : `${job.payload.code}\n\n${job.payload.tests}`;

  await writeFile(path.join(jobDir, pythonRuntime.fileName), fullCode);

  const timeoutMs = pythonRuntime.timeoutMs ?? TIMEOUT_MS;
  const timeoutSeconds = Math.ceil(timeoutMs / 1000);
  const dockerArgs = [
    'exec',
    '-w',
    `/work/${job.id}`,
    runner.containerName,
    'timeout',
    '-s',
    'KILL',
    `${timeoutSeconds}s`,
    ...pythonRuntime.command,
  ];

  try {
    const startTime = performance.now();
    const result = await runSandboxContainer(dockerArgs, runner.containerName, timeoutMs + 2_000);
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (result.timedOut || result.exitCode === 137) {
      hotPythonRunners.delete(workerId);
      return {
        error: `ТАЙМАУТ: Код выполнялся дольше ${timeoutSeconds} секунд. Возможно бесконечный цикл или очень медленное выполнение.`,
        output: trimOutput(result.stdout),
        success: false,
      };
    }

    if (result.exitCode !== 0) {
      const testSummary = parseTestSummary(result.stdout);
      const failedCase = testSummary?.cases?.find((item) => !item.passed);

      return {
        error:
          failedCase?.message ||
          trimOutput(result.stderr || `Процесс завершился с кодом ${result.exitCode}`),
        output: testSummary ? '' : trimOutput(result.stdout),
        success: false,
        testSummary,
      };
    }

    const testSummary = parseTestSummary(result.stdout);

    return {
      error: '',
      executionTimeMs,
      output: testSummary ? '' : trimOutput(result.stdout),
      success: true,
      testSummary,
    };
  } finally {
    await rm(jobDir, { force: true, recursive: true });
  }
}

async function warmRuntimeImages() {
  const runtimeByImage = new Map<string, LanguageRuntime>();
  Object.values(runtimes).forEach((runtime) => {
    runtimeByImage.set(runtime.image, runtime);
  });

  const results = await Promise.allSettled(
    [...runtimeByImage.values()].map(async (runtime) => {
      await ensureRuntimeImage(runtime);
      console.log(`Runtime image ready: ${runtime.image}`);
    }),
  );

  const images = [...runtimeByImage.keys()];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(
        `Runtime image warmup failed for ${images[index]}. The runner will retry on demand.`,
        result.reason,
      );
    }
  });
}

async function runGoWarmupPackage(packageName: string, mainSource: string, testSource: string) {
  const tmpDir = path.join(os.tmpdir(), `litkot-go-cache-warmup-${packageName}`);
  await rm(tmpDir, { force: true, recursive: true });
  await mkdir(tmpDir, { recursive: true });
  await writeFile(path.join(tmpDir, 'main.go'), mainSource);
  await writeFile(path.join(tmpDir, 'main_test.go'), testSource);

  const containerName = `litkot-go-cache-warmup-${packageName}`;
  const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
  const args = [
    'run',
    '--rm',
    '--name',
    containerName,
    '--label',
    'litkot.runner=warmup',
    '--pull',
    'never',
    '--network',
    'none',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '-m',
    goRuntime.memoryLimit ?? MEMORY_LIMIT,
    '--cpus',
    goRuntime.cpuLimit ?? CPU_LIMIT,
    '--pids-limit',
    '128',
    '-v',
    `${normalizedTmpDir}:/code`,
    ...(goRuntime.cacheVolumes ?? []).flatMap((volume) => ['-v', volume]),
    '-w',
    '/code',
    goRuntime.image,
    ...goRuntime.command,
  ];

  try {
    const result = await runSandboxContainer(args, containerName, 60_000);
    if (result.exitCode !== 0) {
      const message = result.timedOut
        ? 'timed out'
        : trimOutput(result.stderr || result.stdout || 'unknown error');
      console.warn(`Go build cache warmup failed for ${packageName}: ${message}`);
    }
  } finally {
    await cleanupSandbox(containerName, tmpDir);
  }
}

async function warmGoBuildCache() {
  await runGoWarmupPackage(
    'stdlib',
    `package main

import (
  "container/heap"
  "fmt"
  "reflect"
  "sort"
  "strconv"
  "strings"
)

type warmHeap []int

func (h warmHeap) Len() int           { return len(h) }
func (h warmHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h warmHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *warmHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *warmHeap) Pop() any {
  old := *h
  x := old[len(old)-1]
  *h = old[:len(old)-1]
  return x
}

func warm() string {
  values := []int{3, 1, 2}
  sort.Ints(values)
  h := &warmHeap{2, 1}
  heap.Init(h)
  heap.Push(h, 3)
  _ = heap.Pop(h)
  parsed, _ := strconv.Atoi("42")
  if !reflect.DeepEqual(values, []int{1, 2, 3}) {
    return "bad"
  }
  return fmt.Sprintf("%s:%d", strings.ToUpper("ok"), parsed)
}
`,
    `package main

import (
  "math/rand"
  "testing"
)

func TestWarm(t *testing.T) {
  if warm() != "OK:42" {
    t.Fatal("bad warmup")
  }
  if rand.New(rand.NewSource(1)).Intn(10) < 0 {
    t.Fatal("bad rand")
  }
}
`,
  );
  console.log('Go build cache warmed');
}

async function runSandboxContainer(
  args: string[],
  containerName: string,
  timeoutMs: number,
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
    }, timeoutMs);

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

async function executeJob(job: CodeRunJob, workerId: number): Promise<CodeRunResult> {
  if (job.payload.language === 'go') {
    return executeGoHotJob(job, workerId);
  }
  if (job.payload.language === 'python' || job.payload.language === 'sql') {
    return executePythonHotJob(job, workerId);
  }

  return {
    error: `Язык ${job.payload.language} не поддерживается песочницей`,
    success: false,
  };
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
      const result = await executeJob(job, workerId);
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
  await warmGoBuildCache();

  for (let i = 0; i < CONCURRENCY; i += 1) {
    void worker(i + 1);
  }
}

void main().catch((error: unknown) => {
  console.error('Code runner failed to start', error);
  process.exit(1);
});
