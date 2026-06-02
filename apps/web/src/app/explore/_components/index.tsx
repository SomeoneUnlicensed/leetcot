import { Suspense } from 'react';
import { Footsies } from '~/components/footsies';
import { ExploreSection } from './explore-section';
import { ExploreSectionSkeleton } from './explore-section-skeleton';
import { ExploreFilterBar } from './explore-filter-bar';
import { getFilteredChallenges, type FilterOptions } from './explore.action';
import { ExploreCard } from './explore-card';
import Link from 'next/link';
import { Language, Difficulty } from '@repo/db/types';

export const dynamic = 'force-dynamic';

interface ExploreProps {
  searchParams: Promise<{
    language?: string;
    difficulty?: string;
    query?: string;
  }>;
}

export async function Explore({ searchParams }: ExploreProps) {
  const { language, difficulty, query } = await searchParams;

  const filters: FilterOptions = {
    language: language as Language,
    difficulty: difficulty as Difficulty,
    query: query,
  };

  const hasFilters = language || difficulty || query;

  if (hasFilters) {
    const challenges = await getFilteredChallenges(filters);
    
    return (
      <>
        <div className="flex flex-col py-8">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Результаты поиска
            </h1>
          </div>
          <ExploreFilterBar />
          <div className="container py-8">
            {challenges.length > 0 ? (
              <div className="flex w-full flex-wrap justify-center gap-6">
                {challenges.map((challenge) => (
                  <Link
                    className="group block w-[95%] focus:outline-none sm:w-[330px] xl:w-[333px]"
                    href={`/challenge/${challenge.slug}`}
                    key={challenge.id}
                  >
                    <ExploreCard challenge={challenge} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-500">
                <p className="text-xl">Мяу! Ничего не нашлось по таким критериям. 😿</p>
                <p>Попробуй изменить фильтры или поисковый запрос.</p>
              </div>
            )}
          </div>
        </div>
        <Footsies />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col py-8">
        <div className="container text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Исследовать задачки
          </h1>
        </div>
        <ExploreFilterBar />
        <div className="flex flex-col gap-8 py-8">
          <Suspense fallback={<ExploreSectionSkeleton />}>
            <ExploreSection
              title="Отлично для новичков"
              tag="BEGINNER"
              redirectRoute="/explore/beginner"
            />
          </Suspense>
          <Suspense fallback={<ExploreSectionSkeleton />}>
            <ExploreSection title="Для тех, кто учится" tag="EASY" redirectRoute="/explore/easy" />
          </Suspense>
          <Suspense fallback={<ExploreSectionSkeleton />}>
            <ExploreSection
              title="Для энтузиастов"
              tag="MEDIUM"
              redirectRoute="/explore/medium"
            />
          </Suspense>
          <Suspense fallback={<ExploreSectionSkeleton />}>
            <ExploreSection title="Для экспертов" tag="HARD" redirectRoute="/explore/hard" />
          </Suspense>
          <Suspense fallback={<ExploreSectionSkeleton />}>
            <ExploreSection
              title="Для мастеров"
              tag="EXTREME"
              redirectRoute="/explore/extreme"
            />
          </Suspense>
        </div>
      </div>
      <Footsies />
    </>
  );
}
