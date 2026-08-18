import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { UserAvatar } from '@repo/ui/components/user-avatar';
import { Trophy } from '@repo/ui/icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Лидерборд — Дебаг-Симулятор',
  description: 'Рейтинг участников дебаг-симулятора Lenta tech.',
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default async function LeaderboardPage() {
  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  const participants = championship
    ? await prisma.championshipParticipant.findMany({
        where: { championshipId: championship.id },
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
        </div>

        {participants.length === 0 ? (
          <div className="border-border rounded-2xl border bg-white p-8 text-center text-[#131722]/60">
            Пока никто не набрал очков. Начните с первой задачи в{' '}
            <Link href="/debug-simulator" className="font-semibold text-[#00A0FF] hover:text-[#0090e6]">
              дебаг-симуляторе
            </Link>
            .
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {participants.map((p, i) => (
              <li
                key={p.id}
                className="border-border flex items-center gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm"
              >
                <span className="w-8 shrink-0 text-center text-lg font-bold text-[#131722]/40">
                  {MEDALS[i] ?? i + 1}
                </span>
                <UserAvatar src={p.user.image ?? ''} username={p.user.name} />
                <span className="min-w-0 flex-1 truncate font-semibold text-[#131722]">{p.user.name}</span>
                <span className="shrink-0 font-bold text-[#00A0FF]">{p.score} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
