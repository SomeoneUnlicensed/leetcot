import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'ЛитКот.Чемпионат | Платформа для олимпиад',
    description: 'Организуйте хакатоны и олимпиады по программированию на базе ЛитКот.',
  });
}

export default function ChampionshipPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-20 bg-zinc-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                ЛитКот.Чемпионат
              </h1>
              <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
                Профессиональная инфраструктура для проведения ИТ-олимпиад, хакатонов и корпоративных соревнований.
              </p>
            </div>
            
            <div className="w-full max-w-full space-y-4 mx-auto mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                <h3 className="font-bold text-white mb-2">Отдельные инстансы</h3>
                <p className="text-xs text-zinc-400 text-center">Изолированная среда вида leetcot.ru/[название] для вашего события.</p>
              </div>
              <div className="flex flex-col items-center justify-center border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                <h3 className="font-bold text-white mb-2">Античит система</h3>
                <p className="text-xs text-zinc-400 text-center">Продвинутый анализ кода для выявления плагиата и нечестной игры.</p>
              </div>
              <div className="flex flex-col items-center justify-center border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                <h3 className="font-bold text-white mb-2">Live-лидерборды</h3>
                <p className="text-xs text-zinc-400 text-center">Таблицы лидеров в реальном времени для зрителей и участников.</p>
              </div>
              <div className="flex flex-col items-center justify-center border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                <h3 className="font-bold text-white mb-2">API интеграция</h3>
                <p className="text-xs text-zinc-400 text-center">Готовое API для выгрузки результатов в ваши внутренние системы.</p>
              </div>
            </div>

            <div className="mt-12 space-x-4">
              <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl text-lg">
                <Link href="mailto:champ@leetcot.ru">Запросить демо</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footsies />
    </>
  );
}