import { Button } from '@repo/ui/components/button';
import Image from 'next/image';
import Link from 'next/link';
import { getRandomChallenge } from '~/utils/server/get-random-challenge';

export const dynamic = 'force-dynamic';

export default async function NotFound() {
  const randomChallengeSlug = await getRandomChallenge();

  return (
    <>
      <div className="relative -mt-[56px] flex h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4">
        <Image
          className="opacity-20 transition-opacity duration-500 hover:opacity-40"
          alt="ЛитКот"
          src="/favicon.svg"
          height="120"
          width="120"
        />
        <div className="stars absolute -left-full -z-50 mt-[56px] h-screen w-[200%]" />
        <div className="stars absolute -left-full -z-40 mt-[56px] h-1/2 w-[400%] scale-[2]" />
        <div className="stars absolute -left-full -z-30 mt-[56px] h-1/3 w-[600%] scale-[3]" />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="font-sans text-8xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent opacity-80 md:text-9xl">
            404
          </h1>
          <p className="px-6 text-center font-sans text-base text-zinc-400 md:px-0 md:text-lg">
            Упс! Страница, которую вы ищете, не существует.
          </p>
        </div>
        
        {randomChallengeSlug !== null ? (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/explore">
              <Button className="w-56" variant="default" size="lg">
                К списку задач
              </Button>
            </Link>
            <Link href={`/challenge/${randomChallengeSlug}`}>
              <Button
                variant="outline"
                size="lg"
                className="w-56 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Мне повезёт!
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <Link href="/">
              <Button variant="default" size="lg" className="w-56">
                На главную
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
