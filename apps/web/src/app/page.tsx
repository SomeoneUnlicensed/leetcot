import type { Metadata } from 'next';
import { Button } from '@repo/ui/components/button';
import { ShieldAlert, Trophy } from '@repo/ui/icons';
import Link from 'next/link';
import { Footsies } from '~/components/footsies';
import { auth } from '~/server/auth';
import { SITE_URL, buildMetaForDefault } from './metadata';

const tagline = 'Дебаг-симулятор Ленты — живой сервер, реальные инциденты, один флаг за задачу.';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Дебаг-Симулятор — Лента',
    description: tagline,
  });
}

export default async function Index() {
  const session = await auth();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Дебаг-Симулятор Ленты',
    url: SITE_URL,
    inLanguage: 'ru-RU',
    description: tagline,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative isolate overflow-hidden bg-[#121018] px-4 text-white">
        <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
        <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />

        <div className="container relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
            <ShieldAlert className="h-4 w-4" />
            только для приглашённых участников
          </div>

          <h1
            className="max-w-3xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            Дебаг-Симулятор
          </h1>

          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
            {tagline} Регистрация — только по приглашению, которое вам уже прислали организаторы.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-2xl bg-[#ff4fa3] px-6 text-base font-black text-white shadow-lg shadow-pink-950/30 hover:bg-[#ff75b9]"
            >
              <Link href={session ? '/debug-simulator' : '/register'}>
                {session ? 'К задачам' : 'Зарегистрироваться'}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-2xl border-white/20 bg-transparent px-6 text-base font-black text-white hover:bg-white/10"
            >
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                Лидерборд
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footsies />
    </>
  );
}
