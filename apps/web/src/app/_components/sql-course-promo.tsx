import { Button } from '@repo/ui/components/button';
import { BookOpen, Play } from '@repo/ui/icons';
import Link from 'next/link';

const terminalRows = [
  ['name', 'total_fish'],
  ['Барсик', '16'],
  ['Васька', '10'],
  ['Мурзик', '8'],
];

export function SqlCoursePromo() {
  return (
    <section className="relative overflow-hidden border-y border-zinc-200 bg-zinc-950 py-16 text-white dark:border-zinc-800">
      <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
            <BookOpen className="h-4 w-4" />
            SQL-рыбалка
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            SQL-рыбалка: кот в таблицах
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-zinc-300 sm:text-lg">
            Учите SQL на живых задачах: фильтры, сортировка, JOIN, группировки, INSERT, UPDATE и
            DELETE. SQLite запускается прямо в браузере, поэтому можно экспериментировать без
            установки и риска для сервера.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            >
              <Link href="/courses/sql-cat-tables">
                <Play className="mr-2 h-4 w-4" />
                Закинуть первый SELECT
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-zinc-700 bg-zinc-900/40 text-white hover:bg-zinc-800"
            >
              <Link href="/challenge/sql-cat-intro?slug=sql-cat-fishing">Посмотреть вводную</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-black shadow-2xl shadow-emerald-950/40">
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-medium text-zinc-500">SQLite · browser sandbox</span>
          </div>
          <div className="space-y-4 p-5 font-mono text-sm">
            <div>
              <span className="text-emerald-400">sql&gt;</span>{' '}
              <span className="text-zinc-100">
                SELECT name, SUM(fish_count) AS total_fish FROM meals GROUP BY name;
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-zinc-800">
              <table className="w-full text-left text-xs">
                <tbody>
                  {terminalRows.map((row, rowIndex) => (
                    <tr key={row.join('-')} className={rowIndex === 0 ? 'bg-zinc-900' : ''}>
                      {row.map((cell) => (
                        <td
                          key={cell}
                          className="border-r border-zinc-800 px-3 py-2 last:border-r-0"
                        >
                          <span className={rowIndex === 0 ? 'text-zinc-400' : 'text-zinc-200'}>
                            {cell}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-emerald-300">.check - задача решена, можно идти дальше</div>
          </div>
        </div>
      </div>
    </section>
  );
}
