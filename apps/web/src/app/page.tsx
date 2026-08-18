import type { Metadata } from 'next';
import { Button } from '@repo/ui/components/button';
import { Shield, Trophy } from '@repo/ui/icons';
import Image from 'next/image';
import Link from 'next/link';
import { Footsies } from '~/components/footsies';
import { auth } from '~/server/auth';
import { SITE_URL, buildMetaForDefault } from './metadata';

const tagline = 'Дебаг-симулятор Lenta tech — живой сервер, реальные инциденты, один флаг за задачу.';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Дебаг-Симулятор — Lenta tech',
    description: tagline,
  });
}

export default async function Index() {
  const session = await auth();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Дебаг-Симулятор Lenta tech',
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
      <section className="relative isolate overflow-hidden bg-white px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[26rem] w-[26rem] rounded-full border-[3.5rem] border-[#00A0FF]/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full border-[3rem] border-[#00A0FF]/10"
        />

        <div className="container relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-16 text-center">
          <Image
            src="/lentatech-logo-color.png"
            alt="Lenta tech"
            width={220}
            height={44}
            className="mb-8 h-9 w-auto sm:h-10"
            priority
          />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00A0FF]/25 bg-[#00A0FF]/[0.06] px-4 py-2 text-sm font-bold text-[#003C96]">
            <Shield className="h-4 w-4" />
            только для приглашённых участников
          </div>

          <h1
            className="max-w-3xl text-balance text-4xl leading-[1.14] tracking-tight text-[#131722] sm:text-5xl"
            style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
          >
            Дебаг-Симулятор
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[#131722]/65 sm:text-lg">
            {tagline} Вход — по коду доступа, который вам уже выдали организаторы.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-2xl bg-[#00A0FF] px-6 text-base font-bold text-white shadow-lg shadow-[#00A0FF]/25 hover:bg-[#0090e6]"
            >
              <Link href={session ? '/debug-simulator' : '/login'}>
                {session ? 'К задачам' : 'Войти по коду'}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border h-12 rounded-2xl bg-transparent px-6 text-base font-bold text-[#131722] hover:bg-black/[0.03]"
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
