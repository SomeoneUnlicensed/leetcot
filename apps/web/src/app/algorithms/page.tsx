import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, Compass, Layers, Network, Play, Zap } from '@repo/ui/icons';
import Link from 'next/link';
import { Footsies } from '~/components/footsies';

const topics = [
  ['Списки и строки', 'Разбор частых приёмов: два указателя, окна, частоты и аккуратные обходы.'],
  ['Графы', 'BFS, DFS, кратчайшие пути и задачи, где важно правильно описать состояние.'],
  ['Динамика', 'Переходы, память, базовые случаи и решения без лишней магии.'],
];

const stats = [
  ['30+', 'Python-задач'],
  ['6', 'ключевых тем'],
  ['oracle', 'быстрая проверка'],
];

export default function AlgorithmsLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-[#121018] text-white">
      <main className="flex-grow overflow-hidden">
        <section className="relative isolate border-b border-white/10 px-4">
          <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
          <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[30rem] w-[34rem] rounded-r-full bg-[#f59e0b]/10 blur-3xl" />

          <div className="container grid min-h-[calc(100svh-3.5rem)] gap-10 py-20 lg:grid-cols-[minmax(0,0.66fr)_minmax(280px,0.34fr)] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
                <Compass className="h-4 w-4" />
                Python-алгоритмы
              </div>

              <h1
                className="max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Алгоритмы на задачах, которые удобно решать каждый день
              </h1>

              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
                Python-направление для регулярной практики: строки, массивы, словари, графы,
                динамика и задачи с быстрой серверной проверкой.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-2xl bg-[#ff4fa3] px-6 text-base font-black text-white shadow-lg shadow-pink-950/30 hover:bg-[#ff75b9]"
                >
                  <Link href="/courses/python-algo-fish">
                    <Play className="mr-2 h-4 w-4" />
                    Открыть курс
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-2xl border-white/15 bg-white/[0.04] px-6 text-base font-black text-zinc-100 hover:bg-white/10"
                >
                  <Link href="/explore?language=PYTHON">
                    Все Python-задачи
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 p-5 shadow-2xl shadow-black/30">
              <pre className="ml-auto w-fit select-none font-mono text-sm font-black leading-5 text-[#ff8ecb]/55">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
              <div className="mt-7 grid gap-3">
                {stats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div className="font-mono text-2xl font-black text-[#8ef0de]">{value}</div>
                    <div className="mt-1 text-sm font-semibold text-[#d8d4df]/70">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="container">
            <div className="grid gap-4 lg:grid-cols-3">
              {topics.map(([title, text], index) => {
                const Icon = [Layers, Network, Zap][index] ?? Layers;

                return (
                  <div
                    key={title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#ff8ecb]/35 hover:bg-white/[0.055]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8ef0de] text-[#121018]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#d8d4df]/70">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footsies />
    </div>
  );
}
