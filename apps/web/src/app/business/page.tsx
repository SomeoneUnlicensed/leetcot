import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'ЛитКот.Бизнес | Корпоративное обучение',
    description: 'Платформа для оценки и развития навыков разработчиков в вашей компании.',
  });
}

export default function BusinessPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none">
                ЛитКот.Бизнес
              </h1>
              <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
                Единая платформа для оценки компетенций, онбординга и непрерывного развития ваших
                разработчиков.
              </p>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-full gap-8 space-y-4 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-xl font-bold text-white">Оценка при найме</h3>
                <p className="text-center text-sm text-zinc-400">
                  Автоматизированные тесты и задачи для проверки реальных навыков кандидатов.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-xl font-bold text-white">Внутреннее обучение</h3>
                <p className="text-center text-sm text-zinc-400">
                  Приватные треки и задачи, адаптированные под стек технологий вашей компании.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-xl font-bold text-white">Аналитика и прогресс</h3>
                <p className="text-center text-sm text-zinc-400">
                  Подробные отчеты о росте компетенций каждого сотрудника в команде.
                </p>
              </div>
            </div>

            <div className="mt-12 space-x-4">
              <Button
                asChild
                className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold text-white hover:bg-blue-700"
              >
                <Link href="mailto:business@leetcot.ru">Связаться с нами</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footsies />
    </>
  );
}
