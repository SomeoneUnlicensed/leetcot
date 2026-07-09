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

// Must match packages/db/seed/data/challenge-ingest.ts's PYTHON_HIDDEN_TESTS_MARKER and
// apps/web's getChallengeRouteData sanitizePythonTestsForClient.
const PYTHON_HIDDEN_TESTS_MARKER = '# ---LEETCOT-HIDDEN-TESTS---';

interface PythonClosedTestCase {
  expected: unknown;
  name: string;
  seed: number;
}

interface PythonClosedTestConfig {
  entryPoint: string;
  cases: PythonClosedTestCase[];
  fixedCases?: unknown[][];
  seedGenerator: string;
  // Some problems explicitly allow the result list in any order (e.g. two_fish may
  // return either index first) — set via challenges/*/test-config.json.
  resultOrderInsensitive?: boolean;
}

function parsePythonClosedTests(testsRaw: string): PythonClosedTestConfig | null {
  const markerIndex = testsRaw.indexOf(PYTHON_HIDDEN_TESTS_MARKER);
  if (markerIndex === -1) {
    return null;
  }
  const afterMarker = testsRaw.slice(markerIndex + PYTHON_HIDDEN_TESTS_MARKER.length);
  const jsonLine = afterMarker
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('#') && line.slice(1).trim().startsWith('{'));

  if (!jsonLine) {
    return null;
  }

  try {
    return JSON.parse(jsonLine.slice(jsonLine.indexOf('{'))) as PythonClosedTestConfig;
  } catch {
    return null;
  }
}

/**
 * Checks the user's function against a fixed bank of pre-computed (input, expected
 * output) cases baked in at authoring time — no reference solution is executed
 * here. Each case's input is reconstructed deterministically by re-seeding the
 * generator with its stored seed (`generate_case()` is still run live because some
 * inputs are non-JSON-serializable objects like linked lists/trees, but the value
 * it's compared against was computed once, offline, by the author's solution and
 * is fixed forever). Arguments are deep-copied per call since some solutions (e.g.
 * permutations) mutate their input.
 */
function buildPythonClosedTestProgram(userCode: string, config: PythonClosedTestConfig): string {
  return `
import copy
import json
import random
import sys
import traceback

USER_NS = {}
exec(${JSON.stringify(userCode)}, USER_NS)

GEN_NS = {}
exec(${JSON.stringify(config.seedGenerator)}, GEN_NS)

ENTRY_POINT = ${JSON.stringify(config.entryPoint)}
RESULT_ORDER_INSENSITIVE = ${config.resultOrderInsensitive || config.entryPoint === 'toy_permutations' ? 'True' : 'False'}
FIXED_CASES = json.loads(${JSON.stringify(JSON.stringify(config.fixedCases ?? []))})
CASES = json.loads(${JSON.stringify(JSON.stringify(config.cases))})
TOTAL = len(CASES)

def short_repr(value):
    text = repr(value)
    return text if len(text) <= 220 else text[:217] + '...'

def input_repr(args):
    if len(args) == 1:
        return short_repr(args[0])
    return short_repr(args)

def shape_repr(value):
    if isinstance(value, list):
        if value and isinstance(value[0], list):
            return f'список из {len(value)} списков'
        return f'список длиной {len(value)}'
    if isinstance(value, tuple):
        return f'кортеж длиной {len(value)}'
    if isinstance(value, dict):
        return f'словарь с {len(value)} ключами'
    return type(value).__name__

def finish(success, passed, cases=None):
    print(json.dumps({
        'passed': passed,
        'total': TOTAL,
        'cases': cases or [],
    }, ensure_ascii=False))
    sys.exit(0 if success else 1)

def failed_case(name, message):
    return {'name': name, 'passed': False, 'message': message}

user_fn = USER_NS.get(ENTRY_POINT)
generate_case = GEN_NS.get('generate_case')

if user_fn is None:
    finish(False, 0, [
        failed_case('Проверка функции', f'В решении должна быть функция {ENTRY_POINT}(...). Сейчас она не найдена.')
    ])
if generate_case is None or TOTAL == 0:
    finish(False, 0, [
        failed_case('Настройка проверки', 'Проверка задачи временно настроена неверно. Мы уже знаем, где чинить.')
    ])

def normalize(value, depth=0):
    if hasattr(value, 'next'):
        result = []
        seen = 0
        while value is not None and seen < 10000:
            result.append(getattr(value, 'val', None))
            value = getattr(value, 'next', None)
            seen += 1
        return result
    if hasattr(value, 'left') or hasattr(value, 'right'):
        return [
            getattr(value, 'val', None),
            normalize(getattr(value, 'left', None), depth + 1),
            normalize(getattr(value, 'right', None), depth + 1),
        ]
    if isinstance(value, (list, tuple)):
        items = [normalize(item, depth + 1) for item in value]
        if RESULT_ORDER_INSENSITIVE and depth == 0:
            try:
                return sorted(items, key=repr)
            except TypeError:
                return items
        return items
    if isinstance(value, dict):
        return {key: normalize(value[key], depth + 1) for key in value}
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

for index, case in enumerate(CASES):
    case_name = case['name']
    if index < len(FIXED_CASES):
        args = tuple(FIXED_CASES[index])
    else:
        random.seed(case['seed'])
        args = generate_case()
    if not isinstance(args, tuple):
        args = (args,)
    user_args = copy.deepcopy(args)

    try:
        actual = run_callable(user_fn, user_args)
    except Exception as exc:
        details = traceback.format_exc(limit=4).strip()
        finish(False, index, [
            failed_case(case_name, 'Решение упало на тесте. '
                f'Вход: {input_repr(args)}. '
                f'Ошибка Python: {exc}. '
                f'Traceback: {details}')
        ])

    normalized_actual = normalize(actual)
    normalized_expected = normalize(case['expected'])
    if normalized_actual != normalized_expected:
        finish(False, index, [
            failed_case(
                case_name,
                'Ответ отличается от эталона. '
                f'Вход: {input_repr(args)}. '
                f'Ожидаемый формат: {shape_repr(normalized_expected)}, '
                f'получено: {shape_repr(normalized_actual)}. '
                f'Ваш результат: {short_repr(normalized_actual)}'
            )
        ])

finish(True, TOTAL)
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
 * SQL challenges store their test fixture as JSON in `tests`. `cases` is a fixed
 * bank of (seed SQL, expected rows) pairs computed once, offline, by the author's
 * solution.sql — no reference query runs here. Each case seeds its own isolated
 * in-memory schema, runs the user's query, and compares the row set against the
 * pre-computed `expected`. Stops at the first failing case and prints a
 * CodeRunTestSummary-shaped JSON line (`{passed, total, cases}`), matching the
 * Python/Go harnesses so the client renders the same "passed X of N" progress UI.
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
CASES = TESTS.get('cases') or []
TOTAL = len(CASES)

def finish(success, passed, cases=None):
    print(json.dumps({
        'passed': passed,
        'total': TOTAL,
        'cases': cases or [],
    }, ensure_ascii=False))
    sys.exit(0 if success else 1)

def failed_case(name, message):
    return {'name': name, 'passed': False, 'message': message}

def short_repr(value):
    text = repr(value)
    return text if len(text) <= 220 else text[:217] + '...'

def shape_repr(value):
    if isinstance(value, list):
        return f'{len(value)} строк'
    if isinstance(value, dict):
        return f'строка с {len(value)} колонками'
    return type(value).__name__

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
        rows = []

    if EXPECTED_TYPE == 'state' and EXPECTED_QUERY:
        cur.execute(EXPECTED_QUERY)
        return [dict(row) for row in cur.fetchall()]
    return rows

if TOTAL == 0:
    finish(False, 0, [
        failed_case('Настройка проверки', 'Проверка задачи временно настроена неверно. Мы уже знаем, где чинить.')
    ])

for index, case in enumerate(CASES):
    case_name = case['name']
    try:
        actual_rows = run_query(case.get('seed'), USER_SQL)
    except Exception as exc:
        finish(False, index, [
            failed_case(case_name, f'SQL_ERROR: {exc}')
        ])

    expected_rows = case['expected']
    if not rows_match(actual_rows, expected_rows):
        finish(False, index, [
            failed_case(
                case_name,
                'Результат запроса отличается от эталона. '
                f'Ожидаемый формат: {shape_repr(expected_rows)}, '
                f'получено: {shape_repr(actual_rows)}. '
                f'Ваш результат: {short_repr(actual_rows)}'
            )
        ])

finish(True, TOTAL)
`;
}

function trimOutput(output = '') {
  if (Buffer.byteLength(output, 'utf8') <= MAX_OUTPUT_BYTES) {
    return output;
  }

  return `${Buffer.from(output).subarray(0, MAX_OUTPUT_BYTES).toString('utf8')}\n...output truncated...`;
}

function stripAnsi(output = '') {
  return output.replace(/\x1b\[[0-9;]*m/g, '');
}

function buildGoProgram(userCode: string) {
  const normalizedCode = userCode.replace(/^\uFEFF/, '').trimStart();

  if (/^package\s+\w+/m.test(normalizedCode)) {
    return normalizedCode;
  }

  return `package main\n\n${normalizedCode}`;
}

function formatGoFailure(stdout: string, stderr: string, exitCode: number | null) {
  const combinedOutput = stripAnsi(trimOutput([stderr, stdout].filter(Boolean).join('\n'))).trim();

  if (!combinedOutput) {
    return [
      'Go-код не скомпилировался.',
      'Компилятор не вернул подробный текст ошибки. Проверьте, что в решении есть нужная функция, скобки закрыты, а типы аргументов и результата совпадают с условием.',
      `Код завершения: ${exitCode ?? 'unknown'}.`,
    ].join('\n');
  }

  if (combinedOutput.includes('redeclared in this block')) {
    return [
      'Go-код не скомпилировался: функция объявлена больше одного раза.',
      'Оставьте в редакторе один вариант решения и запустите проверку снова.',
      '',
      combinedOutput,
    ].join('\n');
  }

  if (combinedOutput.includes("expected 'package', found")) {
    return [
      'Go-код не скомпилировался: файл должен начинаться с package main.',
      'Можно оставить только функцию решения — сервер сам добавит package main.',
      '',
      combinedOutput,
    ].join('\n');
  }

  const compileMessages = combinedOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /(?:^|\s)(?:\.\/)?[\w.-]+\.go:\d+:\d+:\s+.+/.test(line));

  if (compileMessages.length > 0) {
    return [
      'Go-код не скомпилировался. Компилятор нашёл такие ошибки:',
      ...compileMessages.slice(0, 8),
    ].join('\n');
  }

  if (
    combinedOutput.includes('[setup failed]') ||
    combinedOutput.includes('build failed') ||
    combinedOutput.includes('FAIL')
  ) {
    return [
      'Go-код не скомпилировался или тестовый пакет не собрался.',
      'Ниже сырой вывод Go, по нему обычно видно строку и причину ошибки:',
      '',
      combinedOutput,
    ].join('\n');
  }

  const failedTestName = /--- FAIL:\s+([^\s(]+)/.exec(combinedOutput)?.[1];
  const testMessage = combinedOutput
    .split('\n')
    .map((line) => line.trim())
    .map((line) => /(?:^|\s)[\w-]+_test\.go:\d+:\s+(.+)$/.exec(line)?.[1])
    .find(Boolean);

  if (testMessage) {
    return failedTestName ? `Тест ${failedTestName}: ${testMessage}` : testMessage;
  }

  return combinedOutput;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown runner error';
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
      '--init',
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
      '--init',
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
  await writeFile(path.join(jobDir, goRuntime.fileName), buildGoProgram(job.payload.code));
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
        error: `ТАЙМАУТ: код не завершился за ${timeoutSeconds} секунд. Частая причина — цикл, в котором границы, индексы или счётчики не меняются. Проверьте, что на каждой итерации цикл приближается к завершению.`,
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
          formatGoFailure(result.stdout, result.stderr, result.exitCode),
        output: testSummary ? '' : '',
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

  const pythonClosedTests =
    job.payload.language === 'python' ? parsePythonClosedTests(job.payload.tests) : null;
  const fullCode =
    job.payload.language === 'sql'
      ? buildSqlProgram(job.payload.code, job.payload.tests)
      : pythonClosedTests
        ? buildPythonClosedTestProgram(job.payload.code, pythonClosedTests)
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
        error: `ТАЙМАУТ: код не завершился за ${timeoutSeconds} секунд. Частая причина — цикл, в котором границы, индексы или счётчики не меняются. Проверьте, что на каждой итерации цикл приближается к завершению.`,
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
