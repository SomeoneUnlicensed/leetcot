import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, BookOpen, Compass, Play } from '@repo/ui/icons';
import Link from 'next/link';
import { auth } from '~/server/auth';

const quickLinks = [
  { label: 'Алгоритмы', href: '/algorithms' },
  { label: 'SQL-рыбалка', href: '/courses/sql-cat-tables' },
  { label: 'Все задачи', href: '/explore' },
];

export async function Hero() {
  const session = await auth();

  return (
    <section className="relative overflow-hidden border-b border-zinc-900 bg-[#0b0b10] px-4 text-white">
      <div className="pointer-events-none absolute right-[8%] top-28 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-28 left-[12%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container relative py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.82fr_0.18fr]">
          <div className="max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-pink-400/25 bg-zinc-950 px-3 py-2 font-mono text-sm font-bold text-pink-300">
              <BookOpen className="h-4 w-4" />
              ЛитКот · практика с характером
            </div>

            <h1 className="max-w-5xl font-sans text-5xl font-extrabold leading-[1.04] tracking-normal sm:text-6xl lg:text-7xl">
              Учитесь кодить на задачах, которые не хочется бросить на середине
            </h1>

            <p className="mt-8 max-w-2xl text-lg font-medium leading-8 text-zinc-400 sm:text-xl">
              Алгоритмы, SQL, треки и обсуждения решений на русском языке. Коты остаются в тоне
              продукта: помогают запомнить ЛитКот, но не мешают практике.
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

          <div className="hidden justify-end lg:flex">
            <pre className="select-none font-mono text-xs font-black leading-4 text-pink-400/45">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-zinc-900 pt-8 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['250+', 'задач и тем'],
              ['Python, SQL', 'уже доступны'],
              ['мяу', 'фирменный тон'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
                <p className="font-mono text-2xl font-black text-pink-300">{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-start justify-start gap-3 lg:justify-end">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-300 transition hover:border-pink-400/40 hover:text-pink-200"
              >
                <Play className="h-4 w-4 text-pink-400" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
