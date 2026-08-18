import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { UserAvatar } from '@repo/ui/components/user-avatar';
import { Trophy } from '@repo/ui/icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Лидерборд — Дебаг-Симулятор',
  description: 'Рейтинг участников дебаг-симулятора Ленты.',
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
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-amber-400" />
          <h1
            className="text-3xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            Лидерборд
          </h1>
        </div>

        {participants.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center text-zinc-400">
            Пока никто не набрал очков. Начните с первой задачи в{' '}
            <Link href="/debug-simulator" className="font-semibold text-pink-400 hover:text-pink-300">
              дебаг-симуляторе
            </Link>
            .
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {participants.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <span className="w-8 shrink-0 text-center text-lg font-bold text-zinc-500">
                  {MEDALS[i] ?? i + 1}
                </span>
                <UserAvatar src={p.user.image ?? ''} username={p.user.name} />
                <span className="min-w-0 flex-1 truncate font-semibold">{p.user.name}</span>
                <span className="shrink-0 font-bold text-pink-400">{p.score} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
