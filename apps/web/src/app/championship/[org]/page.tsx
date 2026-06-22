import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@repo/db';
import { Button } from '@repo/ui/components/button';
import { Footsies } from '~/components/footsies';
import { auth } from '~/server/auth';
import { JoinChampionshipButton } from './_components/join-championship-button';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ org: string }>;
}

const difficultyPoints: Record<string, number> = {
  BEGINNER: 50,
  EASY: 100,
  MEDIUM: 250,
  HARD: 500,
  EXTREME: 1000,
  EVENT: 200,
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'text-sky-400',
  EASY: 'text-green-400',
  MEDIUM: 'text-amber-400',
  HARD: 'text-orange-500',
  EXTREME: 'text-red-500',
  EVENT: 'text-purple-400',
};

const medals = ['🥇', '🥈', '🥉'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { org } = await params;
  const championship = await prisma.championship.findUnique({ where: { slug: org } });
  if (!championship) return { title: 'Чемпионат не найден' };
  return {
    title: `${championship.name} | ЛитКот.Чемпионат`,
    description: championship.description,
  };
}

export default async function OrgChampionshipPage({ params }: PageProps) {
  const { org } = await params;
  const session = await auth();

  const championship = await prisma.championship.findUnique({
    where: { slug: org },
    include: {
      challenges: {
        include: {
          challenge: {
            select: {
              id: true,
              name: true,
              slug: true,
              difficulty: true,
            },
          },
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { score: 'desc' },
        take: 20,
      },
    },
  });

  if (!championship) return notFound();

  const isParticipant =
    session?.user?.id && championship.participants.some((p) => p.userId === session.user.id);

  const isActive = championship.status === 'ACTIVE';
  const isPast = championship.status === 'PAST';

  const now = new Date();
  const daysLeft =
    isActive && championship.endDate
      ? Math.max(0, Math.ceil((championship.endDate.getTime() - now.getTime()) / 86400000))
      : null;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-zinc-950">
        {/* Header */}
        <header className="w-full border-b border-zinc-800 bg-zinc-900/60 py-4 backdrop-blur-sm">
          <div className="container flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Link
                href="/championship"
                className="text-xl font-bold text-amber-500 transition-colors hover:text-amber-400"
              >
                ЛитКот.Чемпионат
              </Link>
              <span className="text-zinc-600">|</span>
              <span className="text-lg font-medium text-white">{championship.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? 'bg-green-900/50 text-green-400'
                    : isPast
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-amber-900/50 text-amber-400'
                }`}
              >
                {isActive ? 'Активен' : isPast ? 'Завершён' : 'Скоро'}
              </span>
            </div>
          </div>
        </header>

        <main className="container flex-1 px-4 py-10">
          {/* Hero section */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
              {championship.name}
            </h1>
            {championship.description ? (
              <p className="mb-6 text-lg text-zinc-400">{championship.description}</p>
            ) : null}

            <div className="mb-6 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
              <span>
                📅 Начало:{' '}
                {new Date(championship.startDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span>
                🏁 Конец:{' '}
                {new Date(championship.endDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {daysLeft !== null ? (
                <span className="font-semibold text-amber-400">⏳ Осталось {daysLeft} дн.</span>
              ) : null}
              <span>👥 {championship.participants.length} участников</span>
            </div>

            {isActive && session?.user && !isParticipant ? (
              <JoinChampionshipButton championshipId={championship.id} />
            ) : null}
            {isParticipant ? (
              <div className="inline-block rounded-xl bg-green-900/30 px-6 py-2 text-sm font-medium text-green-400">
                ✅ Вы участвуете в этом чемпионате
              </div>
            ) : null}
            {!session?.user && isActive ? (
              <Link href="/login">
                <Button className="bg-amber-500 text-black hover:bg-amber-400">
                  Войти чтобы участвовать
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {/* Challenges */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                🎯 Задачи чемпионата ({championship.challenges.length})
              </h2>
              {championship.challenges.length === 0 ? (
                <p className="text-sm text-zinc-500">Задачи ещё не добавлены</p>
              ) : (
                <ul className="space-y-3">
                  {championship.challenges.map(({ challenge }, i) => (
                    <li
                      key={challenge.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-600">{i + 1}.</span>
                        <Link
                          href={`/challenge/${challenge.slug}`}
                          className="font-medium text-white transition-colors hover:text-amber-400"
                        >
                          {challenge.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium ${difficultyColors[challenge.difficulty] ?? 'text-zinc-400'}`}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {difficultyPoints[challenge.difficulty] ?? 100} pts
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Leaderboard */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">🏆 Лидерборд</h2>
              {championship.participants.length === 0 ? (
                <p className="text-sm text-zinc-500">Пока нет участников</p>
              ) : (
                <ul className="space-y-3">
                  {championship.participants.map((p, i) => (
                    <li
                      key={p.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        session?.user?.id === p.userId
                          ? 'border-amber-700/50 bg-amber-900/10'
                          : 'border-zinc-800 bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-lg">{medals[i] ?? `#${i + 1}`}</span>
                        {p.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.user.image}
                            alt={p.user.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
                            {p.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`font-medium ${session?.user?.id === p.userId ? 'text-amber-400' : 'text-white'}`}
                        >
                          {p.user.name}
                          {session?.user?.id === p.userId && (
                            <span className="ml-1 text-xs text-zinc-500">(вы)</span>
                          )}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-zinc-300">{p.score} pts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footsies />
    </>
  );
}
