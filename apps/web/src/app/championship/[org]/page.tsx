import { Footsies } from '~/components/footsies';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ org: string }>;
}

export default async function OrgChampionshipPage({ params }: PageProps) {
  const { org } = await params;

  // Placeholder logic to verify org exists. In a real app, query the DB.
  const orgName = org.charAt(0).toUpperCase() + org.slice(1);

  return (
    <>
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <header className="w-full border-b border-zinc-800 bg-zinc-900/50 py-4 backdrop-blur-sm">
          <div className="container flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-500">ЛитКот.Чемпионат</span>
              <span className="text-zinc-500">|</span>
              <span className="text-lg font-medium text-white">{orgName}</span>
            </div>
            <nav className="hidden items-center gap-4 text-sm text-zinc-400 md:flex">
              <Link href="#" className="transition-colors hover:text-white">
                Правила
              </Link>
              <Link href="#" className="transition-colors hover:text-white">
                Задачи
              </Link>
              <Link href="#" className="transition-colors hover:text-white">
                Лидерборд
              </Link>
            </nav>
          </div>
        </header>

        <main className="container flex-1 px-4 py-12">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">
              Олимпиада по программированию: <span className="text-amber-500">{orgName}</span>
            </h1>
            <p className="text-lg text-zinc-400">
              Добро пожаловать в изолированную среду соревнования. Решайте задачи, набирайте баллы и
              следите за своим рейтингом в реальном времени.
            </p>

            <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="mb-2 text-xl font-bold text-white">Активные задачи</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-300">
                    <span>1. Разминка кота (Easy)</span>
                    <span className="text-sm text-green-500">100 pts</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-300">
                    <span>2. Поиск миски (Medium)</span>
                    <span className="text-sm text-amber-500">250 pts</span>
                  </li>
                  <li className="flex items-center justify-between text-zinc-300">
                    <span>3. Оптимальный прыжок (Hard)</span>
                    <span className="text-sm text-red-500">500 pts</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full bg-white text-black hover:bg-zinc-200">
                  Перейти к списку
                </Button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="mb-2 text-xl font-bold text-white">Топ участников</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-2">
                      🥇 <span className="font-medium text-white">AlexCoder</span>
                    </span>
                    <span className="text-zinc-400">850 pts</span>
                  </li>
                  <li className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-2">
                      🥈 <span className="font-medium text-white">MeowMaster</span>
                    </span>
                    <span className="text-zinc-400">600 pts</span>
                  </li>
                  <li className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-2">
                      🥉 <span className="font-medium text-white">TopCat</span>
                    </span>
                    <span className="text-zinc-400">350 pts</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Полный лидерборд
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footsies />
    </>
  );
}
