'use client';

import { useAltchaPayload } from '@repo/monaco/altcha';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const PYTHON_TEMPLATE = `# Напишите решение задачи на Python
# Пример: подсчёт чётных чисел
n = int(input())
count = 0
for i in range(n):
    x = int(input())
    if x % 2 == 0:
        count += 1
print(count)
`;

export function CodeRunnerPage() {
  const [code, setCode] = useState(PYTHON_TEMPLATE);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const getPayload = useAltchaPayload();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const pollResult = useCallback(async (id: string) => {
    const res = await fetch(`/api/oge/run-code?jobId=${id}`);
    const data = await res.json();
    if (data.status === 'COMPLETED' || data.status === 'FAILED') {
      setIsRunning(false);
      setJobId(null);
      if (pollRef.current) clearInterval(pollRef.current);

      if (data.result) {
        const outputText = data.result.output || 'Программа выполнена (вывод отсутствует)';
        setOutput(`> Статус: ${data.status === 'COMPLETED' ? '✅ Успешно' : '❌ Ошибка'}\n${data.result.error ? `\nОшибка:\n${data.result.error}\n` : ''}\n${outputText}`);
      } else {
        setOutput('Нет результата от сервера проверки.');
      }
    }
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('⏳ Отправка кода на выполнение...');

    try {
      const captcha = await getPayload();

      const res = await fetch('/api/oge/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          captcha,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setOutput(`❌ Ошибка: ${data.error}`);
        setIsRunning(false);
        return;
      }

      setJobId(data.jobId);
      setOutput('⏳ Код выполняется...');

      // Начинаем опрос результата
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => pollResult(data.jobId), 1000);
    } catch {
      setOutput('❌ Ошибка соединения с сервером.');
      setIsRunning(false);
    }
  }, [code, getPayload, pollResult]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="container py-8">
      <Link
        href="/oge/modules/oge-2027-algo-prog"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
      >
        ← К модулю
      </Link>

      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8]">
            Задание 16 · Python
          </div>
          <h1
            className="mt-3 text-2xl leading-tight md:text-3xl"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            Тренажёр программирования на Python
          </h1>
          <p className="mt-3 max-w-2xl font-semibold leading-7 text-[#d8d4df]/65">
            Пишите код на Python, запускайте на сервере и смотрите результат.
            Используйте для подготовки к заданию 16 КИМ ОГЭ по информатике.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Редактор */}
          <div>
            <textarea
              className="h-[400px] w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-green-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
            <button
              onClick={runCode}
              disabled={isRunning || !code.trim()}
              className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRunning ? '⏳ Выполнение...' : '▶ Запустить'}
            </button>
          </div>

          {/* Вывод */}
          <div>
            <h2 className="mb-3 text-sm font-bold text-[#8ef0de]">Вывод программы</h2>
            <pre className="h-[400px] overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-zinc-300">
              {output || 'Нажмите «Запустить», чтобы выполнить код.'}
            </pre>

            {/* Быстрые шаблоны */}
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-[#d8d4df]/50">Быстрые шаблоны:</h3>
              <div className="flex flex-wrap gap-1">
                {['Подсчёт чётных', 'Сумма кратных 5', 'Минимум', 'Трёхзначные'].map(
                  (name) => (
                    <button
                      key={name}
                      className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700"
                      onClick={() => {
                        const templates: Record<string, string> = {
                          'Подсчёт чётных': `n = int(input())\ncount = 0\nfor i in range(n):\n    x = int(input())\n    if x % 2 == 0:\n        count += 1\nprint(count)`,
                          'Сумма кратных 5': `n = int(input())\ntotal = 0\nfor i in range(n):\n    x = int(input())\n    if x % 5 == 0:\n        total += x\nprint(total)`,
                          'Минимум': `n = int(input())\nmn = 10**9 + 1\nfor i in range(n):\n    x = int(input())\n    if x < mn:\n        mn = x\nprint(mn)`,
                          'Трёхзначные': `n = int(input())\ncount = 0\nfor i in range(n):\n    x = int(input())\n    if 100 <= x <= 999:\n        count += 1\nprint(count)`,
                        };
                        setCode(templates[name] ?? code);
                      }}
                    >
                      {name}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
