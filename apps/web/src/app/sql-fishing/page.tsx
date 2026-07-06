import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Code, Play, Sparkles } from '@repo/ui/icons';
import { Button } from '@repo/ui/components/button';
import { Footsies } from '~/components/footsies';

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
    <div className="overflow-hidden rounded-[1.75rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff4fa3]" />
          <span className="h-3 w-3 rounded-full bg-[#e9f6a8]" />
          <span className="h-3 w-3 rounded-full bg-[#8ef0de]" />
        </div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#d8d4df]/50">
          SQL-рыбалка
        </span>
      </div>

      <div className="space-y-4 p-4 font-mono text-sm">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4 leading-7">
          <span className="text-[#8ef0de]">sql&gt;</span>{' '}
          <span className="break-words text-zinc-100">
            SELECT name, SUM(amount) AS total FROM orders GROUP BY name;
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[320px] border-collapse text-left">
            <thead className="bg-white/[0.05] text-[#d8d4df]/70">
              <tr>
                <th className="border-r border-white/10 px-4 py-3 font-medium">name</th>
                <th className="px-4 py-3 font-medium">total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, , total]) => (
                <tr key={name} className="border-t border-white/10 text-zinc-200">
                  <td className="border-r border-white/10 px-4 py-3">{name}</td>
                  <td className="px-4 py-3">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-[#8ef0de]/25 bg-[#8ef0de]/10 px-4 py-3 text-[#8ef0de]">
          проверка: запрос принят
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
      <main className="overflow-hidden bg-[#121018] text-white">
        <section className="relative isolate border-b border-white/10 px-4">
          <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
          <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[30rem] w-[34rem] rounded-r-full bg-[#f59e0b]/10 blur-3xl" />

          <div className="container relative grid min-h-[calc(100svh-3.5rem)] gap-10 py-20 lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-center">
            <div className="absolute right-6 top-8 hidden md:block">
              <PixelCat />
            </div>

            <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
                <Code className="h-4 w-4" />
                SQL-практика
              </div>
              <h1
                className="max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Учитесь писать SQL на коротких задачах с таблицами
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
                Короткий курс про таблицы, фильтры, JOIN и группировки. Пишешь запрос, сразу видишь
                результат и переходишь к следующей задаче.
              </p>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  [String(SQL_CHALLENGE_COUNT), 'SQL-задач'],
                  ['8', 'тем курса'],
                  ['0', 'установок'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="font-mono text-2xl font-black text-[#8ef0de]">{value}</div>
                    <div className="mt-1 text-sm font-semibold text-[#d8d4df]/70">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-2xl bg-[#ff4fa3] px-6 text-base font-black text-white shadow-lg shadow-pink-950/30 hover:bg-[#ff75b9]"
                >
                  <Link href="/courses/sql-cat-tables">
                    <Play className="mr-2 h-4 w-4" />
                    Открыть курс
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-white/15 bg-white/[0.04] px-6 text-base font-black text-zinc-100 hover:bg-white/10"
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

        <section className="border-b border-white/10 px-4 py-16">
          <div className="container grid gap-8 lg:grid-cols-[0.45fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#8ef0de]/25 bg-[#8ef0de]/10 px-4 py-2 text-sm font-black text-[#8ef0de]">
                <Sparkles className="h-4 w-4" />
                Маршрут
              </div>
              <h2
                className="mt-5 text-3xl leading-tight md:text-5xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Учишься маленькими партиями
              </h2>
              <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-[#d8d4df]/70">
                Каждая тема заканчивается практикой: не читаешь стену теории, а сразу проверяешь
                запрос на живой таблице.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {lessons.map(([num, title, text]) => (
                <div
                  key={title}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-mono text-xs font-black text-zinc-600">{num}</div>
                    <div className="h-2 w-2 rounded-full bg-[#d8d4df]/25 transition group-hover:bg-[#8ef0de]" />
                  </div>
                  <div className="mt-5 font-mono text-xl font-black text-[#8ef0de]">{title}</div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#d8d4df]/65">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="container grid gap-4 md:grid-cols-3">
            {[
              ['1', 'Открываешь задачу', 'Видишь схему таблиц и ожидаемый результат.'],
              ['2', 'Пишешь запрос', 'Редактор запускает SQLite прямо в браузере.'],
              ['3', 'Забираешь прогресс', 'Решенные задачи попадают в курс и профиль.'],
            ].map(([num, title, text]) => (
              <div
                key={num}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5"
              >
                <div className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#8ef0de] font-black text-[#121018]">
                  {num}
                </div>
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#d8d4df]/65">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footsies />
    </>
  );
}
