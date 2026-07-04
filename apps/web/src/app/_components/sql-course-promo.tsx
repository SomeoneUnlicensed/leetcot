import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, BookOpen, CheckCircle2, Sparkles } from '@repo/ui/icons';
import Link from 'next/link';

const sqlTopics = ['SELECT', 'JOIN', 'GROUP BY', 'INSERT', 'UPDATE', 'DELETE'];

export function SqlCoursePromo() {
  return (
    <section className="border-b border-zinc-100 bg-white py-16 dark:border-zinc-900 dark:bg-zinc-950">
      <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <BookOpen className="h-4 w-4" />
            SQL-рыбалка
          </div>
          <h2 className="max-w-2xl text-3xl font-black tracking-normal text-zinc-950 sm:text-5xl dark:text-white">
            SQL учится легче, когда таблицы не пугают
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
            Курс ведёт от простых запросов к уверенной работе с данными. Без отдельной установки и
            без ощущения, что вы попали в чужую админку: только понятные задания, проверка и кошачьи
            сюжеты.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500">
              <Link href="/courses/sql-cat-tables">
                Начать SQL-рыбалку
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
            >
              <Link href="/challenge/sql-cat-intro?slug=sql-cat-fishing">Посмотреть вводную</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 hidden rounded-full bg-pink-100 px-4 py-2 text-sm font-black text-pink-700 lg:block dark:bg-pink-950/50 dark:text-pink-200">
            кот одобряет
          </div>
          <div className="rounded-[2rem] border border-zinc-200 bg-[#fbfaf8] p-5 dark:border-zinc-800 dark:bg-black">
            <div className="grid gap-3 sm:grid-cols-2">
              {sqlTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800"
                >
                  <span className="font-black text-zinc-950 dark:text-white">{topic}</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-zinc-950 p-5 text-white dark:bg-white dark:text-zinc-950">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-emerald-400 dark:text-emerald-600" />
                <p className="text-sm leading-6 text-zinc-300 dark:text-zinc-600">
                  Каждая тема превращается в небольшую практику: прочитал условие, решил задачу,
                  получил результат и пошёл дальше по маршруту.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
