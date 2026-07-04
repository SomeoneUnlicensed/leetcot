import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, BookOpen, Compass, Play } from '@repo/ui/icons';
import Link from 'next/link';
import { auth } from '~/server/auth';

function CatWhisper({ className }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={`pointer-events-none select-none text-xs font-black leading-3 text-[#9fd8d2]/50 ${className ?? ''}`}
    >{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
  );
}

export async function Hero() {
  const session = await auth();

  return (
    <section className="relative overflow-hidden bg-[#18151f] px-4 pb-28 pt-32 text-white sm:pb-32 sm:pt-40">
      <div className="bg-[#f38b7f]/18 absolute right-0 top-24 h-80 w-[42%] rounded-l-full blur-3xl" />
      <div className="bg-[#9fd8d2]/16 absolute bottom-24 right-[18%] h-72 w-72 rounded-full blur-3xl" />
      <CatWhisper className="absolute right-[12%] top-36 hidden rotate-6 text-[#f3c4a8]/55 lg:block" />
      <CatWhisper className="absolute bottom-48 right-[24%] hidden -rotate-12 text-[#9fd8d2]/45 opacity-70 xl:block" />
      <div className="container relative grid min-h-[760px] items-center">
        <div className="max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f3c4a8]/30 bg-[#f3c4a8]/10 px-4 py-2 text-sm font-black text-[#f7d8c8]">
            <BookOpen className="h-4 w-4 text-[#9fd8d2]" />
            мяу-практика программирования
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal sm:text-7xl lg:text-8xl">
            Задачи, треки и курсы <span className="text-[#f3c4a8]">под присмотром</span> ЛитКота
          </h1>

          <p className="mt-7 max-w-2xl text-xl font-semibold leading-8 text-zinc-300">
            ЛитКот помогает учиться регулярно: подобрать задачу, пройти тему, сравнить подходы и не
            потерять хвост прогресса.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-full bg-[#9fd8d2] px-7 text-base font-black text-[#171a22] hover:bg-[#b7e5e0]"
            >
              <Link href={session ? '/explore' : '/register'}>
                <Compass className="mr-2 h-5 w-5" />
                {session ? 'Открыть задачи' : 'Начать практику'}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/[0.04] px-7 text-base font-black text-white hover:bg-white/10"
            >
              <Link href="/algorithms">
                <Play className="mr-2 h-5 w-5" />
                Посмотреть алгоритмы
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['250+', 'задач и тем'],
              ['2', 'языка сейчас'],
              ['∞', 'кошачьего терпения'],
            ].map(([value, label]) => (
              <div key={label} className="border-t border-white/10 pt-4">
                <p className="text-3xl font-black text-[#e9f6a8]">{value}</p>
                <p className="mt-1 text-sm font-bold text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container relative mt-8">
        <div className="rounded-[2rem] border border-[#f3c4a8]/25 bg-[#2a2026] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-[#f3c4a8]">
                курс для старта
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-normal sm:text-4xl">
                SQL-рыбалка: коты, таблицы и короткая практика
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-zinc-300">
                От SELECT до группировок: каждая тема даёт маленькую задачу, проверку и повод
                поймать следующую рыбку.
              </p>
            </div>
            <Button
              asChild
              className="h-12 w-fit rounded-full bg-[#f3c4a8] px-6 text-base font-black text-[#171a22] hover:bg-[#ffd1b7]"
            >
              <Link href="/courses/sql-cat-tables">
                Открыть курс
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
