import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Code, Play, Sparkles } from '@repo/ui/icons';
import { Button } from '@repo/ui/components/button';
import { Footsies } from '~/components/footsies';
import { MemeCat } from '~/components/meme-cat';

export const metadata: Metadata = {
  title: 'SQL-рыбалка | ЛитКот',
  description: 'SQL-тренажер ЛитКота: SELECT, JOIN, группировки и изменения данных на задачах.',
};

const rows = [
  ['Барсик', 'лосось', '16'],
  ['Васька', 'тунец', '10'],
  ['Мурзик', 'карась', '8'],
];

const lessons = [
  ['01', 'SELECT', 'достать нужные строки'],
  ['02', 'WHERE', 'отфильтровать лишнее'],
  ['03', 'JOIN', 'связать таблицы'],
  ['04', 'GROUP BY', 'посчитать улов'],
  ['05', 'INSERT', 'добавить записи'],
  ['06', 'UPDATE', 'исправить данные'],
  ['07', 'DELETE', 'убрать лишнее'],
  ['08', 'Окна', 'сравнить соседние строки'],
];

const SQL_CHALLENGE_COUNT = 45;

function SqlConsole() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#070707] shadow-2xl shadow-emerald-950/20">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">
          литкот sql
        </span>
      </div>

      <div className="space-y-4 p-4 font-mono text-sm">
        <div className="rounded-xl border border-zinc-800 bg-black p-4 leading-7">
          <span className="text-emerald-300">sql&gt;</span>{' '}
          <span className="break-words text-zinc-100">
            SELECT name, SUM(amount) AS total FROM orders GROUP BY name;
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full min-w-[320px] border-collapse text-left">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="border-r border-zinc-800 px-4 py-3 font-medium">name</th>
                <th className="px-4 py-3 font-medium">total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, , total]) => (
                <tr key={name} className="border-t border-zinc-900 text-zinc-200">
                  <td className="border-r border-zinc-900 px-4 py-3">{name}</td>
                  <td className="px-4 py-3">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">
          .check: решение принято
        </div>
      </div>
    </div>
  );
}

function PixelCat() {
  return (
    <pre
      aria-hidden="true"
      className="select-none font-mono text-[10px] font-black leading-[10px] text-emerald-300/80"
    >
      {`/\\_/\\\\
( o.o )
 > ^ <`}
    </pre>
  );
}

export default function SqlFishingPage() {
  return (
    <>
      <main className="overflow-hidden bg-[#0b0b0c] text-white">
        <section className="border-b border-zinc-900">
          <div className="container relative grid min-h-[calc(100vh-56px)] gap-10 py-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,0.82fr)] lg:items-center">
            <div className="absolute right-6 top-8 hidden flex-col items-end gap-2 md:flex">
              <PixelCat />
              <MemeCat mood="happy" size={64} className="opacity-80 transition-opacity hover:opacity-100" />
            </div>

            <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-200">
                <Code className="h-4 w-4" />
                SQL-тренажер в браузере
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-zinc-50 md:text-6xl xl:text-7xl">
                SQL-рыбалка без лишней воды
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-zinc-400">
                Короткий курс про таблицы, фильтры, JOIN и группировки. Пишешь запрос, сразу
                видишь результат и переходишь к следующей задаче.
              </p>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  [String(SQL_CHALLENGE_COUNT), 'SQL-задач'],
                  ['8', 'тем курса'],
                  ['0', 'установок'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="font-mono text-2xl font-black text-emerald-300">{value}</div>
                    <div className="mt-1 text-sm text-zinc-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-xl bg-emerald-400 px-5 text-base font-black text-zinc-950 hover:bg-emerald-300"
                >
                  <Link href="/courses/sql-cat-tables">
                    <Play className="mr-2 h-4 w-4" />
                    Открыть курс
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl border-zinc-700 bg-zinc-950 px-5 text-base font-bold text-zinc-100 hover:bg-zinc-900"
                >
                  <Link href="/challenge/sql-cat-intro?slug=sql-cat-fishing">
                    Первая задача
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="min-w-0 lg:pl-2">
              <SqlConsole />
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 py-16">
          <div className="container grid gap-8 lg:grid-cols-[0.45fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Маршрут
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                Учишься маленькими партиями
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-500">
                Каждая тема заканчивается практикой: не читаешь стену теории, а сразу проверяешь
                запрос на живой таблице.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {lessons.map(([num, title, text]) => (
                <div
                  key={title}
                  className="group rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-emerald-400/40 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-mono text-xs font-black text-zinc-600">{num}</div>
                    <div className="h-2 w-2 rounded-full bg-zinc-700 transition group-hover:bg-emerald-300" />
                  </div>
                  <div className="mt-5 font-mono text-xl font-black text-emerald-300">{title}</div>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container grid gap-4 md:grid-cols-3">
            {[
              ['1', 'Открываешь задачу', 'Видишь схему таблиц и ожидаемый результат.'],
              ['2', 'Пишешь запрос', 'Редактор запускает SQLite прямо в браузере.'],
              ['3', 'Забираешь прогресс', 'Решенные задачи попадают в курс и профиль.'],
            ].map(([num, title, text]) => (
              <div key={num} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-300 font-black text-zinc-950">
                  {num}
                </div>
                <h3 className="text-lg font-black text-zinc-100">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footsies />
    </>
  );
}
