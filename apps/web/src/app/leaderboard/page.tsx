import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { Trophy } from '@repo/ui/icons';
import Link from 'next/link';
import { LeaderboardList } from './_components/leaderboard-list';

export const metadata: Metadata = {
  title: 'Лидерборд — Дебаг-Симулятор',
  description: 'Рейтинг участников дебаг-симулятора Lenta tech.',
};

type EventBlock = 'BLOCK_1' | 'BLOCK_2';

interface PageProps {
  searchParams: { block?: string };
}

const BLOCK_LABELS: Record<EventBlock, string> = {
  BLOCK_1: 'Блок 1 · 12:40–13:20',
  BLOCK_2: 'Блок 2 · 17:45–19:00',
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const block = searchParams.block === 'BLOCK_1' || searchParams.block === 'BLOCK_2' ? searchParams.block : null;

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  const participants = championship
    ? await prisma.championshipParticipant.findMany({
        where: { championshipId: championship.id, archived: false, ...(block ? { eventBlock: block } : {}) },
        orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
        include: { user: { select: { name: true, image: true } } },
        take: 100,
      })
    : [];

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#131722]">
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-amber-500" />
          <h1
            className="text-3xl tracking-tight text-[#131722]"
            style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
          >
            Лидерборд
          </h1>
          {block ? <span className="ml-auto text-sm font-semibold text-[#131722]/50">{BLOCK_LABELS[block]}</span> : null}
        </div>

        <div className="mb-6 flex gap-2">
          {(['BLOCK_1', 'BLOCK_2'] as const).map((b) => (
            <Link
              key={b}
              href={`/leaderboard?block=${b}`}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                block === b
                  ? 'border-[#00A0FF] bg-[#00A0FF]/10 text-[#00A0FF]'
                  : 'border-border text-[#131722]/60 hover:text-[#131722]'
              }`}
            >
              {BLOCK_LABELS[b]}
            </Link>
          ))}
        </div>

        <LeaderboardList
          block={block}
          initialParticipants={participants.map((p) => ({
            id: p.id,
            name: p.user.name,
            image: p.user.image,
            score: p.score,
          }))}
        />
      </section>
    </main>
  );
}
