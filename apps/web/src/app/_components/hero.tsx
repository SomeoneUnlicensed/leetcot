import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, BookOpen, Code, Compass } from '@repo/ui/icons';
import Link from 'next/link';
import { auth } from '~/server/auth';

export async function Hero() {
  const session = await auth();

  return (
    <section className="relative isolate overflow-hidden bg-[#121018] px-4 text-white">
      <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
      <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[30rem] w-[34rem] rounded-r-full bg-[#f59e0b]/10 blur-3xl" />

      <div className="container relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-center pb-20 pt-12 sm:pb-24 sm:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.66fr)_minmax(280px,0.34fr)]">
          <div className="max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
              <BookOpen className="h-4 w-4" />
              задачи, курсы и автопроверка
            </div>

            <h1
              className="max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              Решайте задачки, которые не хочется бросать на середине
            </h1>

            <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
              Алгоритмы, SQL-рыбалка и Go-треки с котячьими сюжетами, быстрой проверкой и
              прогрессом в профиле. ЛитКот держит темп, а не душит лекциями.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-2xl bg-[#ff4fa3] px-6 text-base font-black text-white shadow-lg shadow-pink-950/30 hover:bg-[#ff75b9]"
              >
                <Link href={session ? '/explore' : '/register'}>
                  <Compass className="mr-2 h-4 w-4" />
                  {session ? 'Открыть задачи' : 'Начать практику'}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-white/[0.04] px-6 text-base font-black text-zinc-100 hover:bg-white/10"
              >
                <Link href="/algorithms">
                  Посмотреть алгоритмы
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden h-full items-center justify-end lg:flex">
            <div className="w-full max-w-[22rem]">
              <pre className="ml-auto w-fit select-none font-mono text-sm font-black leading-5 text-[#ff8ecb]/55">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
              <div className="mt-7 rounded-[1.75rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 p-5 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8ef0de] text-[#121018]">
                    <Code className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#e9f6a8] px-3 py-1 text-sm font-black text-[#121018]">
                    новый курс
                  </span>
                </div>
                <h2
                  className="mt-6 text-3xl leading-none tracking-normal"
                  style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
                >
                  Go для сервисных задач
                </h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#d8d4df]/75">
                  6 задач на функции, слайсы, map, ошибки и базовую логику сервисов.
                </p>
                <Button
                  asChild
                  className="mt-6 h-11 rounded-2xl bg-[#8ef0de] px-5 text-sm font-black text-[#121018] hover:bg-[#a8fff0]"
                >
                  <Link href="/courses/golang-start">
                    Открыть Go
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-[#ff8ecb]/25 to-transparent" />
    </section>
  );
}
