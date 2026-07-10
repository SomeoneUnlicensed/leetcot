import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import { CodeRunnerPage } from './client';

export const metadata: Metadata = buildMetaForDefault({
  title: 'Code Runner | ОГЭ Информатика | ЛитКот',
  description:
    'Практикуйтесь в программировании на Python для задания 16 КИМ ОГЭ по информатике. Пишите код, запускайте, смотрите результат.',
});

export default function OgeCodeRunnerRoute() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
        <CodeRunnerPage />
      </div>
      <Footsies />
    </>
  );
}
