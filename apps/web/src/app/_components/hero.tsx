import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, BookOpen, Compass } from '@repo/ui/icons';
import Link from 'next/link';
import { auth } from '~/server/auth';

export async function Hero() {
  const session = await auth();

  return (
    <section className="relative isolate bg-[#0b0b10] px-4 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-pink-500/10 to-transparent" />
      <div className="pointer-events-none absolute right-[8%] top-24 -z-10 h-80 w-80 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-[8%] -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center pb-16 pt-14 sm:pb-20 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(220px,0.28fr)]">
          <div className="max-w-5xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-xl border border-pink-400/25 bg-zinc-950/80 px-3 py-2 font-mono text-sm font-bold text-pink-300 shadow-2xl shadow-pink-950/10">
              <BookOpen className="h-4 w-4" />
              ЛитКот · задачи под присмотром кота
            </div>

            <h1 className="max-w-5xl text-balance font-sans text-5xl font-extrabold leading-[1.03] tracking-normal sm:text-6xl lg:text-[5.25rem]">
              Учитесь кодить на задачах, которые не хочется бросить на середине
            </h1>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-zinc-400 sm:text-xl">
              Алгоритмы, SQL, Python-треки и обсуждения решений на русском языке. ЛитКот держит
              маршрут аккуратным: выбрали тему, решили задачу, вернулись к прогрессу.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-xl bg-pink-500 px-6 text-base font-bold text-white hover:bg-pink-400"
              >
                <Link href={session ? '/explore' : '/register'}>
                  <Compass className="mr-2 h-4 w-4" />
                  {session ? 'Открыть задачи' : 'Начать практику'}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-zinc-700 bg-zinc-950 px-6 text-base font-bold text-zinc-100 hover:bg-zinc-900"
              >
                <Link href="/algorithms">
                  Посмотреть алгоритмы
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden h-full items-center justify-end lg:flex">
            <div className="max-w-64 border-l border-pink-400/15 pl-8">
              <pre className="select-none font-mono text-sm font-black leading-5 text-pink-400/55">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Кот не решает за вас, но держит рядом задачи, курсы и проверки.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-pink-400/20 to-transparent" />
    </section>
  );
}
