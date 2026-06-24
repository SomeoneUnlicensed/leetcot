import Link from 'next/link';
import type { Difficulty, Language, Tags } from '@repo/db/types';
import { Badge } from '@repo/ui/components/badge';
import { cn } from '@repo/ui/cn';
import { CheckCircle, MessageCircle, Sparkles, ThumbsUp } from '@repo/ui/icons';
import { Footsies } from '~/components/footsies';
import { ExploreFilterBar } from './explore-filter-bar';
import {
  getFilteredChallenges,
  type FilterOptions,
  type FilteredChallenge,
} from './explore.action';

export const dynamic = 'force-dynamic';

interface ExploreProps {
  searchParams: Promise<{
    language?: string;
    difficulty?: string;
    tag?: string;
    query?: string;
  }>;
}

const difficultyOrder: Difficulty[] = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXTREME', 'EVENT'];

const difficultyLabels: Record<Difficulty, string> = {
  BEGINNER: 'Новичок',
  EASY: 'Лёгкая',
  MEDIUM: 'Средняя',
  HARD: 'Сложная',
  EXTREME: 'Экстрим',
  EVENT: 'Событие',
};

const difficultyStyles: Record<Difficulty, string> = {
  BEGINNER: 'bg-sky-500/15 text-sky-300',
  EASY: 'bg-emerald-500/15 text-emerald-300',
  MEDIUM: 'bg-amber-500/15 text-amber-300',
  HARD: 'bg-rose-500/15 text-rose-300',
  EXTREME: 'bg-violet-500/15 text-violet-300',
  EVENT: 'bg-fuchsia-500/15 text-fuchsia-300',
};

const languageLabels: Record<string, string> = {
  SQL: 'SQL',
  PYTHON: 'Python',
  TYPESCRIPT: 'TypeScript',
  JAVASCRIPT: 'JavaScript',
  GO: 'Go',
};

function sortChallenges(challenges: FilteredChallenge[]) {
  return [...challenges].sort((a, b) => {
    const aSolved = a.submission.length > 0;
    const bSolved = b.submission.length > 0;

    if (aSolved !== bSolved) {
      return Number(aSolved) - Number(bSolved);
    }

    const difficultyDiff =
      difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);

    if (difficultyDiff !== 0) {
      return difficultyDiff;
    }

    return a.name.localeCompare(b.name, 'ru');
  });
}

function getSummary(challenges: FilteredChallenge[]) {
  return difficultyOrder
    .filter((difficulty) => difficulty !== 'EVENT')
    .map((difficulty) => {
      const group = challenges.filter((challenge) => challenge.difficulty === difficulty);
      const completed = group.filter((challenge) => challenge.submission.length > 0).length;
      return { completed, difficulty, total: group.length };
    });
}

function ChallengeRow({ challenge, index }: { challenge: FilteredChallenge; index: number }) {
  const hasBeenSolved = challenge.submission.length > 0;

  return (
    <Link
      href={`/challenge/${challenge.slug}`}
      className="group flex min-h-16 items-center gap-4 rounded-xl bg-zinc-900/75 px-4 py-3 outline-none ring-1 ring-inset ring-zinc-800/80 transition hover:bg-zinc-800/80 hover:ring-zinc-700 focus-visible:ring-2 focus-visible:ring-pink-500"
    >
      <div className="flex w-10 shrink-0 items-center justify-center text-sm font-semibold tabular-nums text-zinc-500">
        {hasBeenSolved ? (
          <CheckCircle className="h-5 w-5 text-emerald-300" />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-zinc-100 transition group-hover:text-white">
          {challenge.name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span>{languageLabels[challenge.language] ?? challenge.language}</span>
          <span>от {challenge.user.name === 'Администратор' ? 'ЛитКот' : challenge.user.name}</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {challenge._count.comment}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {challenge._count.vote}
          </span>
        </div>
      </div>

      <Badge
        className={cn(
          'shrink-0 rounded-lg px-3 py-1 text-sm font-semibold',
          difficultyStyles[challenge.difficulty],
        )}
      >
        {difficultyLabels[challenge.difficulty]}
      </Badge>
    </Link>
  );
}

export async function Explore({ searchParams }: ExploreProps) {
  const { language, difficulty, tag, query } = await searchParams;

  const filters: FilterOptions = {
    difficulty: difficulty as Difficulty,
    language: language as Language,
    query,
    tag: tag as Tags,
  };

  const challenges = sortChallenges(await getFilteredChallenges(filters));
  const summary = getSummary(challenges);
  const completedTotal = challenges.filter((challenge) => challenge.submission.length > 0).length;
  const randomChallenge = challenges.find((challenge) => challenge.submission.length === 0);

  return (
    <>
      <main className="container pb-10 pt-6">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
                  Задачи <span className="ml-2 text-xl text-zinc-500">{challenges.length}</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Быстрый каталог задач ЛитКота: ищите по названию, языку и сложности, затем
                  переходите сразу к решению.
                </p>
              </div>
              {randomChallenge ? (
                <Link
                  href={`/challenge/${randomChallenge.slug}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-violet-300 ring-1 ring-inset ring-zinc-800 transition hover:bg-zinc-800 hover:text-violet-200"
                >
                  <Sparkles className="h-4 w-4" />
                  Случайная
                </Link>
              ) : null}
            </div>

            <ExploreFilterBar />

            <div className="mt-5 space-y-2">
              {challenges.length > 0 ? (
                challenges.map((challenge, index) => (
                  <ChallengeRow key={challenge.id} challenge={challenge} index={index} />
                ))
              ) : (
                <div className="rounded-xl bg-zinc-900/75 px-6 py-12 text-center ring-1 ring-inset ring-zinc-800">
                  <div className="text-lg font-semibold text-zinc-100">Ничего не нашлось</div>
                  <p className="mt-2 text-sm text-zinc-500">
                    Попробуйте изменить запрос, язык или сложность.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-zinc-900/75 p-5 ring-1 ring-inset ring-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Задач решено</h2>
              <div className="mt-5 space-y-4">
                {summary.map(({ completed, difficulty, total }) => (
                  <div key={difficulty}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-zinc-300">
                        {difficultyLabels[difficulty]}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {completed} из {total}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          difficultyStyles[difficulty].split(' ')[0],
                        )}
                        style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-zinc-800 pt-4 text-sm text-zinc-500">
                Всего в выборке: {completedTotal} из {challenges.length}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footsies />
    </>
  );
}
