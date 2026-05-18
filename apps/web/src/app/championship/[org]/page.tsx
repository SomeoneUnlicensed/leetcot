import { notFound } from 'next/navigation';
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
            <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-400">
              <Link href="#" className="hover:text-white transition-colors">Правила</Link>
              <Link href="#" className="hover:text-white transition-colors">Задачи</Link>
              <Link href="#" className="hover:text-white transition-colors">Лидерборд</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 container px-4 py-12">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Олимпиада по программированию: <span className="text-amber-500">{orgName}</span>
            </h1>
            <p className="text-lg text-zinc-400">
              Добро пожаловать в изолированную среду соревнования. Решайте задачи, набирайте баллы и следите за своим рейтингом в реальном времени.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 mt-12 text-left">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="text-xl font-bold text-white mb-2">Активные задачи</h3>
                <ul className="space-y-3 mt-4">
                  <li className="flex justify-between items-center text-zinc-300 border-b border-zinc-800 pb-2">
                    <span>1. Разминка кота (Easy)</span>
                    <span className="text-green-500 text-sm">100 pts</span>
                  </li>
                  <li className="flex justify-between items-center text-zinc-300 border-b border-zinc-800 pb-2">
                    <span>2. Поиск миски (Medium)</span>
                    <span className="text-amber-500 text-sm">250 pts</span>
                  </li>
                  <li className="flex justify-between items-center text-zinc-300">
                    <span>3. Оптимальный прыжок (Hard)</span>
                    <span className="text-red-500 text-sm">500 pts</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-white text-black hover:bg-zinc-200">Перейти к списку</Button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="text-xl font-bold text-white mb-2">Топ участников</h3>
                <ul className="space-y-3 mt-4">
                  <li className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-2">🥇 <span className="font-medium text-white">AlexCoder</span></span>
                    <span className="text-zinc-400">850 pts</span>
                  </li>
                  <li className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-2">🥈 <span className="font-medium text-white">MeowMaster</span></span>
                    <span className="text-zinc-400">600 pts</span>
                  </li>
                  <li className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-2">🥉 <span className="font-medium text-white">TopCat</span></span>
                    <span className="text-zinc-400">350 pts</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6 border-zinc-700 text-white hover:bg-zinc-800">Полный лидерборд</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footsies />
    </>
  );
}