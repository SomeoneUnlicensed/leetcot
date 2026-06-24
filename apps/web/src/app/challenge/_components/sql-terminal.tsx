'use client';

import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Confetti } from '~/components/confetti';
import { saveSubmission } from '../[slug]/submissions/[[...catchAll]]/save-submission.action';
import type { ChallengeRouteData } from '../[slug]/getChallengeRouteData';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface SqlTerminalProps {
  challenge: ChallengeRouteData['challenge'];
  nextChallengeSlug?: string;
  trackSlug?: string;
}

interface QueryResult {
  query: string;
  success: boolean;
  columns?: string[];
  values?: unknown[][];
  error?: string;
  affectedRows?: number;
}

interface SqliteDatabase {
  run: (sql: string) => void;
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
  getRowsModified: () => number;
  close: () => void;
}

interface SqlTestConfig {
  expected?: Record<string, unknown>[];
  expectedQuery?: string;
  expectedType?: 'select' | 'state';
  schema?: string;
  seed?: string;
}

const TIMER_START_DELAY_SECONDS = 10;

export function SqlTerminal({ challenge, nextChallengeSlug, trackSlug }: SqlTerminalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryResult[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(120);
  const [warmupLeft, setWarmupLeft] = useState(TIMER_START_DELAY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Cats states: 'error' | 'idle' | 'success' | 'typing'
  const [catState, setCatState] = useState<'error' | 'idle' | 'success' | 'typing'>('idle');

  const dbRef = useRef<SqliteDatabase | null>(null);
  const sqlModuleRef = useRef<SqlJsStatic | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isSuccessRef = useRef(isSuccess);
  isSuccessRef.current = isSuccess;

  const testConfig = useMemo<SqlTestConfig>(() => {
    try {
      return JSON.parse(challenge.tests) as SqlTestConfig;
    } catch (err) {
      console.error('Failed to parse challenge tests config:', err);
      return {};
    }
  }, [challenge.tests]);

  const timeLimit = testConfig.expectedType === 'state' ? 120 : 90;

  // Timer — gives a short reading/setup grace period, then starts the task countdown.
  useEffect(() => {
    setTimeLeft(timeLimit);
    setWarmupLeft(TIMER_START_DELAY_SECONDS);
    setIsExpired(false);
    setIsSuccess(false);
    setCatState('idle');

    const timer = setInterval(() => {
      if (isSuccessRef.current) {
        clearInterval(timer);
        return;
      }

      let isWarmupTick = false;
      setWarmupLeft((prev) => {
        if (prev > 0) {
          isWarmupTick = true;
          return prev - 1;
        }
        return prev;
      });

      if (isWarmupTick) {
        return;
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          setCatState('error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge.slug, timeLimit]);

  // Load SQL.js WASM
  useEffect(() => {
    let cancelled = false;

    const loadSqlJs = async () => {
      try {
        setIsLoaded(false);
        setInitError(null);
        dbRef.current?.close();

        const SQL = await initSqlJs({
          locateFile: () => '/sql-wasm.wasm',
        });

        if (cancelled) {
          return;
        }

        sqlModuleRef.current = SQL;
        const db = new SQL.Database() as SqliteDatabase;

        if (testConfig.schema) db.run(testConfig.schema);
        if (testConfig.seed) db.run(testConfig.seed);

        dbRef.current = db;
        setIsLoaded(true);
      } catch (err: unknown) {
        console.error(err);
        setInitError(
          err instanceof Error ? err.message : 'Не удалось загрузить локальный SQLite WASM',
        );
      }
    };

    void loadSqlJs();

    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, [challenge.slug, testConfig.schema, testConfig.seed]);

  // Scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Reset database state
  const handleReset = () => {
    const SQL = sqlModuleRef.current;

    if (!SQL) return;

    try {
      dbRef.current?.close();
      const db = new SQL.Database() as SqliteDatabase;

      if (testConfig.schema) db.run(testConfig.schema);
      if (testConfig.seed) db.run(testConfig.seed);

      dbRef.current = db;
      setHistory([]);
      setInputVal('');
      setTimeLeft(timeLimit);
      setWarmupLeft(TIMER_START_DELAY_SECONDS);
      setIsExpired(false);
      setIsSuccess(false);
      setCatState('idle');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Run user query
  const executeQuery = (query: string) => {
    if (!dbRef.current || isExpired || isSuccess) return;

    const cleanSql = query.trim().endsWith(';') ? query.trim().slice(0, -1) : query.trim();
    if (!cleanSql) return;

    setCommandHistory((prev) => [query, ...prev]);
    setHistoryIndex(-1);

    try {
      const isSelect = cleanSql.toUpperCase().startsWith('SELECT');

      if (isSelect) {
        const res = dbRef.current.exec(cleanSql);
        const firstRes = res[0];
        if (!firstRes) {
          setHistory((prev) => [...prev, { query, success: true, columns: [], values: [] }]);
        } else {
          setHistory((prev) => [
            ...prev,
            { query, success: true, columns: firstRes.columns, values: firstRes.values },
          ]);
        }
      } else {
        dbRef.current.run(cleanSql);
        const affected = dbRef.current.getRowsModified();
        setHistory((prev) => [...prev, { query, success: true, affectedRows: affected }]);
      }
      setCatState('idle');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Неизвестная ошибка SQL';
      setHistory((prev) => [...prev, { query, success: false, error: errMsg }]);
      setCatState('error');
    }
  };

  // Compare database query outputs
  const compareData = (
    actual: Record<string, unknown>[],
    expected: Record<string, unknown>[],
  ): boolean => {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      const actKeys = Object.keys(actual[i] || {});
      const expKeys = Object.keys(expected[i] || {});
      if (actKeys.length !== expKeys.length) return false;
      for (const key of expKeys) {
        const actVal = actual[i]?.[key];
        const expVal = expected[i]?.[key];
        if (typeof actVal === 'string' && typeof expVal === 'string') {
          if (actVal.toLowerCase() !== expVal.toLowerCase()) return false;
        } else if (Number.isFinite(Number(actVal)) && Number.isFinite(Number(expVal))) {
          if (Math.abs(Number(actVal) - Number(expVal)) > 0.001) return false;
        } else if (String(actVal) !== String(expVal)) {
          return false;
        }
      }
    }
    return true;
  };

  // Check Solution
  const handleCheck = async () => {
    if (!dbRef.current || isExpired || isSuccess || isChecking) return;
    setIsChecking(true);
    setCatState('typing');

    try {
      let isCorrect = false;
      const lastRun = history[history.length - 1];

      if (testConfig.expectedType === 'select') {
        if (lastRun && lastRun.success && lastRun.columns && lastRun.values) {
          const actualRows = lastRun.values.map((row) => {
            const obj: Record<string, unknown> = {};
            lastRun.columns!.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            return obj;
          });
          isCorrect = compareData(actualRows, testConfig.expected || []);
        }
      } else if (testConfig.expectedType === 'state' && testConfig.expectedQuery && dbRef.current) {
        const res = dbRef.current.exec(testConfig.expectedQuery);
        const firstRes = res[0];
        if (firstRes) {
          const actualRows = firstRes.values.map((row: unknown[]) => {
            const obj: Record<string, unknown> = {};
            firstRes.columns.forEach((col: string, idx: number) => {
              obj[col] = row[idx];
            });
            return obj;
          });
          isCorrect = compareData(actualRows, testConfig.expected || []);
        }
      }

      const lastCode = lastRun ? lastRun.query : '-- Проверка без выполненных команд';
      await saveSubmission({
        challenge,
        code: lastCode,
        isSuccessful: isCorrect,
      });

      if (isCorrect) {
        setIsSuccess(true);
        isSuccessRef.current = true;
        setShowConfetti(true);
        setCatState('success');
        queryClient.invalidateQueries({
          queryKey: ['challenge-solutions', challenge.slug],
        });
      } else {
        setCatState('error');
        setHistory((prev) => [
          ...prev,
          {
            query: '.check',
            success: false,
            error: 'Данные в таблицах не соответствуют ожидаемому результату. Попробуйте ещё раз!',
          },
        ]);
      }
    } catch (err: unknown) {
      console.error(err);
      setCatState('error');
      const errMsg = err instanceof Error ? err.message : 'Ошибка валидации решения';
      setHistory((prev) => [...prev, { query: '.check', success: false, error: errMsg }]);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = inputVal.trim();
      setInputVal('');
      if (!val) return;

      if (val.toLowerCase() === '.reset') {
        handleReset();
      } else if (val.toLowerCase() === '.check') {
        void handleCheck();
      } else if (val.toLowerCase() === '.schema') {
        showSchema();
      } else {
        executeQuery(val);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx] ?? '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx] ?? '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const showSchema = () => {
    if (!dbRef.current) return;
    try {
      const res = dbRef.current.exec(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      );
      const firstRes = res[0];
      if (firstRes) {
        const schemas = firstRes.values.map((v: unknown[]) => `${String(v[0])};`).join('\n\n');
        setHistory((prev) => [
          ...prev,
          { query: '.schema', success: true, columns: ['schema'], values: [[schemas]] },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            query: '.schema',
            success: true,
            columns: ['schema'],
            values: [['(Таблиц не найдено)']],
          },
        ]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Ошибка схемы';
      setHistory((prev) => [...prev, { query: '.schema', success: false, error: errMsg }]);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarmup = warmupLeft > 0 && !isExpired && !isSuccess;

  // Cat ASCII Art — styled to match platform tone
  const renderCat = () => {
    if (catState === 'success') {
      return (
        <pre className="select-none font-mono text-xs leading-tight text-emerald-400">
          {`   /\\_/\\
  ( ^.^ )  Верно! Задача решена!
   > ~ <`}
        </pre>
      );
    }
    if (catState === 'error') {
      return (
        <pre className="animate-pulse select-none font-mono text-xs leading-tight text-rose-400">
          {`   /\\_/\\
  ( >.< )  Что-то пошло не так...
   > u <   Попробуй ещё раз!`}
        </pre>
      );
    }
    if (catState === 'typing') {
      return (
        <pre className="select-none font-mono text-xs leading-tight text-amber-400">
          {`   /\\_/\\
  ( o.o )  Проверяю запрос...
   > @ <`}
        </pre>
      );
    }
    return (
      <pre className="select-none font-mono text-xs leading-tight text-zinc-500">
        {`   /\\_/\\
  ( o.o )  Жду твой SQL-запрос!
   > ^ <`}
      </pre>
    );
  };

  if (initError) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <p className="mb-4 font-sans text-sm font-bold text-rose-500">
          Ошибка загрузки SQL-тренажера: {initError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-zinc-800 px-4 py-2 font-sans text-sm text-white transition hover:bg-zinc-700"
        >
          Перезагрузить страницу
        </button>
      </div>
    );
  }

  const timerUrgent = !isWarmup && !isExpired && timeLeft < 20;
  const timerColor = isExpired
    ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
    : isWarmup
      ? 'bg-sky-950/40 border-sky-700/60 text-sky-300'
      : timerUrgent
        ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 animate-pulse'
        : 'bg-zinc-900 border-zinc-700/60 text-zinc-400';

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_34%),#09090b] font-sans text-zinc-300 shadow-2xl shadow-black/30">
      {showConfetti ? <Confetti /> : null}

      {/* Terminal Header */}
      <div className="flex shrink-0 select-none items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              sqlite
            </span>
          </div>
          <div className="truncate text-sm font-semibold text-zinc-100">{challenge.name}</div>
          <div className="mt-0.5 text-xs text-zinc-500">Локальная база в браузере</div>
        </div>

        {/* Timer */}
        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold tabular-nums transition-all ${timerColor}`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {isExpired
            ? 'ВРЕМЯ ВЫШЛО'
            : isWarmup
              ? `СТАРТ ${warmupLeft}С`
              : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        </div>
      </div>

      {/* Warning Notice */}
      <div className="shrink-0 border-b border-zinc-800/80 bg-zinc-900/45 px-4 py-2 font-sans text-xs leading-relaxed text-zinc-400">
        {isWarmup ? (
          <span className="text-sky-300">
            Таймер стартует через {warmupLeft} секунд. Можно спокойно прочитать схему и подготовить
            запрос.
          </span>
        ) : (
          <>
            Данные живут только в этой вкладке. Команды{' '}
            <span className="font-mono text-emerald-300">.schema</span>,{' '}
            <span className="font-mono text-emerald-300">.check</span> и{' '}
            <span className="font-mono text-emerald-300">.reset</span> помогут не потеряться.
          </>
        )}
      </div>

      {/* Terminal Body */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
        {/* Welcome */}
        {!isLoaded ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-sans">Инициализация SQLite WASM движка...</span>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/35 px-3 py-2 font-sans text-xs leading-relaxed text-zinc-500">
            <span className="text-emerald-300">sqlite3 подключён.</span> Команды:{' '}
            <span className="font-mono text-zinc-300">.schema</span>
            {', '}
            <span className="font-mono text-zinc-300">.check</span>
            {', '}
            <span className="font-mono text-zinc-300">.reset</span>
          </div>
        )}

        {/* History */}
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="shrink-0 select-none pt-0.5 font-mono text-xs text-emerald-500">
                sql&gt;
              </span>
              <span className="break-all font-mono text-[13px] leading-6 text-zinc-100">
                {item.query}
              </span>
            </div>

            {item.success ? (
              item.columns && item.values ? (
                item.values.length === 0 ? (
                  <div className="pl-6 font-sans text-xs italic text-zinc-600">
                    (Пустой результат)
                  </div>
                ) : (
                  <div className="max-w-full overflow-x-auto pl-6">
                    <table className="border-separate border-spacing-0 overflow-hidden rounded-lg text-left text-xs">
                      <thead>
                        <tr>
                          {item.columns.map((col, cIdx) => (
                            <th
                              key={cIdx}
                              className="border-b border-r border-zinc-800 bg-zinc-900 px-3 py-2 font-mono font-semibold text-zinc-400 first:rounded-tl-lg first:border-l last:rounded-tr-lg"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.values.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? '' : 'bg-zinc-900/30'}>
                            {row.map((val, vIdx) => (
                              <td
                                key={vIdx}
                                className="border-b border-r border-zinc-800/70 px-3 py-1.5 font-mono text-zinc-300 first:border-l"
                              >
                                {val === null ? (
                                  <span className="font-sans italic text-zinc-600">NULL</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-1 font-sans text-xs text-zinc-600">
                      {item.values.length} строк
                    </div>
                  </div>
                )
              ) : (
                <div className="pl-6 font-sans text-xs text-emerald-600">
                  ✓ Выполнено. Строк затронуто: {item.affectedRows ?? 0}
                </div>
              )
            ) : (
              <div className="whitespace-pre-wrap pl-6 font-sans text-xs leading-relaxed text-rose-500">
                ✗ {item.error}
              </div>
            )}
          </div>
        ))}

        <div ref={terminalEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/90">
        {/* Prompt line */}
        <div className="flex items-center gap-2 border-b border-zinc-800/70 bg-black/20 px-4 py-3">
          <span className="shrink-0 select-none font-mono text-sm font-bold text-emerald-400">
            sql&gt;
          </span>
          {!isLoaded ? (
            <span className="font-sans text-sm italic text-zinc-600">Загрузка движка...</span>
          ) : isExpired ? (
            <span className="font-sans text-sm italic text-rose-500/70">
              Время вышло. Используйте «Сбросить БД» для повтора.
            </span>
          ) : isSuccess ? (
            <span className="font-sans text-sm italic text-emerald-500/80">
              Задача выполнена. Можно идти дальше.
            </span>
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 border-none bg-transparent p-0 font-mono text-[13px] leading-6 text-emerald-50 caret-emerald-300 outline-none placeholder:font-mono placeholder:text-zinc-700 focus:ring-0"
              placeholder="SELECT name FROM cats WHERE fish_count > 3;"
              autoFocus
              spellCheck={false}
            />
          )}
        </div>

        {/* Cat + Buttons row */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Cat */}
          <div className="shrink-0">{renderCat()}</div>

          {/* Action Buttons */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={showSchema}
              disabled={!isLoaded || isExpired || isSuccess}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/60 px-3 py-1.5 font-sans text-xs font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Схема
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/60 px-3 py-1.5 font-sans text-xs font-medium text-zinc-400 transition-all hover:border-rose-800/60 hover:bg-rose-950/20 hover:text-rose-400"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Сбросить
            </button>

            <button
              onClick={() => void handleCheck()}
              disabled={!isLoaded || isExpired || isSuccess || isChecking}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 font-sans text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isChecking ? (
                <>
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Проверка...
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Проверить
                </>
              )}
            </button>

            {isSuccess && nextChallengeSlug ? (
              <button
                onClick={() => {
                  const query = trackSlug ? `?slug=${trackSlug}` : '';
                  router.push(`/challenge/${nextChallengeSlug}${query}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 font-sans text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
              >
                Следующая задача
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
