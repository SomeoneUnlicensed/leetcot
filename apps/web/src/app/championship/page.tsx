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
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none">
                ЛитКот.Чемпионат
              </h1>
              <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
                Профессиональная инфраструктура для проведения ИТ-олимпиад, хакатонов и
                корпоративных соревнований.
              </p>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-full gap-8 space-y-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-2 font-bold text-white">Отдельные инстансы</h3>
                <p className="text-center text-xs text-zinc-400">
                  Изолированная среда вида leetcot.ru/[название] для вашего события.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-2 font-bold text-white">Античит система</h3>
                <p className="text-center text-xs text-zinc-400">
                  Продвинутый анализ кода для выявления плагиата и нечестной игры.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-2 font-bold text-white">Live-лидерборды</h3>
                <p className="text-center text-xs text-zinc-400">
                  Таблицы лидеров в реальном времени для зрителей и участников.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="mb-2 font-bold text-white">API интеграция</h3>
                <p className="text-center text-xs text-zinc-400">
                  Готовое API для выгрузки результатов в ваши внутренние системы.
                </p>
              </div>
            </div>

            <div className="mt-12 space-x-4">
              <Button
                asChild
                className="rounded-xl bg-amber-600 px-8 py-3 text-lg font-bold text-white hover:bg-amber-700"
              >
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
